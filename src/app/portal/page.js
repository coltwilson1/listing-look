"use client";

import { useState, useEffect, useRef } from "react";
import {
  getCurrentUser, login, logout, updateUser,
  addNoteToOrder, updateOrderStatus, updateOrderById, hashPassword,
} from "@/app/lib/auth";
import { getFile, storeFile } from "@/app/lib/fileStorage";
import SocialMediaOrderModal from "@/app/components/SocialMediaOrderModal";
import PostcardOrderModal from "@/app/components/PostcardOrderModal";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS = {
  "submitted":         { label: "Submitted",              dot: "bg-slate/40",  badge: "bg-slate/10 text-slate" },
  "in-design":         { label: "In Design",              dot: "bg-blue-400",  badge: "bg-blue-50 text-blue-600" },
  "awaiting-approval": { label: "Awaiting Your Approval", dot: "bg-coral",     badge: "bg-coral/10 text-coral", pulse: true },
  "revision":          { label: "Revision Requested",     dot: "bg-amber-400", badge: "bg-amber-50 text-amber-600" },
  "completed":         { label: "Completed",              dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  "cancelled":         { label: "Cancelled",              dot: "bg-rose-400",  badge: "bg-rose-50 text-rose-600" },
};

const TIMELINE_STAGES = [
  { key: "submitted",         label: "Submitted" },
  { key: "in-design",         label: "In Design" },
  { key: "awaiting-approval", label: "Awaiting Approval" },
  { key: "revision",          label: "Revision" },
  { key: "completed",         label: "Completed" },
];

const STAGE_ORDER = ["submitted", "in-design", "awaiting-approval", "revision", "completed"];
function stageIndex(status) { return STAGE_ORDER.indexOf(status); }

function fmt(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Root component ─────────────────────────────────────────────────────────────

export default function PortalPage() {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [view, setView]           = useState("orders"); // "orders" | "profile"
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [socialOpen, setSocialOpen]       = useState(false);
  const [postcardOpen, setPostcardOpen]   = useState(false);

  function refreshUser() {
    setUser(getCurrentUser());
  }

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  function handleLogout() {
    logout();
    window.location.href = "/";
  }

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-coral border-t-transparent animate-spin" />
    </div>
  );

  if (!user) return <LoginScreen onLogin={(u) => setUser(u)} />;

  const firstName = user.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-deep/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-deep flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-6 border-b border-white/10">
          <a href="/" className="font-serif text-[1.25rem] text-white no-underline">
            The Listing <span className="text-coral">Look</span>
          </a>
          <p className="font-sans text-[0.72rem] text-white/40 mt-0.5">Client Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { id: "orders",  label: "My Orders",  icon: "📦" },
            { id: "profile", label: "My Profile", icon: "👤" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setView(item.id); setSelectedOrder(null); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left font-sans text-[0.88rem] transition-all duration-150 border-none cursor-pointer ${
                view === item.id && !selectedOrder
                  ? "bg-coral text-white font-semibold"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* New Order */}
          <div className="pt-3 border-t border-white/10">
            <p className="font-sans text-[0.68rem] uppercase tracking-[0.1em] text-white/30 px-4 mb-2">New Order</p>
            <button
              onClick={() => { setSocialOpen(true); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left font-sans text-[0.88rem] text-white/70 hover:bg-white/10 hover:text-white transition-all border-none cursor-pointer"
            >
              <span>📱</span> Social Media
            </button>
            <button
              onClick={() => { setPostcardOpen(true); setSidebarOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left font-sans text-[0.88rem] text-white/70 hover:bg-white/10 hover:text-white transition-all border-none cursor-pointer"
            >
              <span>📮</span> Postcards & Print
            </button>
          </div>
        </nav>

        {/* User info + logout */}
        <div className="px-4 pb-6 border-t border-white/10 pt-4">
          <p className="font-sans text-[0.78rem] text-white/50 px-4 mb-2 truncate">{user.email}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans text-[0.88rem] text-white/50 hover:bg-white/10 hover:text-white transition-all border-none cursor-pointer"
          >
            <span>🚪</span> Log Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-deep border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-1"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h16M3 11h16M3 16h16"/>
            </svg>
          </button>
          <span className="font-serif text-white text-[1.1rem]">
            The Listing <span className="text-coral">Look</span>
          </span>
          <span className="w-8" />
        </div>

        <main className="flex-1 overflow-y-auto">
          {selectedOrder ? (
            <OrderDetailView
              order={selectedOrder}
              user={user}
              onBack={() => setSelectedOrder(null)}
              onRefresh={() => { refreshUser(); setSelectedOrder(getCurrentUser()?.orders.find((o) => o.id === selectedOrder.id) || null); }}
            />
          ) : view === "orders" ? (
            <OrdersView
              user={user}
              firstName={firstName}
              onSelectOrder={(o) => setSelectedOrder(o)}
              onNewSocial={() => setSocialOpen(true)}
              onNewPostcard={() => setPostcardOpen(true)}
            />
          ) : (
            <ProfileView user={user} onUpdate={() => refreshUser()} />
          )}
        </main>
      </div>

      <SocialMediaOrderModal open={socialOpen} onClose={() => { setSocialOpen(false); refreshUser(); }} />
      <PostcardOrderModal open={postcardOpen} onClose={() => { setPostcardOpen(false); refreshUser(); }} />
    </div>
  );
}

// ── Login Screen ──────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = login(email, password);
    setLoading(false);
    if (!result.success) return setError(result.error);
    onLogin(result.user);
  }

  const iCls = "w-full font-sans text-[0.9rem] bg-light-gray border border-border rounded-xl px-4 py-3 text-deep outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all placeholder:text-slate/40";

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        <a href="/" className="font-serif text-[1.5rem] text-deep no-underline block mb-8">
          The Listing <span className="text-coral">Look</span>
        </a>
        <h1 className="font-serif text-[2rem] text-deep mb-1">Welcome back</h1>
        <p className="font-sans text-[0.9rem] text-slate mb-8">Log in to your client portal to track your orders.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1.5">Email</label>
            <input className={iCls} type="email" placeholder="jane@realty.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block font-sans text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1.5">Password</label>
            <input className={iCls} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="font-sans text-[0.82rem] text-coral">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full font-sans bg-coral text-white font-semibold py-3.5 rounded-full hover:bg-coral-dark transition-colors text-[0.95rem] disabled:opacity-60 cursor-pointer border-none mt-2"
          >
            {loading ? "Logging in…" : "Log In to My Portal"}
          </button>
        </form>
        <p className="font-sans text-[0.85rem] text-slate text-center mt-6">
          Don't have an account?{" "}
          <a href="/#services" className="text-coral hover:underline no-underline">Place an order</a> to get started.
        </p>
      </div>
    </div>
  );
}

// ── Orders View ───────────────────────────────────────────────────────────────

function OrdersView({ user, firstName, onSelectOrder, onNewSocial, onNewPostcard }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const orders = user.orders || [];
  const total    = orders.length;
  const inProg   = orders.filter((o) => ["in-design", "awaiting-approval", "revision"].includes(o.status)).length;
  const completed = orders.filter((o) => o.status === "completed").length;

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <div className="max-w-[860px] mx-auto px-6 py-10">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="font-serif text-[2rem] text-deep">Welcome back, {firstName}!</h1>
          <p className="font-sans text-[0.9rem] text-slate mt-1">Here's a summary of your design orders.</p>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 font-sans bg-coral text-white font-semibold text-[0.88rem] px-5 py-2.5 rounded-full hover:bg-coral-dark transition-colors border-none cursor-pointer"
          >
            + Submit New Order
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className={`transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}>
              <path d="M2 4l4 4 4-4"/>
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50">
              <button
                onClick={() => { setDropdownOpen(false); onNewSocial(); }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 font-sans text-[0.88rem] text-deep hover:bg-light-gray transition-colors border-none cursor-pointer"
              >
                <span>📱</span> Social Media Graphics
              </button>
              <button
                onClick={() => { setDropdownOpen(false); onNewPostcard(); }}
                className="w-full text-left flex items-center gap-3 px-4 py-3 font-sans text-[0.88rem] text-deep hover:bg-light-gray transition-colors border-none cursor-pointer border-t border-border"
              >
                <span>📮</span> Postcards & Print
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Orders",  value: total },
          { label: "In Progress",   value: inProg },
          { label: "Completed",     value: completed },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-border text-center">
            <div className="font-serif text-[2.2rem] text-coral">{s.value}</div>
            <div className="font-sans text-[0.82rem] text-slate mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <div className="text-4xl mb-3">📭</div>
          <h3 className="font-serif text-[1.3rem] text-deep mb-2">No orders yet</h3>
          <p className="font-sans text-[0.88rem] text-slate mb-5">Place your first order to get started.</p>
          <a href="/#services" className="inline-block font-sans bg-coral text-white font-semibold px-6 py-2.5 rounded-full no-underline hover:bg-coral-dark transition-colors text-[0.9rem]">
            Browse Services
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => onSelectOrder(order)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────

function OrderCard({ order, onClick }) {
  const s = STATUS[order.status] || STATUS.submitted;
  const isAwaiting = order.status === "awaiting-approval";
  const isCompleted = order.status === "completed";

  return (
    <div
      className="bg-white rounded-2xl border border-border p-6 hover:shadow-[0_8px_24px_rgba(28,28,46,0.08)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.1em] text-coral">{order.typeLabel}</span>
            {order.graphicTypeLabel && (
              <span className="font-sans text-[0.7rem] text-slate/60">· {order.graphicTypeLabel}</span>
            )}
            {order.postcardTypeLabel && (
              <span className="font-sans text-[0.7rem] text-slate/60">· {order.postcardTypeLabel}</span>
            )}
          </div>
          <h3 className="font-sans text-[0.95rem] font-semibold text-deep truncate">{order.address || "—"}</h3>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {order.package && (
              <span className="font-sans text-[0.8rem] text-slate">{order.package} {order.packagePrice}</span>
            )}
            {order.quantity && (
              <span className="font-sans text-[0.8rem] text-slate">{order.quantity} postcards</span>
            )}
            <span className="font-sans text-[0.8rem] text-slate/50">{fmt(order.submittedAt)}</span>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-sans text-[0.72rem] font-semibold whitespace-nowrap ${s.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
            {s.label}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-3 flex-wrap">
        {isAwaiting && (
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="font-sans text-[0.82rem] font-semibold bg-coral text-white px-5 py-2 rounded-full hover:bg-coral-dark transition-colors border-none cursor-pointer"
          >
            Review & Approve
          </button>
        )}
        {isCompleted && order.deliveredFiles?.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="font-sans text-[0.82rem] font-semibold bg-emerald-600 text-white px-5 py-2 rounded-full hover:bg-emerald-700 transition-colors border-none cursor-pointer"
          >
            View Files ({order.deliveredFiles.length})
          </button>
        )}
        {order.paid && (
          <span className="font-sans text-[0.72rem] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">PAID</span>
        )}
        <span className="font-sans text-[0.8rem] text-slate ml-auto">{order.id}</span>
      </div>
    </div>
  );
}

// ── Order Detail View ─────────────────────────────────────────────────────────

function OrderDetailView({ order, user, onBack, onRefresh }) {
  const [note, setNote]               = useState("");
  const [showRevision, setShowRevision] = useState(false);
  const [revText, setRevText]           = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [showCancel, setShowCancel]     = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const s = STATUS[order.status] || STATUS.submitted;

  function submitNote(e) {
    e.preventDefault();
    if (!note.trim()) return;
    addNoteToOrder(user.email, order.id, { from: "client", text: note.trim(), createdAt: new Date().toISOString() });
    setNote("");
    onRefresh();
  }

  function handleApprove() {
    setSubmitting(true);
    updateOrderStatus(user.email, order.id, "completed");
    setTimeout(() => { setSubmitting(false); onRefresh(); }, 400);
  }

  function handleRevision(e) {
    e.preventDefault();
    if (!revText.trim()) return;
    addNoteToOrder(user.email, order.id, { from: "client", text: `REVISION REQUEST: ${revText.trim()}`, createdAt: new Date().toISOString() });
    updateOrderStatus(user.email, order.id, "revision");
    setRevText("");
    setShowRevision(false);
    onRefresh();
  }

  const formData = order.formData || {};
  const contact  = formData.contact || {};
  const listing  = formData.listing || {};

  const iCls = "w-full font-sans text-[0.88rem] bg-light-gray border border-border rounded-xl px-4 py-2.5 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 resize-none transition-all placeholder:text-slate/40";

  return (
    <div className="max-w-[780px] mx-auto px-6 py-10">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-sans text-[0.85rem] text-slate hover:text-deep transition-colors mb-6 border-none bg-transparent cursor-pointer p-0"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M10 3L5 8l5 5"/>
        </svg>
        Back to Orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-coral mb-1">{order.typeLabel}</p>
          <h1 className="font-serif text-[1.8rem] text-deep leading-tight">{order.address || "Order Detail"}</h1>
          <p className="font-sans text-[0.85rem] text-slate mt-1">{order.id} · Submitted {fmt(order.submittedAt)}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-[0.75rem] font-semibold flex-shrink-0 ${s.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
          {s.label}
        </span>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.1em] text-slate mb-4">Progress</p>
        <div className="flex items-start gap-0 relative">
          {TIMELINE_STAGES.map((stage, i) => {
            const current = stageIndex(order.status);
            const mine = stageIndex(stage.key);
            const isActive   = mine === current;
            const isComplete = mine < current;
            const isFuture   = mine > current;
            return (
              <div key={stage.key} className="flex-1 flex flex-col items-center relative">
                {/* Connector line */}
                {i < TIMELINE_STAGES.length - 1 && (
                  <div className="absolute top-3 left-1/2 w-full h-0.5" style={{ background: isComplete ? "#E8825A" : "#E2DDD6" }} />
                )}
                {/* Dot */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 relative transition-all ${
                  isComplete ? "bg-coral border-coral" : isActive ? "bg-coral border-coral ring-4 ring-coral/20" : "bg-white border-border"
                }`}>
                  {isComplete && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <p className={`font-sans text-center mt-2 leading-tight ${isActive ? "text-[0.72rem] font-bold text-coral" : "text-[0.68rem] text-slate/70"}`}>
                  {stage.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Approval area */}
      {order.status === "awaiting-approval" && (
        <div className="bg-coral/5 border-2 border-coral rounded-2xl p-6 mb-6">
          <h3 className="font-serif text-[1.2rem] text-deep mb-1">Your proof is ready!</h3>
          <p className="font-sans text-[0.85rem] text-slate mb-5">
            Your design is ready for review. Look over the files below and let us know what you think!
          </p>
          {/* Delivered files */}
          {order.deliveredFiles?.length > 0 ? (
            <div className="bg-white rounded-xl border border-border p-4 mb-5">
              <DeliveredFilesViewer order={order} />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border h-36 flex items-center justify-center mb-5 text-slate/40 font-sans text-[0.85rem]">
              Files will appear here once uploaded by our team
            </div>
          )}
          {!showRevision ? (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="font-sans bg-coral text-white font-semibold px-8 py-2.5 rounded-full hover:bg-coral-dark transition-colors border-none cursor-pointer disabled:opacity-60 text-[0.9rem]"
              >
                {submitting ? "Approving…" : "✓ Approve This Design"}
              </button>
              <button
                onClick={() => setShowRevision(true)}
                className="font-sans border border-border text-slate px-6 py-2.5 rounded-full hover:border-coral hover:text-coral transition-all bg-transparent cursor-pointer text-[0.9rem]"
              >
                Request a Revision
              </button>
            </div>
          ) : (
            <form onSubmit={handleRevision} className="space-y-3">
              <label className="block font-sans text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-slate">Describe the changes you'd like</label>
              <textarea
                className={iCls}
                rows={3}
                placeholder="Please change the font color on the headline, and move the price to the bottom right corner…"
                value={revText}
                onChange={(e) => setRevText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <button type="submit" className="font-sans bg-deep text-white font-semibold px-6 py-2.5 rounded-full hover:bg-coral transition-colors border-none cursor-pointer text-[0.88rem]">
                  Submit Revision Request
                </button>
                <button type="button" onClick={() => setShowRevision(false)} className="font-sans text-slate border border-border px-5 py-2.5 rounded-full hover:border-coral hover:text-coral transition-all bg-transparent cursor-pointer text-[0.88rem]">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Order info */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.1em] text-slate mb-4">Order Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {[
            ["Type",     order.typeLabel],
            order.graphicTypeLabel ? ["Graphic Type", order.graphicTypeLabel] : null,
            order.postcardTypeLabel ? ["Postcard Type", order.postcardTypeLabel] : null,
            ["Address",  listing.address || order.address],
            ["Price",    listing.price   || order.listingPrice],
            listing.beds  ? ["Beds / Baths", `${listing.beds} bd / ${listing.baths} ba`] : null,
            listing.sqft  ? ["Sq Ft",        listing.sqft] : null,
            order.package ? ["Package",      `${order.package} ${order.packagePrice}`] : null,
            order.quantity ? ["Quantity",    order.quantity] : null,
            order.animationStyle ? ["Animation", order.animationStyle] : null,
            order.musicStyle ? ["Music", order.musicStyle] : null,
            ["Submitted", fmt(order.submittedAt)],
          ].filter(Boolean).map(([k, v]) => (
            <div key={k}>
              <p className="font-sans text-[0.72rem] text-slate/60 uppercase tracking-[0.08em]">{k}</p>
              <p className="font-sans text-[0.88rem] text-deep font-medium mt-0.5">{v || "—"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Delivered files (completed orders) */}
      {order.status === "completed" && order.deliveredFiles?.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6">
          <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.1em] text-emerald-700 mb-4">✓ Your Completed Files</p>
          <DeliveredFilesViewer order={order} />
        </div>
      )}

      {/* Notes / Messages */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.1em] text-slate mb-4">Messages & Notes</p>
        {(!order.notes || order.notes.length === 0) ? (
          <p className="font-sans text-[0.85rem] text-slate/50 mb-5">No messages yet. Leave a note for our team below.</p>
        ) : (
          <div className="space-y-3 mb-5">
            {order.notes.map((n, i) => (
              <div key={i} className={`rounded-xl px-4 py-3 ${n.from === "client" ? "bg-light-gray" : "bg-coral/5 border border-coral/20"}`}>
                <p className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate/60 mb-1">
                  {n.from === "client" ? "You" : "The Listing Look"} · {fmt(n.createdAt)}
                </p>
                <p className="font-sans text-[0.88rem] text-deep">{n.text}</p>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={submitNote} className="flex gap-2">
          <input
            className="flex-1 font-sans text-[0.88rem] bg-light-gray border border-border rounded-xl px-4 py-2.5 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all placeholder:text-slate/40"
            placeholder="Leave a note for our design team…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="submit"
            className="font-sans bg-coral text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-coral-dark transition-colors border-none cursor-pointer text-[0.88rem] whitespace-nowrap"
          >
            Send
          </button>
        </form>
      </div>

      {/* Cancel order — only available when order hasn't started */}
      {order.status === "submitted" && !showCancel && (
        <div className="mt-6 pt-6 border-t border-border">
          <button
            onClick={() => setShowCancel(true)}
            className="font-sans text-[0.82rem] text-slate/50 hover:text-rose-500 transition-colors border-none bg-transparent cursor-pointer underline underline-offset-2"
          >
            Cancel this order
          </button>
        </div>
      )}

      {order.status === "submitted" && showCancel && (
        <div className="mt-6 bg-rose-50 border border-rose-200 rounded-2xl p-5">
          <h4 className="font-serif text-[1rem] text-rose-700 mb-1">Cancel Order</h4>
          <p className="font-sans text-[0.82rem] text-rose-600/80 mb-4">
            You can only cancel before work has begun. Once cancelled you'll need to place a new order.
          </p>
          <div className="mb-3">
            <label className="block font-sans text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-rose-600 mb-1.5">
              Reason for cancelling <span className="text-rose-400">(optional)</span>
            </label>
            <textarea
              className="w-full font-sans text-[0.85rem] bg-white border border-rose-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all resize-none placeholder:text-slate/40"
              rows={2}
              placeholder="e.g. Listing fell through, no longer needed…"
              value={cancelReason}
              onChange={(e) => { setCancelReason(e.target.value); setCancelConfirm(false); }}
            />
          </div>
          {cancelConfirm && (
            <p className="font-sans text-[0.78rem] text-rose-600 font-semibold mb-2">
              Are you sure? This cannot be undone. Click confirm to proceed.
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (!cancelConfirm) { setCancelConfirm(true); return; }
                updateOrderById(order.id, {
                  status: "cancelled",
                  cancellationReason: cancelReason.trim(),
                  cancelledBy: "client",
                  cancelledAt: new Date().toISOString(),
                });
                onRefresh();
              }}
              className={`font-sans font-semibold text-[0.88rem] px-6 py-2.5 rounded-full border-none cursor-pointer transition-colors ${
                cancelConfirm
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-rose-100 text-rose-700 hover:bg-rose-200"
              }`}
            >
              {cancelConfirm ? "Confirm Cancellation" : "Cancel Order"}
            </button>
            <button
              onClick={() => { setShowCancel(false); setCancelConfirm(false); setCancelReason(""); }}
              className="font-sans text-[0.88rem] text-slate border border-border px-5 py-2.5 rounded-full hover:border-coral hover:text-coral transition-all bg-transparent cursor-pointer"
            >
              Keep Order
            </button>
          </div>
        </div>
      )}

      {order.status === "cancelled" && (
        <div className="mt-6 bg-rose-50 border border-rose-200 rounded-2xl p-5">
          <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.1em] text-rose-500 mb-1">Order Cancelled</p>
          {order.cancellationReason && (
            <p className="font-sans text-[0.85rem] text-rose-700">Reason: {order.cancellationReason}</p>
          )}
          <p className="font-sans text-[0.82rem] text-rose-600/70 mt-2">
            Need to reorder?{" "}
            <a href="/#services" className="text-coral hover:underline no-underline font-semibold">Browse our services →</a>
          </p>
        </div>
      )}
    </div>
  );
}

// ── Profile View ──────────────────────────────────────────────────────────────

function ProfileView({ user, onUpdate }) {
  const [name, setName]               = useState(user.name || "");
  const [brokerage, setBrokerage]     = useState(user.brokerage || "");
  const [mobilePhone, setMobilePhone] = useState(user.mobilePhone || "");
  const [officePhone, setOfficePhone] = useState(user.officePhone || "");
  const [currentPw, setCurrentPw]     = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [profileMsg, setProfileMsg]   = useState("");
  const [pwMsg, setPwMsg]             = useState("");

  // Brand asset preview URLs loaded from IndexedDB
  const [assetUrls, setAssetUrls] = useState({ headshot: null, logo: null, personalLogo: null });
  const assetUrlsRef = useRef({});
  const headshotRef    = useRef(null);
  const logoRef        = useRef(null);
  const personalLogoRef = useRef(null);

  const iCls = "w-full font-sans text-[0.9rem] bg-light-gray border border-border rounded-xl px-4 py-2.5 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all placeholder:text-slate/40";
  const lCls = "block font-sans text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1.5";

  // Load asset previews from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    async function loadAssets() {
      const fields = ["headshot", "logo", "personalLogo"];
      const urls = {};
      for (const field of fields) {
        try {
          const blob = await getFile(`profile::${user.email}`, field);
          if (blob && !cancelled) urls[field] = URL.createObjectURL(blob);
        } catch {}
      }
      if (!cancelled) {
        // revoke old
        Object.values(assetUrlsRef.current).forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
        assetUrlsRef.current = urls;
        setAssetUrls(urls);
      }
    }
    loadAssets();
    return () => {
      cancelled = true;
      Object.values(assetUrlsRef.current).forEach((u) => { try { URL.revokeObjectURL(u); } catch {} });
    };
  }, [user.email]);

  function saveProfile(e) {
    e.preventDefault();
    if (!name.trim()) return setProfileMsg("Name is required.");
    const result = updateUser(user.email, {
      name: name.trim(),
      brokerage: brokerage.trim(),
      mobilePhone: mobilePhone.trim(),
      officePhone: officePhone.trim(),
    });
    if (result.success) { setProfileMsg("Profile saved!"); onUpdate(); }
  }

  function changePassword(e) {
    e.preventDefault();
    setPwMsg("");
    if (hashPassword(currentPw) !== user.passwordHash) return setPwMsg("Current password is incorrect.");
    if (newPw.length < 6) return setPwMsg("New password must be at least 6 characters.");
    if (newPw !== confirmPw) return setPwMsg("New passwords don't match.");
    const result = updateUser(user.email, { passwordHash: hashPassword(newPw) });
    if (result.success) { setPwMsg("Password changed!"); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
  }

  async function handleAssetUpload(field, file) {
    if (!file) return;
    try {
      await storeFile(`profile::${user.email}`, field, file);
      // Update user metadata with filename so admin knows asset exists
      updateUser(user.email, { [field]: file.name });
      // Refresh preview URL
      const newUrl = URL.createObjectURL(file);
      if (assetUrlsRef.current[field]) { try { URL.revokeObjectURL(assetUrlsRef.current[field]); } catch {} }
      assetUrlsRef.current = { ...assetUrlsRef.current, [field]: newUrl };
      setAssetUrls((prev) => ({ ...prev, [field]: newUrl }));
      onUpdate();
    } catch (err) {
      console.error("Failed to store asset:", err);
    }
  }

  function handleAssetRemove(field) {
    updateUser(user.email, { [field]: "" });
    if (assetUrlsRef.current[field]) { try { URL.revokeObjectURL(assetUrlsRef.current[field]); } catch {} }
    assetUrlsRef.current = { ...assetUrlsRef.current, [field]: null };
    setAssetUrls((prev) => ({ ...prev, [field]: null }));
    onUpdate();
  }

  const ASSETS = [
    { label: "Headshot Photo",          field: "headshot",    ref: headshotRef,    hint: "JPG or PNG", desc: null },
    { label: "Brokerage Logo",          field: "logo",        ref: logoRef,        hint: "PNG preferred", desc: null },
    { label: "Personal Logo / Team Logo", field: "personalLogo", ref: personalLogoRef, hint: "PNG preferred",
      desc: "Upload your personal brand logo or team logo if different from your brokerage logo" },
  ];

  return (
    <div className="max-w-[620px] mx-auto px-6 py-10 space-y-6">
      <h1 className="font-serif text-[2rem] text-deep">My Profile</h1>

      {/* Profile info */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.1em] text-slate mb-4">Personal Info</p>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className={lCls}>Full Name</label>
            <input className={iCls} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={lCls}>Email</label>
            <input className={iCls + " opacity-60 cursor-not-allowed"} value={user.email} readOnly />
          </div>
          <div>
            <label className={lCls}>Brokerage</label>
            <input className={iCls} placeholder="Your brokerage" value={brokerage} onChange={(e) => setBrokerage(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lCls}>Mobile Phone</label>
              <input className={iCls} type="tel" placeholder="(555) 000-0000" value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} />
            </div>
            <div>
              <label className={lCls}>Office Phone</label>
              <input className={iCls} type="tel" placeholder="(555) 000-0000" value={officePhone} onChange={(e) => setOfficePhone(e.target.value)} />
            </div>
          </div>
          {profileMsg && <p className="font-sans text-[0.82rem] text-coral">{profileMsg}</p>}
          <button type="submit" className="font-sans bg-coral text-white font-semibold px-7 py-2.5 rounded-full hover:bg-coral-dark transition-colors border-none cursor-pointer text-[0.9rem]">
            Save Changes
          </button>
        </form>
      </div>

      {/* Brand assets */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.1em] text-slate mb-1">Brand Assets</p>
        <p className="font-sans text-[0.82rem] text-slate/70 mb-5">Upload once and we'll pull these automatically for every future order.</p>
        <div className="space-y-5">
          {ASSETS.map((asset) => (
            <div key={asset.field}>
              <label className={lCls}>{asset.label}</label>
              {asset.desc && (
                <p className="font-sans text-[0.78rem] text-slate/60 mb-2">{asset.desc}</p>
              )}
              {assetUrls[asset.field] ? (
                <div className="flex items-start gap-3">
                  <img
                    src={assetUrls[asset.field]}
                    alt={asset.label}
                    className="w-20 h-20 object-cover rounded-xl border border-border bg-light-gray flex-shrink-0"
                  />
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => asset.ref.current?.click()}
                      className="font-sans text-[0.8rem] font-semibold text-coral border border-coral px-4 py-1.5 rounded-full hover:bg-coral hover:text-white transition-all cursor-pointer bg-transparent"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAssetRemove(asset.field)}
                      className="font-sans text-[0.8rem] text-slate/60 hover:text-rose-500 transition-colors border-none bg-transparent cursor-pointer px-0 text-left"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => asset.ref.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl py-5 text-center hover:border-coral transition-colors group"
                >
                  <span className="block text-xl mb-1 opacity-40 group-hover:opacity-70">📎</span>
                  <span className="font-sans text-[0.78rem] text-slate group-hover:text-coral transition-colors">{asset.hint}</span>
                </button>
              )}
              <input
                ref={asset.ref}
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAssetUpload(asset.field, f); e.target.value = ""; }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.1em] text-slate mb-4">Change Password</p>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className={lCls}>Current Password</label>
            <input className={iCls} type="password" placeholder="••••••••" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div>
            <label className={lCls}>New Password</label>
            <input className={iCls} type="password" placeholder="At least 6 characters" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <div>
            <label className={lCls}>Confirm New Password</label>
            <input className={iCls} type="password" placeholder="Re-enter new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
          {pwMsg && <p className="font-sans text-[0.82rem] text-coral">{pwMsg}</p>}
          <button type="submit" className="font-sans bg-deep text-white font-semibold px-7 py-2.5 rounded-full hover:bg-coral transition-colors border-none cursor-pointer text-[0.9rem]">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Delivered Files Viewer ─────────────────────────────────────────────────────
// Loads actual file blobs from IndexedDB and renders previews + download links.

function DeliveredFilesViewer({ order }) {
  const [fileData, setFileData] = useState({}); // { name → { url, type } }
  const [loading, setLoading]   = useState(true);
  const urlsRef = useRef({});

  useEffect(() => {
    if (!order.deliveredFiles?.length) { setLoading(false); return; }
    let cancelled = false;

    async function load() {
      const result = {};
      for (const f of order.deliveredFiles) {
        try {
          const blob = await getFile(order.id, f.name);
          if (blob && !cancelled) {
            result[f.name] = { url: URL.createObjectURL(blob), type: blob.type || f.type || "" };
          }
        } catch {}
      }
      if (!cancelled) {
        Object.values(urlsRef.current).forEach(({ url }) => { try { URL.revokeObjectURL(url); } catch {} });
        urlsRef.current = result;
        setFileData(result);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      Object.values(urlsRef.current).forEach(({ url }) => { try { URL.revokeObjectURL(url); } catch {} });
    };
  }, [order.id, order.deliveredFiles?.length]);

  if (!order.deliveredFiles?.length) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 font-sans text-[0.85rem] text-slate/60">
        <div className="w-4 h-4 rounded-full border-2 border-coral border-t-transparent animate-spin" />
        Loading files…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {order.deliveryMessage && (
        <p className="font-sans text-[0.88rem] text-deep italic mb-1">"{order.deliveryMessage}"</p>
      )}
      {order.deliveredFiles.map((f) => {
        const fd   = fileData[f.name];
        const type = fd?.type || f.type || "";
        const url  = fd?.url;
        const isImage = type.startsWith("image/");
        const isVideo = type.startsWith("video/");
        const isPdf   = type === "application/pdf";
        const icon    = isImage ? "🖼" : isVideo ? "🎬" : isPdf ? "📄" : "📦";

        return (
          <div key={f.name} className="rounded-xl overflow-hidden border border-border bg-white">
            {/* Image inline preview — click to open full size */}
            {isImage && url && (
              <button
                onClick={() => window.open(url, "_blank")}
                className="block w-full border-none bg-transparent cursor-zoom-in p-0"
                title="Click to view full size"
              >
                <img
                  src={url}
                  alt={f.name}
                  className="w-full max-h-72 object-contain bg-light-gray"
                />
              </button>
            )}

            {/* Video player */}
            {isVideo && url && (
              <video src={url} controls className="w-full bg-black max-h-72" />
            )}

            {/* File row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg flex-shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-[0.85rem] font-semibold text-deep truncate">{f.name}</p>
                <p className="font-sans text-[0.72rem] text-slate/50">{Math.round(f.size / 1024)} KB</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isPdf && url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-[0.78rem] font-semibold text-slate border border-border px-3 py-1.5 rounded-full hover:border-coral hover:text-coral transition-all no-underline"
                  >
                    View
                  </a>
                )}
                {url ? (
                  <a
                    href={url}
                    download={f.name}
                    className="font-sans text-[0.78rem] font-semibold text-white bg-coral px-4 py-1.5 rounded-full hover:bg-coral-dark transition-colors no-underline"
                  >
                    Download
                  </a>
                ) : (
                  <span className="font-sans text-[0.75rem] text-slate/40 italic">Not available</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
