import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { isAdmin } from "@/app/lib/adminAuth";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await serviceClient()
    .from("admin_notifications")
    .update({ read: true })
    .eq("read", false);

  return NextResponse.json({ ok: true });
}
