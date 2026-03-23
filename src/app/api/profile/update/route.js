import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(req) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = serviceClient();

  const { data: { user }, error: authErr } = await sb.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, brokerage, mobilePhone, officePhone } = await req.json();

  // Update profiles table
  const profileUpdates = {};
  if (name        !== undefined) profileUpdates.name         = name;
  if (brokerage   !== undefined) profileUpdates.brokerage    = brokerage;
  if (mobilePhone !== undefined) profileUpdates.mobile_phone = mobilePhone;
  if (officePhone !== undefined) profileUpdates.office_phone = officePhone;

  if (Object.keys(profileUpdates).length > 0) {
    await sb.from("profiles").update(profileUpdates).eq("id", user.id);
  }

  // Sync matching fields to all orders for this user
  const orderUpdates = {};
  if (name        !== undefined) orderUpdates.client_name         = name;
  if (brokerage   !== undefined) orderUpdates.client_brokerage    = brokerage;
  if (mobilePhone !== undefined) orderUpdates.client_mobile_phone = mobilePhone;
  if (officePhone !== undefined) orderUpdates.client_office_phone = officePhone;

  if (Object.keys(orderUpdates).length > 0) {
    await sb.from("orders").update(orderUpdates).eq("user_id", user.id);
  }

  return NextResponse.json({ ok: true });
}
