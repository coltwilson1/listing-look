import nodemailer from "nodemailer";

const escapeHtml = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Emails a set of [label, value] rows to the site inbox via Google Workspace SMTP.
export async function sendFormEmail({ subject, heading, fields, replyName, replyEmail }) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error("GMAIL_USER / GMAIL_APP_PASSWORD are not configured");

  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });

  await transporter.sendMail({
    from: `"Elevate Website" <${user}>`,
    to: process.env.CONTACT_TO_EMAIL || user,
    replyTo: replyEmail ? `"${String(replyName || "").replace(/"/g, "")}" <${replyEmail}>` : undefined,
    subject,
    text: fields.map(([k, v]) => `${k}: ${v || "—"}`).join("\n"),
    html: `<h2 style="font-family:sans-serif">${escapeHtml(heading)}</h2>
<table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
${fields
  .map(
    ([k, v]) =>
      `<tr><td style="padding:6px 16px 6px 0;font-weight:bold;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(v) || "—"}</td></tr>`
  )
  .join("\n")}
</table>`,
  });
}
