import { createHmac, timingSafeEqual } from "crypto";

// Server-only admin auth. The password lives only in the ADMIN_PASSWORD env var;
// the browser gets an httpOnly session cookie derived from it, never the password.
// Changing ADMIN_PASSWORD signs out every existing admin session.

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function sessionToken() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("elevate-admin-session").digest("hex");
}

// Secret key in the private Brand Discovery link (/brand-discovery/<key>).
// Derived from ADMIN_PASSWORD, so changing that password also retires old links.
export function questionnaireKey() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHmac("sha256", pw).update("elevate-brand-discovery").digest("hex").slice(0, 24);
}

export function checkQuestionnaireKey(key) {
  const expected = questionnaireKey();
  return Boolean(expected) && safeEqual(key ?? "", expected);
}

export function checkPassword(pw) {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(pw ?? "", expected);
}

export function isAdmin(req) {
  const token = sessionToken();
  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  return Boolean(token && cookie) && safeEqual(cookie, token);
}
