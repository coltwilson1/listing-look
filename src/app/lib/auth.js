"use client";

import { supabase } from "./supabase";
import { expandOrder, flattenUpdates } from "./orderUtils";

// ── Order ID generator ────────────────────────────────────────────────────────
const ORDER_COUNTER_KEY = "tll_order_counter";
export function generateOrderId() {
  try {
    const n = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || "0") + 1;
    localStorage.setItem(ORDER_COUNTER_KEY, String(n));
    return `TLL-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
  } catch { return `TLL-${Date.now()}`; }
}

// ── Flatten a camelCase order object to DB snake_case ─────────────────────────
function flattenOrder(order) {
  return {
    id: order.id,
    type: order.type,
    type_label: order.typeLabel,
    status: order.status || "submitted",
    address: order.address,
    listing_price: order.listingPrice,
    package: order.package,
    package_price: order.packagePrice,
    graphic_type: order.graphicType,
    graphic_type_label: order.graphicTypeLabel,
    design_id: order.designId,
    animation_style: order.animationStyle,
    music_style: order.musicStyle,
    postcard_type: order.postcardType,
    postcard_type_label: order.postcardTypeLabel,
    quantity: order.quantity,
    paid: order.paid || false,
    venmo_ref: order.venmoRef || "",
    delivered_files: order.deliveredFiles || [],
    delivery_message: order.deliveryMessage || "",
    admin_notes: order.adminNotes || "",
    notes: order.notes || [],
    form_data: order.formData || null,
    submitted_at: order.submittedAt || new Date().toISOString(),
    cancellation_reason: order.cancellationReason || "",
    cancelled_by: order.cancelledBy || "",
    cancelled_at: order.cancelledAt || null,
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function createAccount({ name, email, password, brokerage = "" }, initialOrder = null) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { success: false, error: error.message };

  const userId = data.user?.id;
  if (!userId) return { success: false, error: "Signup failed — please try again." };

  await supabase.from("profiles").insert({ id: userId, name, brokerage });

  if (initialOrder) {
    await supabase.from("orders").insert({
      ...flattenOrder(initialOrder),
      user_id: userId,
      client_name: name,
      client_email: email.toLowerCase(),
      client_brokerage: brokerage,
    });
    await addAdminNotification({
      type: "new-order",
      orderId: initialOrder.id,
      clientName: name,
      text: `New order from ${name} — ${initialOrder.typeLabel}`,
    });
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
    supabase.from("orders").select("*").eq("user_id", user.id).order("submitted_at", { ascending: false }),
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

  await supabase.from("orders").insert({
    ...flattenOrder(order),
    user_id: user.id,
    client_name: clientName,
    client_email: userEmail.toLowerCase(),
    client_brokerage: profile?.brokerage || "",
    client_mobile_phone: profile?.mobile_phone || "",
    client_office_phone: profile?.office_phone || "",
  });

  await addAdminNotification({
    type: "new-order",
    orderId: order.id,
    clientName,
    text: `New order from ${clientName} — ${order.typeLabel}`,
  });
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
