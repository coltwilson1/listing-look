import { createClient } from "@supabase/supabase-js";

// Brand Discovery submissions are stored as JSON files in a private Supabase
// Storage bucket (created on first use), so no database table is required.
const BUCKET = "brand-questionnaires";

export function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function ensureBucket(sb) {
  const { error } = await sb.storage.getBucket(BUCKET);
  if (error) await sb.storage.createBucket(BUCKET, { public: false });
}

export async function saveSubmission(submission) {
  const sb = serviceClient();
  await ensureBucket(sb);
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(`${submission.id}.json`, JSON.stringify(submission), { contentType: "application/json" });
  if (error) throw error;
}

export async function listSubmissions() {
  const sb = serviceClient();
  await ensureBucket(sb);
  const { data: files, error } = await sb.storage.from(BUCKET).list("", { limit: 500 });
  if (error) throw error;
  const subs = await Promise.all(
    files
      .filter((f) => f.name.endsWith(".json"))
      .map(async (f) => {
        const { data } = await sb.storage.from(BUCKET).download(f.name);
        try { return data ? JSON.parse(await data.text()) : null; } catch { return null; }
      })
  );
  return subs.filter(Boolean).sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
}
