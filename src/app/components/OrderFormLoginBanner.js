"use client";

import { useState } from "react";
import { login } from "@/app/lib/auth";

const iCls =
  "w-full font-sans text-[0.88rem] text-deep bg-white border border-border rounded-xl px-3.5 py-2 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all placeholder:text-slate/40";

/**
 * Shown at the top of Step 1 when the user is NOT logged in.
 * On successful login, calls onLogin(user) so the parent can auto-fill fields.
 */
export default function OrderFormLoginBanner({ onLogin }) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("Please fill in both fields.");
    setLoading(true);
    const result = login(email, password);
    setLoading(false);
    if (!result.success) return setError(result.error);
    onLogin(result.user);
  }

  return (
    <div className="mb-5 rounded-2xl border border-border overflow-hidden">
      {/* Banner row */}
      <div className="flex items-center justify-between gap-3 bg-light-gray px-4 py-3">
        <p className="font-sans text-[0.82rem] text-slate leading-snug">
          Already have an account?{" "}
          <span className="text-deep font-medium">Log in to auto-fill your info and track this order.</span>
        </p>
        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex-shrink-0 font-sans text-[0.8rem] font-semibold text-coral border border-coral px-4 py-1.5 rounded-full hover:bg-coral hover:text-white transition-all duration-150 whitespace-nowrap"
          >
            Log In
          </button>
        )}
      </div>

      {/* Inline login form — slides in */}
      {expanded && (
        <form onSubmit={handleSubmit} className="bg-white px-4 pb-4 pt-3 space-y-3 border-t border-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-sans text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1">Email</label>
              <input
                className={iCls}
                type="email"
                placeholder="jane@realty.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block font-sans text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1">Password</label>
              <input
                className={iCls}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="font-sans text-[0.78rem] text-coral">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="font-sans text-[0.85rem] font-semibold bg-coral text-white px-6 py-2 rounded-full hover:bg-coral-dark transition-colors border-none cursor-pointer disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log In"}
            </button>
            <button
              type="button"
              onClick={() => { setExpanded(false); setError(""); }}
              className="font-sans text-[0.8rem] text-slate hover:text-coral transition-colors underline"
            >
              Continue as guest instead
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
