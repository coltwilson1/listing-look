"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { storeFile, getFile } from "@/app/lib/fileStorage";

// ── Change this to update the admin password ───────────────────────────────────
const ADMIN_PASSWORD    = "admin2025";
const ADMIN_SESSION_KEY = "tll_admin_session";
const AUTH_HEADER       = { "x-admin-password": ADMIN_PASSWORD };

// ── API helpers ────────────────────────────────────────────────────────────────
async function fetchOrders() {
  try {
    const r = await fetch("/api/admin/orders", { headers: AUTH_HEADER });
    return r.ok ? r.json() : [];
  } catch { return []; }
}
async function fetchNotifications() {
  try {
    const r = await fetch("/api/admin/notifications", { headers: AUTH_HEADER });
    return r.ok ? r.json() : [];
  } catch { return []; }
}
async function markNotifsRead() {
  try {
    await fetch("/api/admin/notifications/read", { method: "POST", headers: AUTH_HEADER });
  } catch {}
}
async function apiUpdateOrder(id, updates) {
  try {
    const r = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { ...AUTH_HEADER, "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return r.ok;
  } catch { return false; }
}

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS = {
  "submitted":         { label: "Submitted",             badge: "bg-slate/10 text-slate",          dot: "bg-slate/50" },
  "in-design":         { label: "In Design",             badge: "bg-blue-50 text-blue-600",         dot: "bg-blue-400" },
  "awaiting-approval": { label: "Awaiting Approval",     badge: "bg-coral/10 text-coral",           dot: "bg-coral", pulse: true },
  "revision":          { label: "Revision Requested",    badge: "bg-amber-50 text-amber-600",       dot: "bg-amber-400" },
  "completed":         { label: "Completed",             badge: "bg-emerald-50 text-emerald-700",   dot: "bg-emerald-500" },
  "cancelled":         { label: "Cancelled",             badge: "bg-rose-50 text-rose-600",         dot: "bg-rose-400" },
};
const STATUS_OPTIONS = [
  { value: "submitted",         label: "Submitted" },
  { value: "in-design",         label: "In Design" },
  { value: "awaiting-approval", label: "Awaiting Your Approval" },
  { value: "revision",          label: "Revision Requested" },
  { value: "completed",         label: "Completed" },
];
const NOTIF_ICONS = { "new-order": "🛒", "message": "💬", "revision": "✏️" };

// ── Utilities ──────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function parsePrice(str) {
  if (!str) return 0;
  const n = parseFloat(String(str).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}
function isThisWeek(iso) {
  const d = new Date(iso), now = new Date();
  return d >= new Date(now - 7 * 864e5) && d <= now;
}
function isThisMonth(iso) {
  const d = new Date(iso), now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
function unreadMsgCount(order) {
  return (order.notes || []).filter((n) => n.from === "client" && !n.adminRead).length;
}

// ── Root component ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed]         = useState(false);
  const [view, setView]             = useState("dashboard");
  const [orders, setOrders]         = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [toast, setToast]           = useState(null);
  const [initialFilter, setInitialFilter] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  async function loadOrders() { setOrders(await fetchOrders()); }
  async function loadNotifications() { setNotifications(await fetchNotifications()); }

  useEffect(() => {
    try {
      const s = localStorage.getItem(ADMIN_SESSION_KEY);
      if (s === "1") { setAuthed(true); loadOrders(); loadNotifications(); }
    } catch {}
  }, []);

  // Poll orders + notifications every 8s
  useEffect(() => {
    if (!authed) return;
    const id = setInterval(() => { loadOrders(); loadNotifications(); }, 8000);
    return () => clearInterval(id);
  }, [authed]);

  function handleLogin(pw) {
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, "1");
      setAuthed(true);
      loadOrders();
      loadNotifications();
    } else {
      return false;
    }
    return true;
  }

  function handleLogout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthed(false);
    setView("dashboard");
    setSelectedOrder(null);
  }

  async function openOrderDetail(order) {
    const updatedNotes = (order.notes || []).map((n) =>
      n.from === "client" ? { ...n, adminRead: true } : n
    );
    await apiUpdateOrder(order.id, { notes: updatedNotes });
    loadOrders();
    setSelectedOrder({ ...order, notes: updatedNotes });
    setView("detail");
    setSidebarOpen(false);
  }

  async function handleOrderUpdate() {
    const all = await fetchOrders();
    setOrders(all);
    if (selectedOrder) {
      const fresh = all.find((o) => o.id === selectedOrder.id);
      if (fresh) setSelectedOrder(fresh);
    }
  }

  function navigateTo(v, filter = null) {
    setView(v);
    setSelectedOrder(null);
    setInitialFilter(filter);
    setSidebarOpen(false);
  }

  const awaitingCount = orders.filter((o) => o.status === "awaiting-approval").length;
  const unreadNotifs  = notifications.filter((n) => !n.read).length;

  if (!authed) return <AdminLoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#F5F3EF] flex font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-deep/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <AdminSidebar
        view={view}
        navigate={navigateTo}
        awaitingCount={awaitingCount}
        onLogout={handleLogout}
        open={sidebarOpen}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-border flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate p-1 border-none bg-transparent cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <span className="font-serif text-deep text-[1.1rem] lg:hidden">Admin</span>
          <span className="hidden lg:block font-sans text-[0.85rem] text-slate">
            {view === "detail" && selectedOrder
              ? `Order ${selectedOrder.id}`
              : view === "dashboard" ? "Dashboard Overview"
              : view === "all-orders" ? "All Orders"
              : view === "in-progress" ? "In Progress"
              : view === "awaiting-approval" ? "Awaiting Approval"
              : view === "completed" ? "Completed"
              : ""}
          </span>
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadNotifs}
            onMarkRead={async () => { await markNotifsRead(); loadNotifications(); }}
            onClickOrder={(id) => {
              const o = orders.find((x) => x.id === id);
              if (o) openOrderDetail(o);
            }}
          />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {view === "detail" && selectedOrder ? (
            <AdminOrderDetailView
              order={selectedOrder}
              onBack={() => { setView("all-orders"); setSelectedOrder(null); }}
              onUpdate={handleOrderUpdate}
              showToast={showToast}
            />
          ) : view === "dashboard" ? (
            <DashboardView orders={orders} onSelectOrder={openOrderDetail} navigate={navigateTo} />
          ) : (
            <AllOrdersView
              orders={orders}
              filterStatus={
                view === "in-progress" ? ["submitted", "in-design", "revision"] :
                view === "awaiting-approval" ? ["awaiting-approval"] :
                view === "completed" ? ["completed"] : null
              }
              initialSearch={initialFilter}
              onSelectOrder={openOrderDetail}
              onUpdateOrder={() => loadOrders()}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[9999] px-5 py-3.5 rounded-2xl shadow-xl font-sans text-[0.88rem] font-semibold flex items-center gap-2.5 animate-[toastIn_0.25s_ease-out] ${
          toast.type === "error" ? "bg-red-600 text-white" : "bg-deep text-white"
        }`}>
          <span>{toast.type === "error" ? "⚠️" : "✓"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Admin Login ────────────────────────────────────────────────────────────────
function AdminLoginScreen({ onLogin }) {
  const [pw, setPw]       = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const ok = onLogin(pw);
      if (!ok) { setError("Incorrect password."); setLoading(false); }
    }, 400);
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8">
          <p className="font-serif text-[1.5rem] text-deep">
            The Listing <span className="text-coral">Look</span>
          </p>
          <p className="font-sans text-[0.78rem] text-slate/60 mt-0.5 uppercase tracking-[0.1em]">Admin Dashboard</p>
        </div>
        <h1 className="font-serif text-[2rem] text-deep mb-1">Sign In</h1>
        <p className="font-sans text-[0.88rem] text-slate mb-7">Enter your admin password to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full font-sans text-[0.9rem] bg-white border border-border rounded-xl px-4 py-3 text-deep outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p className="font-sans text-[0.82rem] text-coral">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-sans bg-coral text-white font-semibold py-3.5 rounded-full hover:bg-coral-dark transition-colors text-[0.95rem] disabled:opacity-60 border-none cursor-pointer"
          >
            {loading ? "Signing in…" : "Sign In to Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
function AdminSidebar({ view, navigate, awaitingCount, onLogout, open }) {
  const items = [
    { id: "dashboard",          label: "Dashboard",          icon: "◻" },
    { id: "all-orders",         label: "Active Orders",      icon: "≡" },
    { id: "in-progress",        label: "In Progress",        icon: "⟳" },
    { id: "awaiting-approval",  label: "Awaiting Approval",  icon: "◉", badge: awaitingCount },
    { id: "completed",          label: "Completed",          icon: "✓" },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-deep flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${open ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Logo */}
      <div className="px-6 pt-7 pb-5 border-b border-white/10">
        <p className="font-serif text-[1.2rem] text-white">
          The Listing <span className="text-coral">Look</span>
        </p>
        <p className="font-sans text-[0.68rem] text-white/40 mt-0.5 uppercase tracking-[0.12em]">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {items.map((item) => {
          const active = view === item.id || (view === "detail" && item.id === "all-orders");
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left font-sans text-[0.875rem] transition-all duration-150 border-none cursor-pointer ${
                active ? "bg-coral text-white font-semibold" : "text-white/65 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-[0.9rem] w-4 text-center">{item.icon}</span>
                {item.label}
              </span>
              {item.badge > 0 && (
                <span className="bg-coral text-white text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 border-t border-white/10 pt-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-sans text-[0.875rem] text-white/50 hover:bg-white/10 hover:text-white transition-all border-none cursor-pointer"
        >
          <span className="text-[0.9rem]">⎋</span> Log Out
        </button>
      </div>
    </aside>
  );
}

// ── Notification Bell ──────────────────────────────────────────────────────────
function NotificationBell({ notifications, unreadCount, onMarkRead, onClickOrder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const recent = notifications.slice(0, 15);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((o) => !o); if (!open && unreadCount > 0) onMarkRead(); }}
        className="relative w-9 h-9 rounded-full bg-light-gray hover:bg-border flex items-center justify-center border-none cursor-pointer transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-coral rounded-full text-white text-[0.6rem] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="font-sans text-[0.82rem] font-bold text-deep">Notifications</p>
            <button onClick={onMarkRead} className="font-sans text-[0.75rem] text-coral hover:underline border-none bg-transparent cursor-pointer">
              Mark all read
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="px-4 py-8 text-center font-sans text-[0.85rem] text-slate/50">No notifications yet</div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {recent.map((n) => (
                <button
                  key={n.id}
                  onClick={() => { setOpen(false); onClickOrder(n.orderId); }}
                  className={`w-full text-left px-4 py-3 hover:bg-light-gray transition-colors border-none cursor-pointer ${!n.read ? "bg-coral/5" : ""}`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">{NOTIF_ICONS[n.type] || "🔔"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[0.82rem] text-deep leading-snug">{n.text}</p>
                      <p className="font-sans text-[0.72rem] text-slate/50 mt-0.5">{fmtDate(n.timestamp)} · {fmtTime(n.timestamp)}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-coral flex-shrink-0 mt-1.5" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dashboard View ─────────────────────────────────────────────────────────────
function DashboardView({ orders, onSelectOrder, navigate }) {
  const [activeStatus, setActiveStatus] = useState(null);

  const total     = orders.length;
  const newWeek   = orders.filter((o) => isThisWeek(o.submittedAt)).length;
  const inProg    = orders.filter((o) => ["submitted", "in-design", "revision"].includes(o.status)).length;
  const awaiting  = orders.filter((o) => o.status === "awaiting-approval").length;
  const doneMonth = orders.filter((o) => o.status === "completed" && isThisMonth(o.submittedAt)).length;
  const revenuePaid   = orders.filter((o) => o.paid).reduce((s, o) => s + parsePrice(o.packagePrice), 0);
  const revenueUnpaid = orders.filter((o) => !o.paid && o.status === "completed").reduce((s, o) => s + parsePrice(o.packagePrice), 0);

  const stats = [
    { label: "Total Orders",        value: total,              sub: "all time",           filter: null },
    { label: "New This Week",       value: newWeek,            sub: "last 7 days",        filter: "new-week" },
    { label: "In Progress",         value: inProg,             sub: "active",             filter: "in-progress" },
    { label: "Awaiting Approval",   value: awaiting,           sub: "needs attention",    filter: "awaiting-approval", alert: awaiting > 0 },
    { label: "Completed This Month",value: doneMonth,          sub: "this month",         filter: "completed" },
    { label: "Revenue Collected",   value: `$${revenuePaid}`,  sub: `$${revenueUnpaid} uncollected`, filter: "paid" },
  ];

  const statusCounts = ["submitted", "in-design", "awaiting-approval", "revision", "completed"].map((s) => ({
    key: s, label: STATUS[s].label, count: orders.filter((o) => o.status === s).length,
    color: s === "completed" ? "#10b981" : s === "awaiting-approval" ? "#E8825A" : s === "in-design" ? "#3b82f6" : s === "revision" ? "#f59e0b" : "#94a3b8",
  }));
  const maxCount = Math.max(...statusCounts.map((s) => s.count), 1);

  const recent10 = orders.filter((o) => {
    if (!activeStatus)                   return o.status !== "completed";
    if (activeStatus === "new-week")     return isThisWeek(o.submittedAt);
    if (activeStatus === "in-progress")  return ["submitted", "in-design", "revision"].includes(o.status);
    if (activeStatus === "paid")         return o.paid;
    return o.status === activeStatus;
  }).slice(0, 10);

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="mb-7">
        <h1 className="font-serif text-[1.9rem] text-deep">Dashboard</h1>
        <p className="font-sans text-[0.88rem] text-slate mt-0.5">Overview of all client orders and revenue.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => {
          const isActive = activeStatus === s.filter;
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => setActiveStatus(isActive ? null : s.filter)}
              className={`text-left rounded-2xl p-5 border transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
                isActive ? "border-coral bg-coral/5 shadow-md" :
                s.alert ? "border-coral/40 bg-coral/5 bg-white" : "border-border bg-white"
              }`}
            >
              <div className={`font-serif text-[2rem] ${isActive || s.alert ? "text-coral" : "text-deep"}`}>{s.value}</div>
              <div className="font-sans text-[0.82rem] font-semibold text-deep mt-0.5">{s.label}</div>
              <div className="font-sans text-[0.72rem] text-slate/50 mt-0.5">{s.sub}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status bar chart */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.1em] text-slate mb-5">Orders by Status</p>
          <div className="space-y-3.5">
            {statusCounts.map(({ key, label, count, color }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveStatus(activeStatus === key ? null : key)}
                className={`w-full text-left rounded-xl px-3 py-2 -mx-3 transition-all border-none cursor-pointer ${
                  activeStatus === key ? "bg-light-gray" : "bg-transparent hover:bg-light-gray/60"
                }`}
              >
                <div className="flex justify-between mb-1.5">
                  <span className={`font-sans text-[0.78rem] font-medium ${activeStatus === key ? "text-deep" : "text-deep/80"}`}>{label}</span>
                  <span className="font-sans text-[0.78rem] font-bold text-deep">{count}</span>
                </div>
                <div className="h-2 bg-light-gray rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${(count / maxCount) * 100}%`, background: color, opacity: activeStatus && activeStatus !== key ? 0.35 : 1 }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.1em] text-slate">
                {!activeStatus ? "Recent Orders" :
                 activeStatus === "new-week" ? "New This Week" :
                 activeStatus === "in-progress" ? "In Progress" :
                 activeStatus === "paid" ? "Revenue Collected" :
                 STATUS[activeStatus]?.label ?? "Filtered Orders"}
              </p>
              {activeStatus && (
                <button onClick={() => setActiveStatus(null)} className="font-sans text-[0.7rem] text-slate/50 hover:text-coral border-none bg-transparent cursor-pointer underline">
                  clear
                </button>
              )}
            </div>
            <button onClick={() => navigate("all-orders")} className="font-sans text-[0.78rem] text-coral hover:underline border-none bg-transparent cursor-pointer">
              View all →
            </button>
          </div>
          {recent10.length === 0 ? (
            <div className="py-12 text-center font-sans text-[0.85rem] text-slate/50">No orders yet</div>
          ) : (
            <div className="divide-y divide-border">
              {recent10.map((o) => {
                const s = STATUS[o.status] || STATUS.submitted;
                const msgs = unreadMsgCount(o);
                return (
                  <button
                    key={o.id}
                    onClick={() => onSelectOrder(o)}
                    className="w-full text-left px-6 py-3.5 hover:bg-light-gray transition-colors border-none cursor-pointer flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[0.8rem] font-semibold text-deep truncate">{o.clientName}</span>
                        {msgs > 0 && (
                          <span className="bg-coral text-white text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full leading-none">{msgs}</span>
                        )}
                      </div>
                      <p className="font-sans text-[0.75rem] text-slate truncate">{o.id} · {o.address || "—"}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {o.paid && <span className="font-sans text-[0.68rem] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">PAID</span>}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-sans text-[0.7rem] font-semibold ${s.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
                        {s.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── All Orders View ────────────────────────────────────────────────────────────
function AllOrdersView({ orders, filterStatus, initialSearch, onSelectOrder, onUpdateOrder, showToast }) {
  const [search, setSearch]         = useState(initialSearch || "");
  const [statusFilter, setStatusFilter] = useState(filterStatus ? filterStatus[0] : "");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [sortKey, setSortKey]       = useState("submittedAt");
  const [sortAsc, setSortAsc]       = useState(false);
  const [actionOrderId, setActionOrderId] = useState(null);
  const [quickStatus, setQuickStatus]     = useState({});
  const actionRef = useRef(null);

  useEffect(() => {
    if (!actionOrderId) return;
    function close(e) { if (actionRef.current && !actionRef.current.contains(e.target)) setActionOrderId(null); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [actionOrderId]);

  const filtered = orders
    .filter((o) => {
      if (filterStatus) { if (!filterStatus.includes(o.status)) return false; }
      else if (o.status === "completed") return false;
      if (statusFilter && o.status !== statusFilter) return false;
      if (typeFilter && o.type !== typeFilter) return false;
      if (dateFrom && new Date(o.submittedAt) < new Date(dateFrom)) return false;
      if (dateTo   && new Date(o.submittedAt) > new Date(dateTo + "T23:59:59")) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (o.clientName || "").toLowerCase().includes(q) ||
          (o.clientEmail || "").toLowerCase().includes(q) ||
          (o.id || "").toLowerCase().includes(q) ||
          (o.address || "").toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let va = a[sortKey] || "", vb = b[sortKey] || "";
      if (sortKey === "submittedAt") { va = new Date(va); vb = new Date(vb); }
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  function toggleSort(key) {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  }

  function SortTh({ col, children }) {
    return (
      <th
        className="px-4 py-3 text-left font-sans text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate cursor-pointer hover:text-deep select-none whitespace-nowrap"
        onClick={() => toggleSort(col)}
      >
        {children} {sortKey === col ? (sortAsc ? "↑" : "↓") : ""}
      </th>
    );
  }

  async function markPaid(order) {
    const newPaid = !order.paid;
    await apiUpdateOrder(order.id, { paid: newPaid });
    onUpdateOrder();
    setActionOrderId(null);
    showToast(newPaid ? `${order.clientName} marked as paid` : `Payment mark removed`);
  }

  async function applyQuickStatus(order, status) {
    await apiUpdateOrder(order.id, { status });
    onUpdateOrder();
    setActionOrderId(null);
    setQuickStatus({});
    showToast(`Status updated to "${STATUS[status]?.label}"`);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="font-serif text-[1.9rem] text-deep">
          {filterStatus?.length === 1 && filterStatus[0] === "awaiting-approval" ? "Awaiting Approval" :
           filterStatus?.includes("submitted") ? "In Progress" :
           filterStatus?.includes("completed") ? "Completed" : "Active Orders"}
        </h1>
        <p className="font-sans text-[0.88rem] text-slate mt-0.5">{filtered.length} order{filtered.length !== 1 ? "s" : ""} shown</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-5 flex flex-wrap gap-3">
        <input
          className="flex-1 min-w-[180px] font-sans text-[0.85rem] bg-light-gray border border-border rounded-xl px-3.5 py-2 outline-none focus:border-coral transition-all"
          placeholder="Search name, email, order ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {!filterStatus && (
          <select
            className="font-sans text-[0.85rem] bg-light-gray border border-border rounded-xl px-3 py-2 outline-none focus:border-coral transition-all cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        )}
        <select
          className="font-sans text-[0.85rem] bg-light-gray border border-border rounded-xl px-3 py-2 outline-none focus:border-coral transition-all cursor-pointer"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="social">Social Media</option>
          <option value="postcard">Postcards</option>
        </select>
        <input type="date" className="font-sans text-[0.85rem] bg-light-gray border border-border rounded-xl px-3 py-2 outline-none focus:border-coral transition-all" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" className="font-sans text-[0.85rem] bg-light-gray border border-border rounded-xl px-3 py-2 outline-none focus:border-coral transition-all" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        {(search || statusFilter || typeFilter || dateFrom || dateTo) && (
          <button onClick={() => { setSearch(""); setStatusFilter(""); setTypeFilter(""); setDateFrom(""); setDateTo(""); }} className="font-sans text-[0.82rem] text-slate hover:text-coral border-none bg-transparent cursor-pointer">
            Clear
          </button>
        )}
      </div>

      {/* Table — desktop */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-light-gray border-b border-border">
              <tr>
                <SortTh col="id">Order ID</SortTh>
                <SortTh col="clientName">Client</SortTh>
                <SortTh col="type">Type</SortTh>
                <th className="px-4 py-3 text-left font-sans text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate whitespace-nowrap">Package / Price</th>
                <SortTh col="submittedAt">Date</SortTh>
                <SortTh col="status">Status</SortTh>
                <th className="px-4 py-3 text-left font-sans text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate">Paid</th>
                <th className="px-4 py-3 text-right font-sans text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center font-sans text-[0.88rem] text-slate/50">No orders match your filters</td></tr>
              ) : filtered.map((o) => {
                const s = STATUS[o.status] || STATUS.submitted;
                const msgs = unreadMsgCount(o);
                const isActionOpen = actionOrderId === o.id;
                const isQuickOpen  = quickStatus[o.id];
                return (
                  <tr key={o.id} className="hover:bg-light-gray/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans text-[0.8rem] font-semibold text-deep">{o.id}</span>
                        {msgs > 0 && <span className="bg-coral text-white text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full leading-none">{msgs}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-sans text-[0.82rem] font-semibold text-deep">{o.clientName}</p>
                      <p className="font-sans text-[0.75rem] text-slate">{o.clientEmail}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-sans text-[0.8rem] text-deep">{o.typeLabel}</p>
                      <p className="font-sans text-[0.75rem] text-slate">{o.graphicTypeLabel || o.postcardTypeLabel || "—"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-sans text-[0.82rem] text-deep">{o.package || "—"}</p>
                      <p className="font-sans text-[0.75rem] text-coral font-semibold">{o.packagePrice || (o.quantity ? `${o.quantity} qty` : "—")}</p>
                    </td>
                    <td className="px-4 py-3.5 font-sans text-[0.8rem] text-slate whitespace-nowrap">{fmtDate(o.submittedAt)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-sans text-[0.7rem] font-semibold whitespace-nowrap ${s.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {o.paid
                        ? <span className="font-sans text-[0.72rem] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">PAID</span>
                        : <span className="font-sans text-[0.72rem] text-slate/40">—</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="relative inline-block" ref={isActionOpen ? actionRef : null}>
                        <button
                          onClick={() => { setActionOrderId(isActionOpen ? null : o.id); setQuickStatus({}); }}
                          className="font-sans text-[0.8rem] font-semibold text-slate border border-border px-3 py-1.5 rounded-xl hover:border-coral hover:text-coral transition-all bg-transparent cursor-pointer"
                        >
                          Actions ▾
                        </button>
                        {isActionOpen && (
                          <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-border z-50 overflow-hidden">
                            <button onClick={() => { onSelectOrder(o); setActionOrderId(null); }} className="w-full text-left px-4 py-2.5 font-sans text-[0.85rem] text-deep hover:bg-light-gray border-none cursor-pointer transition-colors">
                              👁 View Full Details
                            </button>
                            <div className="border-t border-border/50">
                              {isQuickOpen ? (
                                <div className="p-2 space-y-0.5">
                                  {STATUS_OPTIONS.map((opt) => (
                                    <button key={opt.value} onClick={() => applyQuickStatus(o, opt.value)} className={`w-full text-left px-3 py-2 font-sans text-[0.82rem] rounded-xl transition-colors border-none cursor-pointer ${o.status === opt.value ? "bg-coral/10 text-coral font-semibold" : "hover:bg-light-gray text-deep"}`}>
                                      {opt.label}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <button onClick={() => setQuickStatus({ [o.id]: true })} className="w-full text-left px-4 py-2.5 font-sans text-[0.85rem] text-deep hover:bg-light-gray border-none cursor-pointer transition-colors">
                                  ↺ Update Status
                                </button>
                              )}
                            </div>
                            <div className="border-t border-border/50">
                              <button onClick={() => markPaid(o)} className="w-full text-left px-4 py-2.5 font-sans text-[0.85rem] text-deep hover:bg-light-gray border-none cursor-pointer transition-colors">
                                {o.paid ? "✕ Remove Paid Mark" : "✓ Mark as Paid"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Admin Order Detail View ────────────────────────────────────────────────────
function AdminOrderDetailView({ order, onBack, onUpdate, showToast }) {
  const [currentOrder, setCurrentOrder] = useState(order);

  async function refresh() {
    const all = await fetchOrders();
    const fresh = all.find((o) => o.id === order.id);
    if (fresh) setCurrentOrder(fresh);
    onUpdate();
  }

  const formData = currentOrder.formData || {};
  const contact  = formData.contact  || {};
  const listing  = formData.listing  || {};
  const photos   = formData.photos   || {};
  const print    = formData.print    || {};

  const isRevision = currentOrder.status === "revision";
  const revisionNote = isRevision
    ? (currentOrder.notes || []).slice().reverse().find((n) => n.text?.startsWith("REVISION REQUEST:"))
    : null;

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-sans text-[0.85rem] text-slate hover:text-deep mb-5 border-none bg-transparent cursor-pointer p-0 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 3L5 8l5 5"/></svg>
        Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.12em] text-coral mb-1">{currentOrder.typeLabel}</p>
          <h1 className="font-serif text-[1.8rem] text-deep leading-tight">{currentOrder.address || "Order Detail"}</h1>
          <p className="font-sans text-[0.85rem] text-slate mt-0.5">
            {currentOrder.id} · {currentOrder.clientName} · {fmtDate(currentOrder.submittedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {currentOrder.paid && (
            <span className="font-sans text-[0.75rem] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">PAID</span>
          )}
          {(() => { const s = STATUS[currentOrder.status] || STATUS.submitted; return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-[0.75rem] font-semibold ${s.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
              {s.label}
            </span>
          ); })()}
        </div>
      </div>

      {/* Revision alert */}
      {isRevision && revisionNote && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-amber-700 mb-1">⚠ Revision Requested</p>
              <p className="font-sans text-[0.88rem] text-amber-900 font-medium">
                {revisionNote.text.replace("REVISION REQUEST:", "").trim()}
              </p>
              <p className="font-sans text-[0.75rem] text-amber-600/70 mt-1">{fmtDate(revisionNote.createdAt)}</p>
            </div>
            <button
              onClick={async () => {
                await apiUpdateOrder(currentOrder.id, { status: "in-design" });
                refresh();
                showToast("Revision acknowledged — status set to In Design");
              }}
              className="flex-shrink-0 font-sans text-[0.82rem] font-semibold bg-amber-600 text-white px-4 py-2 rounded-full hover:bg-amber-700 transition-colors border-none cursor-pointer whitespace-nowrap"
            >
              Acknowledge & Start Revision
            </button>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: form data */}
        <div className="lg:col-span-3 space-y-5">
          {/* Contact */}
          <InfoCard title="Contact Info">
            <InfoGrid items={[
              ["Name",       contact.name],
              ["Firm",       contact.firm],
              ["Phone",      contact.phone],
              ["Email",      contact.email],
              ["Instagram",  contact.instagram],
              ["Facebook",   contact.facebook],
            ]} />
          </InfoCard>

          {/* Listing */}
          <InfoCard title="Listing Details">
            <InfoGrid items={[
              ["Address",    listing.address],
              ["Price",      listing.price],
              ["MLS #",      listing.mls],
              ["Beds",       listing.beds],
              ["Baths",      listing.baths],
              ["Sq Ft",      listing.sqft],
              ["MLS Public", listing.mlsPublic ? "Yes" : "No"],
              ["Photo Delivery", listing.photoDelivery],
              listing.highlights ? ["Highlights", listing.highlights] : null,
            ].filter(Boolean)} cols={2} />
          </InfoCard>

          {/* Social-specific */}
          {currentOrder.type === "social" && (
            <InfoCard title="Graphics & Package">
              <InfoGrid items={[
                ["Graphic Type",   currentOrder.graphicTypeLabel],
                ["Package",        currentOrder.package],
                ["Price",          currentOrder.packagePrice],
                ["Design #",       currentOrder.designId],
                currentOrder.animationStyle ? ["Animation Style", currentOrder.animationStyle] : null,
                currentOrder.musicStyle ? ["Music Style", currentOrder.musicStyle] : null,
                photos.photoOption ? ["Photo Option", photos.photoOption === "mls" ? "MLS Link" : "Uploaded Files"] : null,
                photos.mlsLink ? ["MLS Link", photos.mlsLink] : null,
                photos.photoNames?.length > 0 ? ["Photos", photos.photoNames.join(", ")] : null,
                formData.listing?.customRequest ? ["Custom Request", formData.listing.customRequest] : null,
              ].filter(Boolean)} cols={2} />
            </InfoCard>
          )}

          {/* Postcard-specific */}
          {currentOrder.type === "postcard" && (
            <InfoCard title="Postcard Details">
              <InfoGrid items={[
                ["Postcard Type",  currentOrder.postcardTypeLabel],
                ["Quantity",       print.quantity],
                ["Design #",       print.designId],
                ["Mailing Audience", print.mailingAudience],
                ["File Option",    print.fileOption],
                print.agentName ? ["Agent Name", print.agentName] : null,
                print.tagline   ? ["Tagline",    print.tagline]   : null,
                print.notes     ? ["Notes",      print.notes]     : null,
              ].filter(Boolean)} cols={2} />
            </InfoCard>
          )}

          {/* Form notes */}
          {(formData.listing?.highlights || print.notes) && (
            <InfoCard title="Client Notes from Form">
              <p className="font-sans text-[0.88rem] text-deep">{formData.listing?.highlights || print.notes}</p>
            </InfoCard>
          )}

          {/* Client brand assets */}
          <ClientBrandAssetsCard order={currentOrder} />
        </div>

        {/* Right: admin actions */}
        <div className="lg:col-span-2 space-y-5">
          <StatusUpdaterCard  order={currentOrder} onUpdate={refresh} showToast={showToast} />
          <FileDeliveryCard   order={currentOrder} onUpdate={refresh} showToast={showToast} />
          <PaymentCard        order={currentOrder} onUpdate={refresh} showToast={showToast} />
          <MessagesCard       order={currentOrder} onUpdate={refresh} showToast={showToast} />
          <AdminNotesCard     order={currentOrder} onUpdate={refresh} showToast={showToast} />
          <CancelOrderCard    order={currentOrder} onUpdate={refresh} showToast={showToast} />
        </div>
      </div>
    </div>
  );
}

// ── Info helpers ───────────────────────────────────────────────────────────────
function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate mb-4">{title}</p>
      {children}
    </div>
  );
}
function InfoGrid({ items, cols = 2 }) {
  return (
    <div className={`grid gap-x-6 gap-y-3 ${cols === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
      {items.map(([k, v]) => v ? (
        <div key={k}>
          <p className="font-sans text-[0.68rem] uppercase tracking-[0.08em] text-slate/60">{k}</p>
          <p className="font-sans text-[0.85rem] text-deep mt-0.5 break-words">{v}</p>
        </div>
      ) : null)}
    </div>
  );
}

// ── Client Brand Assets Card ───────────────────────────────────────────────────
function ClientBrandAssetsCard({ order }) {
  const [urls, setUrls] = useState({ headshot: null, logo: null, personalLogo: null });
  const urlsRef = useRef({});
  const clientEmail = order.clientEmail;

  // Load client profile images from IndexedDB
  useEffect(() => {
    if (!clientEmail) return;
    let cancelled = false;
    async function load() {
      const fields = ["headshot", "logo", "personalLogo"];
      const result = {};
      for (const field of fields) {
        try {
          const blob = await getFile(`profile::${clientEmail}`, field);
          if (blob && !cancelled) result[field] = { url: URL.createObjectURL(blob), blob };
        } catch {}
      }
      if (!cancelled) {
        Object.values(urlsRef.current).forEach((d) => { try { URL.revokeObjectURL(d.url); } catch {} });
        urlsRef.current = result;
        setUrls({ headshot: result.headshot?.url || null, logo: result.logo?.url || null, personalLogo: result.personalLogo?.url || null });
      }
    }
    load();
    return () => {
      cancelled = true;
      Object.values(urlsRef.current).forEach((d) => { try { URL.revokeObjectURL(d.url); } catch {} });
    };
  }, [clientEmail]);

  function downloadAsset(field, label) {
    const url = urls[field];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.clientName?.replace(/\s+/g, "-") || "client"}-${label}.png`;
    a.click();
  }

  const hasAnyAsset = urls.headshot || urls.logo || urls.personalLogo;

  const ASSET_BOXES = [
    { field: "headshot",    label: "Headshot" },
    { field: "logo",        label: "Brokerage Logo" },
    { field: "personalLogo", label: "Personal / Team Logo" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate mb-4">Client Brand Assets & Contact Info</p>

      {/* Contact info row */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-5">
        {[
          ["Name",          order.clientName],
          ["Email",         clientEmail],
          ["Mobile Phone",  order.clientMobilePhone],
          ["Office Phone",  order.clientOfficePhone],
          ["Brokerage",     order.clientBrokerage],
        ].map(([k, v]) => v ? (
          <div key={k}>
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.08em] text-slate/60">{k}</p>
            <p className="font-sans text-[0.82rem] text-deep mt-0.5 break-all">{v}</p>
          </div>
        ) : null)}
      </div>

      {/* Asset image boxes */}
      <div className="grid grid-cols-3 gap-3">
        {ASSET_BOXES.map(({ field, label }) => (
          <div key={field} className="flex flex-col items-center gap-2">
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.08em] text-slate/60 text-center">{label}</p>
            <div className="w-full aspect-square rounded-xl border border-border bg-light-gray flex items-center justify-center overflow-hidden">
              {urls[field] ? (
                <img src={urls[field]} alt={label} className="w-full h-full object-cover" />
              ) : (
                <p className="font-sans text-[0.7rem] text-slate/40 text-center px-2 leading-tight">Not uploaded yet</p>
              )}
            </div>
            <button
              onClick={() => downloadAsset(field, label)}
              disabled={!urls[field]}
              className="w-full font-sans text-[0.75rem] font-semibold text-slate border border-border px-3 py-1.5 rounded-full hover:border-coral hover:text-coral transition-all bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Download
            </button>
          </div>
        ))}
      </div>

      {!hasAnyAsset && (
        <p className="font-sans text-[0.78rem] text-slate/50 italic mt-4">
          Client has not uploaded brand assets yet. You can request them via the message thread below.
        </p>
      )}
    </div>
  );
}

// ── Status Updater Card ────────────────────────────────────────────────────────
function StatusUpdaterCard({ order, onUpdate, showToast }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => setStatus(order.status), [order.status]);

  async function save() {
    setSaving(true);
    await apiUpdateOrder(order.id, { status });
    setSaving(false);
    onUpdate();
    showToast(`Status updated to "${STATUS[status]?.label}"`);
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate mb-3">Update Status</p>
      <select
        className="w-full font-sans text-[0.88rem] bg-light-gray border border-border rounded-xl px-4 py-3 outline-none focus:border-coral transition-all cursor-pointer mb-3"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <button
        onClick={save}
        disabled={saving || status === order.status}
        className="w-full font-sans bg-coral text-white font-semibold py-2.5 rounded-full hover:bg-coral-dark transition-colors border-none cursor-pointer text-[0.88rem] disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Status"}
      </button>
    </div>
  );
}

// ── File Delivery Card ─────────────────────────────────────────────────────────
function FileDeliveryCard({ order, onUpdate, showToast }) {
  const [files, setFiles]     = useState([]);
  const [message, setMessage] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [sending, setSending] = useState(false);

  const contact = order.formData?.contact || {};
  const existing = order.deliveredFiles || [];

  function handleFilePick(e) {
    const picked = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...picked].slice(0, 10));
  }
  function removeFile(i) { setFiles((f) => f.filter((_, idx) => idx !== i)); }

  async function handleSend() {
    if (files.length === 0) { showToast("Please select at least one file", "error"); return; }
    setSending(true);
    // Persist actual file blobs to IndexedDB so the client can download them
    for (const file of files) {
      try { await storeFile(order.id, file.name, file); } catch (err) { console.warn("IndexedDB store failed:", err); }
    }
    const metadata = files.map((f) => ({ name: f.name, size: f.size, type: f.type, deliveredAt: new Date().toISOString() }));
    const allFiles = [...existing, ...metadata];
    const newStatus = ["submitted", "in-design", "revision"].includes(order.status) ? "awaiting-approval" : order.status;
    await apiUpdateOrder(order.id, {
      deliveredFiles: allFiles,
      deliveryMessage: message || order.deliveryMessage || "",
      status: newStatus,
    });
    setSending(false);
    setFiles([]);
    setMessage("");
    setShowEmail(true);
    onUpdate();
    showToast(`Files delivered to ${order.clientName}`);
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate mb-3">File Delivery</p>

      {/* Previously delivered */}
      {existing.length > 0 && (
        <div className="mb-4 space-y-1.5">
          <p className="font-sans text-[0.72rem] text-slate/60 uppercase tracking-[0.06em]">Delivered ({existing.length})</p>
          {existing.map((f, i) => (
            <div key={i} className="flex items-center gap-2 font-sans text-[0.8rem] text-deep bg-light-gray rounded-lg px-3 py-1.5">
              <span>📎</span>
              <span className="truncate">{f.name}</span>
              <span className="ml-auto text-slate/50 text-[0.72rem] flex-shrink-0">{Math.round(f.size / 1024)}KB</span>
            </div>
          ))}
        </div>
      )}

      {/* Upload new */}
      <label className="block border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-coral transition-colors mb-3">
        <p className="font-sans text-[0.82rem] text-slate">Tap to select files</p>
        <p className="font-sans text-[0.72rem] text-slate/50 mt-0.5">PNG, JPG, PDF, MP4, ZIP · up to 10 files</p>
        <input type="file" multiple accept=".png,.jpg,.jpeg,.pdf,.mp4,.zip" className="hidden" onChange={handleFilePick} />
      </label>

      {files.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 font-sans text-[0.8rem] text-deep bg-blue-50 rounded-lg px-3 py-1.5">
              <span>📄</span>
              <span className="flex-1 truncate">{f.name}</span>
              <button onClick={() => removeFile(i)} className="text-slate/50 hover:text-coral border-none bg-transparent cursor-pointer text-[0.85rem]">✕</button>
            </div>
          ))}
        </div>
      )}

      <textarea
        className="w-full font-sans text-[0.85rem] bg-light-gray border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-coral transition-all resize-none mb-3 placeholder:text-slate/40"
        rows={2}
        placeholder="Optional message to client…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={handleSend}
        disabled={sending || files.length === 0}
        className="w-full font-sans bg-deep text-white font-semibold py-2.5 rounded-full hover:bg-coral transition-colors border-none cursor-pointer text-[0.88rem] disabled:opacity-50"
      >
        {sending ? "Sending…" : `Send to Client ${files.length > 0 ? `(${files.length} file${files.length > 1 ? "s" : ""})` : ""}`}
      </button>

      {/* Simulated email preview */}
      {showEmail && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.08em] text-blue-700">📧 Email Sent (simulated)</p>
            <button onClick={() => setShowEmail(false)} className="text-blue-400 hover:text-blue-600 border-none bg-transparent cursor-pointer text-sm">✕</button>
          </div>
          <div className="font-sans text-[0.75rem] text-blue-800 space-y-1">
            <p><span className="font-semibold">To:</span> {contact.email || order.clientEmail}</p>
            <p><span className="font-semibold">Subject:</span> Your design files are ready — {order.id}</p>
            <p className="mt-2">Hi {contact.name?.split(" ")[0] || order.clientName},</p>
            <p className="mt-1">Your {order.typeLabel?.toLowerCase()} for {order.address} are ready for review!</p>
            {order.deliveryMessage && <p className="mt-1 italic">"{order.deliveryMessage}"</p>}
            <p className="mt-1 font-semibold">Files delivered: {(order.deliveredFiles || []).map((f) => f.name).join(", ")}</p>
            <p className="mt-1">View your order at: yourdomain.com/portal</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Payment Card ───────────────────────────────────────────────────────────────
function PaymentCard({ order, onUpdate, showToast }) {
  const [venmo, setVenmo] = useState(order.venmoRef || "");
  const [saving, setSaving] = useState(false);

  async function togglePaid() {
    const newPaid = !order.paid;
    await apiUpdateOrder(order.id, { paid: newPaid, venmoRef: venmo });
    onUpdate();
    showToast(newPaid ? "Order marked as paid" : "Payment mark removed");
  }
  async function saveVenmo() {
    setSaving(true);
    await apiUpdateOrder(order.id, { venmoRef: venmo });
    setSaving(false);
    onUpdate();
    showToast("Venmo reference saved");
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate mb-3">Payment</p>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-sans text-[0.85rem] text-deep font-semibold">{order.packagePrice || "Custom pricing"}</p>
          <p className="font-sans text-[0.75rem] text-slate">{order.package || order.typeLabel}</p>
        </div>
        <button
          onClick={togglePaid}
          className={`font-sans text-[0.82rem] font-semibold px-4 py-2 rounded-full border transition-all cursor-pointer ${
            order.paid
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
              : "bg-light-gray text-slate border-border hover:border-coral hover:text-coral"
          }`}
        >
          {order.paid ? "✓ Paid" : "Mark as Paid"}
        </button>
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 font-sans text-[0.85rem] bg-light-gray border border-border rounded-xl px-3.5 py-2 outline-none focus:border-coral transition-all placeholder:text-slate/40"
          placeholder="Venmo transaction ID…"
          value={venmo}
          onChange={(e) => setVenmo(e.target.value)}
        />
        <button
          onClick={saveVenmo}
          disabled={saving}
          className="font-sans text-[0.82rem] font-semibold text-coral border border-coral px-4 py-2 rounded-xl hover:bg-coral hover:text-white transition-all bg-transparent cursor-pointer disabled:opacity-50"
        >
          {saving ? "…" : "Save"}
        </button>
      </div>
    </div>
  );
}

// ── Messages Card ──────────────────────────────────────────────────────────────
function MessagesCard({ order, onUpdate, showToast }) {
  const [msg, setMsg]     = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const notes = order.notes || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes.length]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    const note = { from: "admin", text: msg.trim(), createdAt: new Date().toISOString(), adminRead: true, clientRead: false };
    const updatedNotes = [...notes, note];
    await apiUpdateOrder(order.id, { notes: updatedNotes });
    setSending(false);
    setMsg("");
    onUpdate();
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate mb-3">Messages</p>
      {notes.length === 0 ? (
        <p className="font-sans text-[0.82rem] text-slate/50 mb-4">No messages yet.</p>
      ) : (
        <div className="space-y-2.5 mb-4 max-h-56 overflow-y-auto pr-1">
          {notes.map((n, i) => (
            <div key={i} className={`rounded-xl px-3.5 py-2.5 ${n.from === "admin" ? "bg-deep/5 border border-deep/10" : "bg-light-gray"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-sans text-[0.68rem] font-bold uppercase tracking-[0.06em] ${n.from === "admin" ? "text-deep/60" : n.text?.startsWith("REVISION REQUEST:") ? "text-amber-600" : "text-coral/70"}`}>
                  {n.from === "admin" ? "You (Admin)" : order.clientName}
                </span>
                <span className="font-sans text-[0.68rem] text-slate/40">{fmtDate(n.createdAt)}</span>
              </div>
              <p className="font-sans text-[0.85rem] text-deep">
                {n.text?.startsWith("REVISION REQUEST:") ? n.text.replace("REVISION REQUEST:", "✏️ Revision:") : n.text}
              </p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          className="flex-1 font-sans text-[0.85rem] bg-light-gray border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-coral transition-all placeholder:text-slate/40"
          placeholder="Type a message to the client…"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending || !msg.trim()}
          className="font-sans bg-coral text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-coral-dark transition-colors border-none cursor-pointer text-[0.85rem] disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// ── Admin Notes Card ───────────────────────────────────────────────────────────
function AdminNotesCard({ order, onUpdate, showToast }) {
  const [notes, setNotes] = useState(order.adminNotes || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await apiUpdateOrder(order.id, { adminNotes: notes });
    setSaving(false);
    onUpdate();
    showToast("Internal notes saved");
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate mb-1">Internal Notes</p>
      <p className="font-sans text-[0.72rem] text-slate/50 mb-3">Only visible to you. Not shown to client.</p>
      <textarea
        className="w-full font-sans text-[0.85rem] bg-light-gray border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-coral transition-all resize-none mb-3 placeholder:text-slate/40"
        rows={3}
        placeholder="Design notes, reminders, file locations…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button
        onClick={save}
        disabled={saving}
        className="font-sans text-[0.82rem] font-semibold text-slate border border-border px-5 py-2 rounded-full hover:border-coral hover:text-coral transition-all bg-transparent cursor-pointer disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Notes"}
      </button>
    </div>
  );
}

// ── Cancel Order Card ──────────────────────────────────────────────────────────
function CancelOrderCard({ order, onUpdate, showToast }) {
  const [reason, setReason]     = useState(order.cancellationReason || "");
  const [confirm, setConfirm]   = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const already = order.status === "cancelled";

  async function handleCancel() {
    if (!confirm) { setConfirm(true); return; }
    setCancelling(true);
    await apiUpdateOrder(order.id, {
      status: "cancelled",
      cancellationReason: reason.trim(),
      cancelledBy: "admin",
      cancelledAt: new Date().toISOString(),
    });
    setCancelling(false);
    setConfirm(false);
    onUpdate();
    showToast("Order cancelled");
  }

  async function handleUncancel() {
    await apiUpdateOrder(order.id, { status: "submitted", cancellationReason: "", cancelledBy: null, cancelledAt: null });
    setReason("");
    onUpdate();
    showToast("Order restored to Submitted");
  }

  if (already) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
        <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-rose-600 mb-2">Order Cancelled</p>
        {order.cancellationReason && (
          <p className="font-sans text-[0.85rem] text-rose-800 mb-3">Reason: {order.cancellationReason}</p>
        )}
        <button
          onClick={handleUncancel}
          className="font-sans text-[0.82rem] font-semibold text-slate border border-border px-5 py-2 rounded-full hover:border-coral hover:text-coral transition-all bg-transparent cursor-pointer"
        >
          Restore Order
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-rose-200 p-5">
      <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-rose-500 mb-1">Cancel Order</p>
      <p className="font-sans text-[0.72rem] text-slate/50 mb-3">This will notify the client and mark the order as cancelled.</p>
      <textarea
        className="w-full font-sans text-[0.85rem] bg-light-gray border border-border rounded-xl px-3.5 py-2.5 outline-none focus:border-rose-400 transition-all resize-none mb-3 placeholder:text-slate/40"
        rows={2}
        placeholder="Reason for cancellation (shown to client)…"
        value={reason}
        onChange={(e) => { setReason(e.target.value); setConfirm(false); }}
      />
      {confirm && (
        <p className="font-sans text-[0.78rem] text-rose-600 font-semibold mb-2">
          Are you sure? Click again to confirm cancellation.
        </p>
      )}
      <button
        onClick={handleCancel}
        disabled={cancelling}
        className={`w-full font-sans font-semibold py-2.5 rounded-full border-none cursor-pointer text-[0.88rem] transition-colors disabled:opacity-50 ${
          confirm
            ? "bg-rose-600 text-white hover:bg-rose-700"
            : "bg-rose-50 text-rose-600 hover:bg-rose-100"
        }`}
      >
        {cancelling ? "Cancelling…" : confirm ? "Confirm — Cancel This Order" : "Cancel Order"}
      </button>
    </div>
  );
}
