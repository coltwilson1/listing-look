"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, login, createAccount, logout } from "@/app/lib/auth";

export default function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  // Login form state
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError]       = useState("");
  const [loginLoading, setLoginLoading]   = useState(false);

  // Signup form state
  const [signupFirstName, setSignupFirstName] = useState("");
  const [signupLastName, setSignupLastName]   = useState("");
  const [signupEmail, setSignupEmail]         = useState("");
  const [signupBrokerage, setSignupBrokerage] = useState("");
  const [signupPassword, setSignupPassword]   = useState("");
  const [signupError, setSignupError]         = useState("");
  const [signupLoading, setSignupLoading]     = useState(false);

  const openModal = (tab = "login") => {
    setActiveTab(tab);
    setLoginError("");
    setSignupError("");
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  // On mount, check for existing session
  useEffect(() => {
    getCurrentUser().then(setCurrentUser).catch(() => {});
  }, []);

  // Listen for authChanged events to refresh user state
  useEffect(() => {
    const handler = () => {
      getCurrentUser().then(setCurrentUser).catch(() => {});
    };
    window.addEventListener("authChanged", handler);
    return () => window.removeEventListener("authChanged", handler);
  }, []);

  // Allow other page sections to trigger the modal via a custom event
  useEffect(() => {
    const handler = (e) => openModal(e.detail || "signup");
    document.addEventListener("openAuthModal", handler);
    return () => document.removeEventListener("openAuthModal", handler);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (!result.success) return setLoginError(result.error);
    setCurrentUser(result.user);
    window.dispatchEvent(new Event("authChanged"));
    closeModal();
    window.location.href = "/portal";
  }

  async function handleSignup(e) {
    e.preventDefault();
    setSignupError("");
    if (!signupFirstName.trim()) return setSignupError("First name is required.");
    if (!signupEmail.trim()) return setSignupError("Email is required.");
    if (signupPassword.length < 6) return setSignupError("Password must be at least 6 characters.");
    setSignupLoading(true);
    const fullName = [signupFirstName.trim(), signupLastName.trim()].filter(Boolean).join(" ");
    const result = await createAccount({ name: fullName, email: signupEmail, password: signupPassword, brokerage: signupBrokerage });
    setSignupLoading(false);
    if (!result.success) return setSignupError(result.error);
    setCurrentUser(result.user);
    window.dispatchEvent(new Event("authChanged"));
    closeModal();
    window.location.href = "/portal";
  }

  async function handleLogout() {
    await logout();
    setCurrentUser(null);
    window.dispatchEvent(new Event("authChanged"));
  }

  const firstName = currentUser?.name?.split(" ")[0] || null;

  const inputClass =
    "w-full bg-light-gray border border-border rounded-xl px-4 py-3 text-deep text-sm focus:outline-none focus:border-coral transition-colors placeholder:text-slate/40";
  const labelClass =
    "block text-xs font-semibold text-slate uppercase tracking-wider mb-1.5";

  return (
    <>
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-[70px] flex items-center justify-between px-8 bg-cream/[0.92] backdrop-blur-md border-b border-border">
        <a
          href="#"
          className="font-serif text-[1.4rem] text-deep tracking-[0.02em] no-underline"
        >
          The Listing <span className="text-coral">Look</span>
        </a>

        <ul className="hidden md:flex gap-8 items-center list-none m-0 p-0">
          <li>
            <a href="#how-it-works" className="text-slate text-[0.9rem] font-medium no-underline hover:text-coral transition-colors">
              How It Works
            </a>
          </li>
          <li>
            <a href="#services" className="text-slate text-[0.9rem] font-medium no-underline hover:text-coral transition-colors">
              Services
            </a>
          </li>
          <li>
            <a href="#custom" className="text-slate text-[0.9rem] font-medium no-underline hover:text-coral transition-colors">
              Custom Order
            </a>
          </li>
          {!currentUser && (
            <li>
              <button
                onClick={() => openModal("signup")}
                className="bg-coral text-white px-5 py-2 rounded-full text-[0.9rem] font-semibold hover:bg-coral-dark transition-colors border-none cursor-pointer"
              >
                Get Started
              </button>
            </li>
          )}
        </ul>

        {/* Right-side auth area */}
        {currentUser ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:block font-sans text-[0.82rem] text-slate">
              Hi, {firstName}
            </span>
            <a
              href="/portal"
              className="bg-coral text-white px-4 py-2 rounded-full text-[0.85rem] font-semibold hover:bg-coral-dark transition-colors no-underline"
            >
              Agent Portal
            </a>
            <button
              onClick={handleLogout}
              className="font-sans text-[0.8rem] text-slate/60 hover:text-coral transition-colors border-none bg-transparent cursor-pointer"
            >
              Log out
            </button>
          </div>
        ) : (
          <button
            onClick={() => openModal("login")}
            className="border border-border text-slate text-[0.85rem] font-medium px-4 py-2 rounded-full hover:border-coral hover:text-coral transition-all bg-transparent cursor-pointer"
          >
            Log In
          </button>
        )}
      </nav>

      {/* ── Auth Modal ── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-deep/70 backdrop-blur-[6px] z-[2000] flex items-center justify-center p-8"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-3xl p-10 w-full max-w-[480px] relative shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-light-gray border-none flex items-center justify-center text-slate cursor-pointer hover:bg-border transition-colors text-sm"
            >
              ✕
            </button>

            <h2 className="font-serif text-[1.8rem] text-deep mb-1">
              {activeTab === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-slate text-sm mb-6">
              {activeTab === "login"
                ? "Log in to track your orders and manage assets."
                : "Sign up free to manage orders and keep your brand info handy."}
            </p>

            {/* Tabs */}
            <div className="flex bg-light-gray rounded-xl p-1 mb-6 gap-1">
              {["login", "signup"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setLoginError(""); setSignupError(""); }}
                  className={`flex-1 py-2 rounded-[0.5rem] text-[0.9rem] font-medium transition-all border-none cursor-pointer ${
                    activeTab === tab
                      ? "bg-white text-deep font-semibold shadow-sm"
                      : "text-slate bg-transparent"
                  }`}
                >
                  {tab === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            {activeTab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    placeholder="jane@realty.com"
                    className={inputClass}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={inputClass}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                {loginError && <p className="font-sans text-[0.82rem] text-coral">{loginError}</p>}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-coral text-white font-semibold py-4 rounded-full hover:bg-coral-dark transition-all mt-2 cursor-pointer border-none text-[0.95rem] disabled:opacity-60"
                >
                  {loginLoading ? "Logging in…" : "Log In to My Account"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input
                      type="text"
                      placeholder="Jane"
                      className={inputClass}
                      value={signupFirstName}
                      onChange={(e) => setSignupFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input
                      type="text"
                      placeholder="Smith"
                      className={inputClass}
                      value={signupLastName}
                      onChange={(e) => setSignupLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    placeholder="jane@realty.com"
                    className={inputClass}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Brokerage (optional)</label>
                  <input
                    type="text"
                    placeholder="Your brokerage name"
                    className={inputClass}
                    value={signupBrokerage}
                    onChange={(e) => setSignupBrokerage(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Password</label>
                  <input
                    type="password"
                    placeholder="Create a password"
                    className={inputClass}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                </div>
                {signupError && <p className="font-sans text-[0.82rem] text-coral">{signupError}</p>}
                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full bg-coral text-white font-semibold py-4 rounded-full hover:bg-coral-dark transition-all mt-2 cursor-pointer border-none text-[0.95rem] disabled:opacity-60"
                >
                  {signupLoading ? "Creating Account…" : "Create My Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
