// ── localStorage auth — swap for real backend (e.g. Supabase) when ready ─────

const USERS_KEY         = "tll_users";
const SESSION_KEY       = "tll_session";
const ORDER_COUNTER_KEY = "tll_order_counter";
const ADMIN_NOTIF_KEY   = "tll_admin_notifications";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); } catch { return []; }
}
function saveUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
}

export function hashPassword(pw) {
  // ⚠️  TODO: replace with bcrypt/argon2 when connecting a real backend
  return btoa(unescape(encodeURIComponent(pw)));
}

export function generateOrderId() {
  try {
    const n = parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || "0") + 1;
    localStorage.setItem(ORDER_COUNTER_KEY, String(n));
    return `TLL-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
  } catch { return `TLL-${Date.now()}`; }
}

export function createAccount({ name, email, password, brokerage = "" }, initialOrder = null) {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "An account with this email already exists." };
  }
  const user = {
    name, email: email.toLowerCase(), passwordHash: hashPassword(password),
    brokerage, headshot: "", logo: "",
    orders: initialOrder ? [initialOrder] : [],
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  try { localStorage.setItem(SESSION_KEY, email.toLowerCase()); } catch {}
  return { success: true, user };
}

export function login(email, password) {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { success: false, error: "No account found with that email." };
  if (user.passwordHash !== hashPassword(password)) return { success: false, error: "Incorrect password." };
  try { localStorage.setItem(SESSION_KEY, email.toLowerCase()); } catch {}
  return { success: true, user };
}

export function logout() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

export function getSession() {
  try { return localStorage.getItem(SESSION_KEY) || null; } catch { return null; }
}

export function getCurrentUser() {
  const email = getSession();
  if (!email) return null;
  return getUsers().find((u) => u.email === email) || null;
}

export function addOrderToUser(email, order) {
  const users = getUsers();
  const i = users.findIndex((u) => u.email === email.toLowerCase());
  if (i === -1) return;
  users[i].orders.unshift(order); // newest first
  saveUsers(users);
  // Notify admin of new order
  addAdminNotification({
    type: "new-order",
    orderId: order.id,
    clientName: users[i].name,
    text: `New order from ${users[i].name} — ${order.typeLabel}`,
  });
}

export function updateUser(email, updates) {
  const users = getUsers();
  const i = users.findIndex((u) => u.email === email.toLowerCase());
  if (i === -1) return { success: false };
  users[i] = { ...users[i], ...updates };
  saveUsers(users);
  return { success: true, user: users[i] };
}

export function addNoteToOrder(userEmail, orderId, note) {
  const users = getUsers();
  const i = users.findIndex((u) => u.email === userEmail);
  if (i === -1) return;
  const oi = users[i].orders.findIndex((o) => o.id === orderId);
  if (oi === -1) return;
  if (!users[i].orders[oi].notes) users[i].orders[oi].notes = [];
  users[i].orders[oi].notes.push(note);
  saveUsers(users);
  // Notify admin when client sends a note
  if (note.from === "client") {
    const isRevision = note.text?.startsWith("REVISION REQUEST:");
    addAdminNotification({
      type: isRevision ? "revision" : "message",
      orderId,
      clientName: users[i].name,
      text: isRevision
        ? `Revision requested by ${users[i].name}`
        : `New message from ${users[i].name}`,
    });
  }
}

export function updateOrderStatus(userEmail, orderId, status) {
  const users = getUsers();
  const i = users.findIndex((u) => u.email === userEmail);
  if (i === -1) return;
  const oi = users[i].orders.findIndex((o) => o.id === orderId);
  if (oi === -1) return;
  users[i].orders[oi].status = status;
  saveUsers(users);
}

// ── Admin helpers ──────────────────────────────────────────────────────────────

export function getAllOrders() {
  const users = getUsers();
  const all = [];
  for (const user of users) {
    for (const order of (user.orders || [])) {
      all.push({ ...order, clientName: user.name, clientEmail: user.email });
    }
  }
  return all.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function updateOrderById(orderId, updates) {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    const oi = (users[i].orders || []).findIndex((o) => o.id === orderId);
    if (oi !== -1) {
      users[i].orders[oi] = { ...users[i].orders[oi], ...updates };
      saveUsers(users);
      return true;
    }
  }
  return false;
}

export function addAdminNotification({ type, orderId, clientName, text }) {
  try {
    const stored = JSON.parse(localStorage.getItem(ADMIN_NOTIF_KEY) || "[]");
    stored.unshift({
      id: `n${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      type, orderId, clientName, text,
      timestamp: new Date().toISOString(),
      read: false,
    });
    localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(stored.slice(0, 100)));
  } catch {}
}

export function getAdminNotifications() {
  try { return JSON.parse(localStorage.getItem(ADMIN_NOTIF_KEY) || "[]"); } catch { return []; }
}

export function markAdminNotificationsRead() {
  try {
    const notifs = getAdminNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(ADMIN_NOTIF_KEY, JSON.stringify(notifs));
  } catch {}
}

// ── Order builders ────────────────────────────────────────────────────────────

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
