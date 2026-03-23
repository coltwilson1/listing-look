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
  const { orderId, note } = await req.json();

  if (!orderId || !note?.text) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = serviceClient();

  // Verify the caller is a real authenticated user
  let userEmail = null;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    userEmail = user?.email?.toLowerCase();
  }
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load the order
  const { data: order } = await supabase
    .from("orders")
    .select("notes, client_email, client_name")
    .eq("id", orderId)
    .single();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // Ownership check — email must match
  if (order.client_email !== userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const newNotes = [...(order.notes || []), note];
  const { error } = await supabase.from("orders").update({ notes: newNotes }).eq("id", orderId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify admin
  const isRevision = note.text?.startsWith("REVISION REQUEST:");
  await supabase.from("admin_notifications").insert({
    id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    type: isRevision ? "revision" : "message",
    order_id: orderId,
    client_name: order.client_name || userEmail,
    text: isRevision
      ? `Revision requested by ${order.client_name || userEmail}`
      : `New message from ${order.client_name || userEmail}`,
    timestamp: new Date().toISOString(),
    read: false,
  });

  return NextResponse.json({ ok: true });
}

// Mark all admin messages on an order as read by the client
export async function PATCH(req) {
  const authHeader = req.headers.get("authorization");
  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const supabase = serviceClient();

  let userEmail = null;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    userEmail = user?.email?.toLowerCase();
  }
  if (!userEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: order } = await supabase
    .from("orders")
    .select("notes, client_email")
    .eq("id", orderId)
    .single();
  if (!order || order.client_email !== userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const updatedNotes = (order.notes || []).map((n) =>
    n.from === "admin" ? { ...n, clientRead: true } : n
  );
  await supabase.from("orders").update({ notes: updatedNotes }).eq("id", orderId);

  return NextResponse.json({ ok: true });
}
