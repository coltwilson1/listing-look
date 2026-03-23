import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(req) {
  // Verify the user's JWT
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = serviceClient();

  const { data: { user }, error: authErr } = await sb.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  const field = formData.get("field"); // "headshot" | "logo" | "personalLogo"

  if (!file || !field) return NextResponse.json({ error: "Missing file or field" }, { status: 400 });

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${field}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadErr } = await sb.storage
    .from("agent-profiles")
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { data: { publicUrl } } = sb.storage.from("agent-profiles").getPublicUrl(path);

  // Map JS field name → DB column name
  const colMap = { headshot: "headshot", logo: "logo", personalLogo: "personal_logo" };
  const col = colMap[field];
  if (!col) return NextResponse.json({ error: "Invalid field" }, { status: 400 });

  const { error: profileErr } = await sb.from("profiles").update({ [col]: publicUrl }).eq("id", user.id);
  if (profileErr) {
    console.error("Failed to save profile URL:", profileErr.message);
    return NextResponse.json({ error: `Profile update failed: ${profileErr.message}` }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl });
}
