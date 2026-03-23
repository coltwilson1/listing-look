import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { flattenUpdates } from "@/app/lib/orderUtils";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin2025";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function isAdmin(req) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function PATCH(req, { params }) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const updates = await req.json();
  const dbUpdates = flattenUpdates(updates);

  if (Object.keys(dbUpdates).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await serviceClient()
    .from("orders")
    .update(dbUpdates)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
