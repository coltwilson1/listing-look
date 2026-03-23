import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { expandOrder } from "@/app/lib/orderUtils";

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

export async function GET(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = serviceClient();
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Collect unique user IDs and fetch their profiles in one query
  const userIds = [...new Set((data || []).map((o) => o.user_id).filter(Boolean))];
  let profileMap = {};
  if (userIds.length > 0) {
    const { data: profiles } = await sb
      .from("profiles")
      .select("id, headshot, logo, personal_logo")
      .in("id", userIds);
    (profiles || []).forEach((p) => { profileMap[p.id] = p; });
  }

  const orders = (data || []).map((row) => {
    const profile = profileMap[row.user_id] || {};
    return {
      ...expandOrder(row),
      clientHeadshot:    profile.headshot     || null,
      clientLogo:        profile.logo         || null,
      clientPersonalLogo: profile.personal_logo || null,
    };
  });

  return NextResponse.json(orders);
}
