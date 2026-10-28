import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { isAdmin } from "@/app/lib/adminAuth";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function GET(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await serviceClient()
    .from("admin_notifications")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    (data || []).map((n) => ({
      id: n.id,
      type: n.type,
      orderId: n.order_id,
      clientName: n.client_name,
      text: n.text,
      timestamp: n.timestamp,
      read: n.read,
    }))
  );
}
