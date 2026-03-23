import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { flattenOrder } from "@/app/lib/orderUtils";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(req) {
  const { order, clientName, clientEmail, clientPhone } = await req.json();
  if (!order?.id) return NextResponse.json({ error: "Missing order" }, { status: 400 });

  const supabase = serviceClient();

  const { error: orderError } = await supabase.from("orders").insert({
    ...flattenOrder(order),
    user_id: null,
    client_name: clientName || "",
    client_email: (clientEmail || "").toLowerCase(),
    client_brokerage: "",
    client_mobile_phone: clientPhone || "",
    client_office_phone: "",
  });

  if (orderError) {
    console.error("Order insert failed:", orderError);
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  await supabase.from("admin_notifications").insert({
    id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    type: "new-order",
    order_id: order.id,
    client_name: clientName || "",
    text: `New order from ${clientName || "unknown"} — ${order.typeLabel}`,
    timestamp: new Date().toISOString(),
    read: false,
  });

  return NextResponse.json({ ok: true });
}
