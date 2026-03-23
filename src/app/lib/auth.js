"use client";

import { supabase } from "./supabase";
import { expandOrder, flattenUpdates, flattenOrder } from "./orderUtils";

// ── Order ID generator ────────────────────────────────────────────────────────
const ORDER_COUNTER_KEY = "tll_order_counter";
export function generateOrderId() {
  try {
    const n = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || "0") + 1;
    localStorage.setItem(ORDER_COUNTER_KEY, String(n));
    return `TLL-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
  } catch { return `TLL-${Date.now()}`; }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function createAccount({ name, email, password, brokerage = "" }, initialOrder = null) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };

  const userId = data.user?.id;
  if (!userId) return { success: false, error: "Signup failed — please try again." };

  await supabase.from("profiles").insert({ id: userId, name, brokerage });

  if (initialOrder) {
    // Order was already saved by /api/orders/submit — just link it to the new user
    await supabase.from("orders").update({
      user_id: userId,
      client_name: name,
      client_email: email.toLowerCase(),
      client_brokerage: brokerage,
    }).eq("id", initialOrder.id);
  }

  const user = await getCurrentUser();
  return { success: true, user };
}

export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: "Incorrect email or password." };
  const user = await getCurrentUser();
  return { success: true, user };
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("orders").select("*")
      .or(`user_id.eq.${user.id},and(user_id.is.null,client_email.eq.${user.email.toLowerCase()})`)
      .order("submitted_at", { ascending: false }),
  ]);

  return {
    id: user.id,
    email: user.email,
    name: profile?.name || "",
    brokerage: profile?.brokerage || "",
    mobilePhone: profile?.mobile_phone || "",
    officePhone: profile?.office_phone || "",
    headshot: profile?.headshot || "",
    logo: profile?.logo || "",
    orders: (orders || []).map(expandOrder),
  };
}

export async function updateUser(email, updates) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false };

  const profileUpdates = {};
  if (updates.name !== undefined)         profileUpdates.name = updates.name;
  if (updates.brokerage !== undefined)    profileUpdates.brokerage = updates.brokerage;
  if (updates.mobilePhone !== undefined)  profileUpdates.mobile_phone = updates.mobilePhone;
  if (updates.officePhone !== undefined)  profileUpdates.office_phone = updates.officePhone;
  if (updates.headshot !== undefined)     profileUpdates.headshot = updates.headshot;
  if (updates.logo !== undefined)         profileUpdates.logo = updates.logo;
  if (updates.personalLogo !== undefined) profileUpdates.personal_logo = updates.personalLogo;

  if (Object.keys(profileUpdates).length > 0) {
    await supabase.from("profiles").update(profileUpdates).eq("id", user.id);
  }

  const updatedUser = await getCurrentUser();
  return { success: true, user: updatedUser };
}

export async function addOrderToUser(userEmail, order) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const clientName = profile?.name || userEmail;

  // Order was already saved by /api/orders/submit — update it to link to this user
  await supabase.from("orders").update({
    user_id: user.id,
    client_name: clientName,
    client_email: userEmail.toLowerCase(),
    client_brokerage: profile?.brokerage || "",
    client_mobile_phone: profile?.mobile_phone || "",
    client_office_phone: profile?.office_phone || "",
  }).eq("id", order.id);
}

export async function addNoteToOrder(userEmail, orderId, note) {
  const { data: order } = await supabase.from("orders").select("notes").eq("id", orderId).single();
  if (!order) return;

  const newNotes = [...(order.notes || []), note];
  await supabase.from("orders").update({ notes: newNotes }).eq("id", orderId);

  if (note.from === "client") {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("name").eq("id", user.id).single()
      : { data: null };
    const clientName = profile?.name || userEmail;
    const isRevision = note.text?.startsWith("REVISION REQUEST:");
    await addAdminNotification({
      type: isRevision ? "revision" : "message",
      orderId,
      clientName,
      text: isRevision ? `Revision requested by ${clientName}` : `New message from ${clientName}`,
    });
  }
}

export async function updateOrderStatus(userEmail, orderId, status) {
  await supabase.from("orders").update({ status }).eq("id", orderId);
}

export async function updateOrderById(orderId, updates) {
  const dbUpdates = flattenUpdates(updates);
  if (Object.keys(dbUpdates).length === 0) return true;
  const { error } = await supabase.from("orders").update(dbUpdates).eq("id", orderId);
  return !error;
}

export async function addAdminNotification({ type, orderId, clientName, text }) {
  try {
    await supabase.from("admin_notifications").insert({
      id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      type,
      order_id: orderId,
      client_name: clientName,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    });
  } catch {}
}

// ── Kept for backward compat (Supabase handles hashing) ──────────────────────
export function hashPassword(pw) { return pw; }

// ── Order builders (unchanged) ────────────────────────────────────────────────
const GRAPHIC_TYPE_LABELS = {
  "just-listed": "Just Listed", "just-sold": "Just Sold", "open-house": "Open House",
  "under-contract": "Under Contract", "price-reduction": "Price Reduction", "custom": "Custom / Other",
};
const POSTCARD_TYPE_LABELS = {
  "just-listed": "Just Listed", "just-sold": "Just Sold", "open-house": "Open House Invitation",
  "farming": "Neighborhood Farming", "market-update": "Market Update", "custom": "Custom",
};
const PKG_PRICES = { starter: "$25", standard: "$35", premium: "$45" };

export function buildSocialOrder({ contact, listing, photos, pkg, design }) {
  return {
    id: generateOrderId(),
    type: "social",
    typeLabel: "Social Media Graphics",
    graphicType: listing.graphicType,
    graphicTypeLabel: GRAPHIC_TYPE_LABELS[listing.graphicType] || listing.graphicType,
    address: listing.address,
    listingPrice: listing.price,
    package: pkg.packageId ? pkg.packageId.charAt(0).toUpperCase() + pkg.packageId.slice(1) : "",
    packagePrice: PKG_PRICES[pkg.packageId] || "",
    designId: design.designId,
    animationStyle: pkg.animationStyle || null,
    musicStyle: pkg.musicStyle || null,
    submittedAt: new Date().toISOString(),
    status: "submitted",
    notes: [],
    paid: false,
    venmoRef: "",
    deliveredFiles: [],
    deliveryMessage: "",
    adminNotes: "",
    formData: { contact, listing, photos, pkg, design },
  };
}

export function buildPostcardOrder({ contact, listing, print }) {
  return {
    id: generateOrderId(),
    type: "postcard",
    typeLabel: "Postcards & Print",
    postcardType: print.postcardType,
    postcardTypeLabel: POSTCARD_TYPE_LABELS[print.postcardType] || print.postcardType,
    address: listing.address,
    listingPrice: listing.price,
    quantity: print.quantity,
    designId: print.designId,
    submittedAt: new Date().toISOString(),
    status: "submitted",
    notes: [],
    paid: false,
    venmoRef: "",
    deliveredFiles: [],
    deliveryMessage: "",
    adminNotes: "",
    formData: { contact, listing, print },
  };
}
