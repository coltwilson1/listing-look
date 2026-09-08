import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { flattenOrder } from "@/app/lib/orderUtils";

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createClient(url, key);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { order, clientName, clientEmail, clientPhone } = body;
    if (!order?.id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });

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
  } catch (err) {
    console.error("Order submit error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
