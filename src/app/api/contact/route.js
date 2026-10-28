import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export async function POST(req) {
  try {
    const { name, email, brokerage, plan, notes } = await req.json();
    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD are not configured");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    const fields = [
      ["Name", name],
      ["Email", email],
      ["Business / Brokerage", brokerage],
      ["Interested In", plan],
      ["Notes", notes],
    ];

    await transporter.sendMail({
      from: `"Elevate Website" <${user}>`,
      to: process.env.CONTACT_TO_EMAIL || user,
      replyTo: `"${name.replace(/"/g, "")}" <${email}>`,
      subject: `New inquiry from ${name}${plan ? ` — ${plan}` : ""}`,
      text: fields.map(([k, v]) => `${k}: ${v || "—"}`).join("\n"),
      html: `<h2 style="font-family:sans-serif">New website inquiry</h2>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
${fields
  .map(
    ([k, v]) =>
      `<tr><td style="padding:6px 16px 6px 0;font-weight:bold;vertical-align:top">${k}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(v) || "—"}</td></tr>`
  )
  .join("\n")}
</table>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Sorry, your message couldn't be sent. Please email colt@elevateyourmarketing.org directly." },
      { status: 500 }
    );
  }
}
