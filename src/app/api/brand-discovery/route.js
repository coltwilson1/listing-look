import { NextResponse } from "next/server";
import { checkQuestionnaireKey } from "@/app/lib/adminAuth";
import { sendFormEmail } from "@/app/lib/mailer";
import { saveSubmission, serviceClient } from "@/app/lib/questionnaireStore";
import { ALL_FIELDS, answerRows } from "@/app/brand-discovery/questions";

const MAX_BODY = 50_000;

export async function POST(req) {
  const raw = await req.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ error: "Submission is too large." }, { status: 413 });

  let body;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid submission." }, { status: 400 }); }
  const { key, answers = {}, company } = body;

  if (!checkQuestionnaireKey(key)) return NextResponse.json({ error: "This link is no longer valid." }, { status: 404 });
  // Honeypot: real visitors never see or fill the "company" field.
  if (company) return NextResponse.json({ ok: true });

  // Keep only known questions, trimmed to sane lengths.
  const clean = {};
  for (const f of ALL_FIELDS) {
    const v = answers[f.name];
    if (Array.isArray(v)) clean[f.name] = v.filter((x) => f.options?.includes(x));
    else if (v != null) clean[f.name] = String(v).slice(0, 4000).trim();
  }
  const missing = ALL_FIELDS.filter((f) => f.required && !(Array.isArray(clean[f.name]) ? clean[f.name].length : clean[f.name]));
  if (missing.length) {
    return NextResponse.json({ error: `Please complete: ${missing.map((f) => f.label).join(", ")}` }, { status: 400 });
  }

  const submission = {
    id: `bd-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 8)}`,
    submittedAt: new Date().toISOString(),
    answers: clean,
  };

  // Save and email independently — succeed if at least one lands.
  const [saved, emailed] = await Promise.allSettled([
    saveSubmission(submission),
    sendFormEmail({
      subject: `Brand Discovery: ${clean.name}${clean.brokerage ? ` — ${clean.brokerage}` : ""}`,
      heading: "New Brand Discovery Questionnaire",
      replyName: clean.name,
      replyEmail: clean.email,
      fields: answerRows(clean),
    }),
  ]);
  if (saved.status === "rejected") console.error("Brand discovery save failed:", saved.reason);
  if (emailed.status === "rejected") console.error("Brand discovery email failed:", emailed.reason);
  if (saved.status === "rejected" && emailed.status === "rejected") {
    return NextResponse.json(
      { error: "Sorry, we couldn't send your answers. Please try again or email colt@elevateyourmarketing.org." },
      { status: 500 }
    );
  }

  await serviceClient()
    .from("admin_notifications")
    .insert({
      id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      type: "questionnaire",
      order_id: submission.id,
      client_name: clean.name,
      text: `Brand Discovery questionnaire from ${clean.name}`,
      timestamp: submission.submittedAt,
      read: false,
    })
    .then(({ error }) => error && console.error("Notification insert failed:", error), (e) => console.error(e));

  return NextResponse.json({ ok: true });
}
