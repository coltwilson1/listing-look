import { NextResponse } from "next/server";
import { isAdmin, questionnaireKey } from "@/app/lib/adminAuth";
import { listSubmissions } from "@/app/lib/questionnaireStore";

export async function GET(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const origin = new URL(req.url).origin;
  const link = `${origin}/brand-discovery/${questionnaireKey()}`;
  try {
    return NextResponse.json({ link, submissions: await listSubmissions() });
  } catch (err) {
    console.error("Questionnaire list failed:", err);
    return NextResponse.json({ link, submissions: [], error: err.message || "Could not load submissions" });
  }
}
