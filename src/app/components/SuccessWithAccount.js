"use client";

import { useState, useEffect } from "react";
import { createAccount, login, getCurrentUser, addOrderToUser } from "@/app/lib/auth";

export default function SuccessWithAccount({ contactName, email, order, onReset, onClose, children }) {
  const [mode, setMode]       = useState("create"); // "create" | "login"
  const [name, setName]       = useState(contactName || "");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPw]   = useState("");
  const [loginEmail, setLoginEmail]       = useState(email);
  const [loginPassword, setLoginPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  const iCls = "w-full font-sans text-[0.9rem] text-deep bg-cream border border-border rounded-xl px-4 py-2.5 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all placeholder:text-slate/40";
  const lCls = "block font-sans text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1.5";

  // Check if already logged in
  useEffect(() => {
    async function check() {
      try {
        const user = await getCurrentUser();
        if (user) {
          await addOrderToUser(user.email, order);
          window.dispatchEvent(new CustomEvent("showToast", { detail: { message: `Confirmation email sent to ${email}` } }));
          setAlreadyLoggedIn(true);
          setDone(true);
        }
      } catch {}
    }
    check();
  }, [email, order]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please enter your name.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords don't match.");
    setLoading(true);
    const result = await createAccount({ name: name.trim(), email, password }, order);
    setLoading(false);
    if (!result.success) return setError(result.error);
    window.dispatchEvent(new CustomEvent("showToast", { detail: { message: `Confirmation email sent to ${email}` } }));
    setDone(true);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!loginEmail.trim() || !loginPassword) return setError("Please fill in all fields.");
    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);
    if (!result.success) return setError(result.error);
    await addOrderToUser(result.user.email, order);
    window.dispatchEvent(new CustomEvent("showToast", { detail: { message: `Confirmation email sent to ${email}` } }));
    setDone(true);
  }

  if (done && alreadyLoggedIn) {
    return (
      <div className="step-animate space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-3 text-2xl">🎉</div>
          <h3 className="font-serif text-[1.5rem] text-deep mb-1">Order Received!</h3>
          <p className="font-sans text-[0.85rem] text-slate">We'll have your proof ready within 48 hours.</p>
        </div>

        {children && <div className="bg-light-gray rounded-2xl p-4">{children}</div>}

        <div className="bg-deep rounded-2xl p-5">
          <p className="font-sans text-[0.75rem] text-blush/70 uppercase tracking-[0.1em] mb-1.5">Complete Your Payment</p>
          <p className="font-sans text-[0.85rem] text-white/75 leading-relaxed mb-4">
            Send payment via Venmo to get started. Include your property address in the note.
          </p>
          <div className="inline-flex items-center gap-2 bg-[#008CFF] text-white font-bold text-[0.88rem] px-5 py-2 rounded-full">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M19.5 2C20.9 2 22 3.1 22 4.5c0 .9-.5 2.2-1.3 3.5L14 20.5H8.3L5 2H10l1.8 10.7L16.5 2H19.5z"/>
            </svg>
            @TheListingLook
          </div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="/portal"
            className="font-sans bg-coral text-white font-semibold text-[0.9rem] px-7 py-2.5 rounded-full hover:bg-coral-dark transition-colors duration-200 no-underline inline-block"
          >
            View My Orders →
          </a>
          <button
            onClick={onReset}
            className="font-sans text-[0.88rem] text-slate border border-border px-6 py-2.5 rounded-full hover:border-coral hover:text-coral transition-all duration-200"
          >
            Start Another Order
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="step-animate text-center py-4">
        <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
        <h3 className="font-serif text-[1.6rem] text-deep mb-2">You're all set!</h3>
        <p className="font-sans text-[0.9rem] text-slate leading-relaxed mb-6 max-w-[380px] mx-auto">
          Your account is ready and your order is saved. Check your email for confirmation details.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="/portal"
            className="font-sans bg-coral text-white font-semibold text-[0.9rem] px-8 py-2.5 rounded-full hover:bg-coral-dark transition-colors duration-200 no-underline inline-block"
          >
            Go to My Portal →
          </a>
          <button
            onClick={onReset}
            className="font-sans text-[0.88rem] text-slate border border-border px-6 py-2.5 rounded-full hover:border-coral hover:text-coral transition-all duration-200"
          >
            Start Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="step-animate space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-3 text-2xl">🎉</div>
        <h3 className="font-serif text-[1.5rem] text-deep mb-1">Your request has been submitted!</h3>
        <p className="font-sans text-[0.85rem] text-slate">We'll get started on your design within 48 hours.</p>
      </div>

      {children && (
        <div className="bg-light-gray rounded-2xl p-4">{children}</div>
      )}

      <div className="border-t border-border pt-5">
        <h4 className="font-serif text-[1.15rem] text-deep mb-1">
          {mode === "create" ? "Create your free account to track your order" : "Log in to attach this order"}
        </h4>
        <p className="font-sans text-[0.82rem] text-slate leading-relaxed mb-4">
          {mode === "create"
            ? `We'll email your order details and a portal link to ${email}. Create your account below to instantly access your order status, communicate with our team, and approve your proof when it's ready.`
            : "Log in to attach this order to your existing account and track it in your portal."}
        </p>

        {mode === "create" ? (
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className={lCls}>Your Name</label>
              <input className={iCls} placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={lCls}>Email</label>
              <input className={iCls + " opacity-60 cursor-not-allowed"} value={email} readOnly />
            </div>
            <div>
              <label className={lCls}>Create a Password</label>
              <input className={iCls} type="password" placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <label className={lCls}>Confirm Password</label>
              <input className={iCls} type="password" placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPw(e.target.value)} />
            </div>
            {error && <p className="font-sans text-[0.8rem] text-coral">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-sans bg-coral text-white font-semibold text-[0.9rem] py-3 rounded-full hover:bg-coral-dark transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account…" : "Create My Account & View Order"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className={lCls}>Email</label>
              <input className={iCls} type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
            </div>
            <div>
              <label className={lCls}>Password</label>
              <input className={iCls} type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
            </div>
            {error && <p className="font-sans text-[0.8rem] text-coral">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-sans bg-coral text-white font-semibold text-[0.9rem] py-3 rounded-full hover:bg-coral-dark transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging In…" : "Log In & Attach Order"}
            </button>
          </form>
        )}

        <div className="text-center mt-3">
          {mode === "create" ? (
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className="font-sans text-[0.82rem] text-slate hover:text-coral transition-colors underline"
            >
              Already have an account? Log in here
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setMode("create"); setError(""); }}
              className="font-sans text-[0.82rem] text-slate hover:text-coral transition-colors underline"
            >
              Don't have an account? Create one free
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
