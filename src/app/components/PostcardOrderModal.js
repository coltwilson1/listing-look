"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ContactStep, ListingStep, labelCls, inputCls, selectCls } from "./OrderFormShared";
import { buildPostcardOrder, getCurrentUser } from "@/app/lib/auth";
import SuccessWithAccount from "./SuccessWithAccount";
import OrderFormLoginBanner from "./OrderFormLoginBanner";

// ── Design tiles (same palette as social) ────────────────────────────────────

const DESIGN_TILES = [
  { id: "d1",  name: "Golden Hour",   bg: "linear-gradient(135deg,#e8b86d 0%,#d4714a 100%)" },
  { id: "d2",  name: "Coastal Blue",  bg: "linear-gradient(135deg,#5b8ccc 0%,#2d4a7a 100%)" },
  { id: "d3",  name: "Blush Luxury",  bg: "linear-gradient(135deg,#f2c4b0 0%,#e8825a 100%)" },
  { id: "d4",  name: "Deep Forest",   bg: "linear-gradient(135deg,#4a7a55 0%,#1c3a2a 100%)" },
  { id: "d5",  name: "Midnight Navy", bg: "linear-gradient(135deg,#4a4a6a 0%,#1c1c2e 100%)" },
  { id: "d6",  name: "Rose Gold",     bg: "linear-gradient(135deg,#e8b4b8 0%,#c4818a 100%)" },
  { id: "d7",  name: "Sage Green",    bg: "linear-gradient(135deg,#a8c5a0 0%,#6a9e6a 100%)" },
  { id: "d8",  name: "Warm Ivory",    bg: "linear-gradient(135deg,#faf7f2 0%,#e8dcc8 100%)" },
  { id: "d9",  name: "Bold Coral",    bg: "linear-gradient(135deg,#ff7043 0%,#e8825a 100%)" },
  { id: "d10", name: "Charcoal",      bg: "linear-gradient(135deg,#616161 0%,#212121 100%)" },
  { id: "d11", name: "Lavender",      bg: "linear-gradient(135deg,#c5b8e8 0%,#8b7dcc 100%)" },
  { id: "d12", name: "Terracotta",    bg: "linear-gradient(135deg,#c97d5a 0%,#8b4a2a 100%)" },
];

// ── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_CONTACT = { name: "", firm: "", phone: "", email: "", instagram: "", facebook: "" };
const INITIAL_LISTING = { address: "", price: "", mls: "", beds: "", baths: "", sqft: "", highlights: "", mlsPublic: false, photoDelivery: "" };
const INITIAL_PRINT = {
  designId: "",
  postcardType: "",
  mailingAudience: "",
  quantity: "",
  fileOption: "",
  agentName: "",
  agentTitle: "",
  agentPhone: "",
  agentEmail: "",
  agentWebsite: "",
  tagline: "",
  headshotFile: "",
  logoFile: "",
  notes: "",
};

const LS_KEY = "tll_postcard_order";

// ── Component ─────────────────────────────────────────────────────────────────

export default function PostcardOrderModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState(INITIAL_CONTACT);
  const [listing, setListing] = useState(INITIAL_LISTING);
  const [print, setPrint] = useState(INITIAL_PRINT);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [builtOrder, setBuiltOrder] = useState(null);

  const headshotRef = useRef(null);
  const logoRef = useRef(null);
  const [sessionUser, setSessionUser] = useState(null);

  function applyUserToContact(u) {
    setContact((p) => ({
      ...p,
      name:  u.name  || p.name,
      email: u.email || p.email,
      firm:  u.brokerage || p.firm,
    }));
  }
  function handleFormLogin(u) {
    setSessionUser(u);
    applyUserToContact(u);
  }

  useEffect(() => {
    if (!open) return;
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
      if (saved.contact) setContact((p) => ({ ...p, ...saved.contact }));
      if (saved.listing) setListing((p) => ({ ...p, ...saved.listing }));
      if (saved.print) setPrint((p) => ({ ...p, ...saved.print }));
    } catch {}
    try {
      const u = getCurrentUser();
      if (u) { setSessionUser(u); applyUserToContact(u); }
    } catch {}
  }, [open]);

  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ contact, listing, print }));
    } catch {}
  }, [open, contact, listing, print]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const setContactField = useCallback((k, v) => setContact((p) => ({ ...p, [k]: v })), []);
  const setListingField = useCallback((k, v) => setListing((p) => ({ ...p, [k]: v })), []);
  const setPrintField = useCallback((k, v) => setPrint((p) => ({ ...p, [k]: v })), []);

  function validate() {
    const e = {};
    if (step === 1) {
      if (!contact.name.trim()) e.name = "Required";
      if (!contact.phone.trim()) e.phone = "Required";
      if (!contact.email.trim()) e.email = "Required";
    }
    if (step === 2) {
      if (!listing.address.trim()) e.address = "Required";
      if (!listing.price.trim()) e.price = "Required";
    }
    if (step === 3) {
      if (!print.designId) e.designId = "Please choose a design style";
      if (!print.postcardType) e.postcardType = "Required";
      if (!print.quantity) e.quantity = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    if (step < 3) { setStep((s) => s + 1); setErrors({}); return; }
    setSubmitting(true);
    setTimeout(async () => {
      const order = buildPostcardOrder({ contact, listing, print });
      try {
        const res = await fetch("/api/orders/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order, clientName: contact.name, clientEmail: contact.email, clientPhone: contact.phone }),
        });
        if (!res.ok) {
          const data = await res.json();
          console.error("Order submit error:", data);
          alert("Order save failed: " + (data.error || res.status));
          setSubmitting(false);
          return;
        }
      } catch (err) {
        console.error("Order submit exception:", err);
        alert("Order save failed: " + err.message);
        setSubmitting(false);
        return;
      }
      setBuiltOrder(order);
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  }

  function handleReset() {
    setStep(1);
    setContact(INITIAL_CONTACT);
    setListing(INITIAL_LISTING);
    setPrint(INITIAL_PRINT);
    setErrors({});
    setSubmitted(false);
    setSessionUser(null);
    try { localStorage.removeItem(LS_KEY); } catch {}
  }

  if (!open) return null;

  const PC_STEP_LABELS = ["Contact Info", "Listing Details", "Postcard Details"];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col sm:flex-row sm:items-center sm:justify-center sm:p-4"
      style={{ background: "rgba(28,28,46,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-cream w-full h-dvh sm:h-auto sm:max-w-[640px] sm:rounded-3xl sm:max-h-[90vh] shadow-2xl flex flex-col">

        {/* ── Header (sticky) ── */}
        <div
          className="bg-deep flex-shrink-0"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <div className="flex justify-between items-center px-5 pt-5 pb-3 sm:px-8 sm:pt-7">
            <div>
              <p className="font-sans text-[0.65rem] uppercase tracking-[0.15em] text-blush/70 mb-0.5">Order Form</p>
              <h2 className="font-serif text-[1.25rem] sm:text-[1.4rem] text-white leading-tight">Postcards & Print</h2>
            </div>
            <div className="flex items-center gap-2">
              {sessionUser && (
                <div className="w-8 h-8 rounded-full bg-coral flex items-center justify-center flex-shrink-0">
                  <span className="font-sans text-[0.75rem] font-bold text-white leading-none">
                    {sessionUser.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
              )}
              {/* Close — minimum 44×44px tap target */}
              <button
                onClick={onClose}
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors flex items-center justify-center text-white flex-shrink-0"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M2 2l12 12M14 2L2 14"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Step progress — circles + labels */}
          {!submitted && (
            <div className="px-5 pb-5 sm:px-8">
              <div className="flex items-start">
                {PC_STEP_LABELS.map((label, i) => {
                  const n = i + 1;
                  const done = n < step;
                  const current = n === step;
                  return (
                    <div key={n} className="flex-1 flex flex-col items-center relative">
                      {i > 0 && (
                        <div className="absolute right-1/2 left-0 top-[13px] h-px transition-colors duration-300"
                          style={{ background: done || current ? "#E8825A" : "rgba(255,255,255,0.2)" }} />
                      )}
                      {i < PC_STEP_LABELS.length - 1 && (
                        <div className="absolute left-1/2 right-0 top-[13px] h-px transition-colors duration-300"
                          style={{ background: done ? "#E8825A" : "rgba(255,255,255,0.2)" }} />
                      )}
                      <div className={`relative z-10 w-[26px] h-[26px] rounded-full flex items-center justify-center font-sans text-[0.68rem] font-bold transition-all duration-300 ${
                        done ? "bg-coral text-white" :
                        current ? "bg-coral text-white ring-4 ring-coral/25" :
                        "bg-white/10 text-white/40"
                      }`}>
                        {done ? (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : n}
                      </div>
                      <p className={`font-sans text-[0.6rem] text-center mt-1.5 leading-tight px-0.5 transition-colors duration-300 ${
                        current ? "text-blush font-semibold" : done ? "text-blush/60" : "text-white/30"
                      }`}>
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="overflow-y-auto flex-1 px-5 py-6 sm:px-8 sm:py-7">
          {submitted && builtOrder ? (
            <SuccessWithAccount
              contactName={contact.name}
              email={contact.email}
              order={builtOrder}
              onReset={handleReset}
              onClose={onClose}
            >
              <div className="space-y-1.5">
                <div className="flex justify-between font-sans text-[0.82rem]">
                  <span className="text-slate">Type</span>
                  <span className="text-deep font-medium capitalize">{print.postcardType?.replace(/-/g," ")}</span>
                </div>
                <div className="flex justify-between font-sans text-[0.82rem]">
                  <span className="text-slate">Address</span>
                  <span className="text-deep font-medium text-right max-w-[55%]">{listing.address}</span>
                </div>
                <div className="flex justify-between font-sans text-[0.82rem]">
                  <span className="text-slate">Quantity</span>
                  <span className="text-deep font-medium">{print.quantity}</span>
                </div>
              </div>
            </SuccessWithAccount>
          ) : !submitted ? (
            <>
              {step === 1 && (
                <>
                  {sessionUser ? (
                    <div className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <span className="font-sans text-[0.75rem] font-bold text-white leading-none">
                          {sessionUser.name?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <p className="font-sans text-[0.82rem] text-emerald-800 leading-snug">
                        Welcome back, <span className="font-semibold">{sessionUser.name?.split(" ")[0]}</span>! Your info has been auto-filled.
                      </p>
                    </div>
                  ) : (
                    <OrderFormLoginBanner onLogin={handleFormLogin} />
                  )}
                  <ContactStep data={contact} onChange={setContactField} />
                </>
              )}
              {step === 2 && <ListingStep data={listing} onChange={setListingField} />}
              {step === 3 && (
                <PrintStep
                  data={print}
                  onChange={setPrintField}
                  errors={errors}
                  headshotRef={headshotRef}
                  logoRef={logoRef}
                />
              )}
              {Object.keys(errors).length > 0 && (
                <p className="font-sans text-[0.8rem] text-coral mt-3">
                  Please fill in all required fields above.
                </p>
              )}
            </>
          ) : null}
        </div>

        {/* ── Footer ── */}
        {!submitted && (
          <div
            className="px-5 pt-4 border-t border-border flex justify-between items-center flex-shrink-0 bg-cream sm:px-8 sm:py-5"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}
          >
            {step > 1 ? (
              <button
                onClick={() => { setStep((s) => s - 1); setErrors({}); }}
                className="min-h-[44px] font-sans text-[0.88rem] text-slate hover:text-deep active:text-deep transition-colors flex items-center gap-1.5 px-2"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10 3L5 8l5 5"/>
                </svg>
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={handleNext}
              disabled={submitting}
              className="min-h-[44px] font-sans bg-coral text-white font-semibold text-[0.9rem] px-8 py-3 rounded-full hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(232,130,90,0.4)] active:bg-coral-dark transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting…" : step === 3 ? "Submit Order" : "Continue"}
              {!submitting && step < 3 && (
                <svg className="inline ml-1.5" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M3 7h8M8 4l3 3-3 3"/>
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 3 — Postcard Details ─────────────────────────────────────────────────

function PrintStep({ data, onChange, errors, headshotRef, logoRef }) {
  return (
    <div className="step-animate space-y-7">
      {/* Design tiles */}
      <div>
        <p className={labelCls}>Choose a Design Style {errors.designId && <span className="text-coral normal-case font-normal tracking-normal ml-2">{errors.designId}</span>}</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
          {DESIGN_TILES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange("designId", t.id)}
              title={t.name}
              className={`relative rounded-xl overflow-hidden aspect-square transition-all duration-150 ${
                data.designId === t.id
                  ? "ring-2 ring-coral ring-offset-2 ring-offset-cream scale-105"
                  : "hover:scale-105 opacity-80 hover:opacity-100"
              }`}
              style={{ background: t.bg }}
            >
              {data.designId === t.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
                    <path d="M3 9l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
              )}
              <span className="absolute bottom-1 left-0 right-0 text-center font-sans text-[0.55rem] text-white/90 font-medium drop-shadow px-0.5 leading-tight">
                {t.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Postcard type + audience */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Postcard Type {errors.postcardType && <span className="text-coral normal-case font-normal tracking-normal ml-2">Required</span>}
          </label>
          <select
            className={selectCls}
            value={data.postcardType}
            onChange={(e) => onChange("postcardType", e.target.value)}
          >
            <option value="">Select…</option>
            <option value="just-listed">Just Listed</option>
            <option value="just-sold">Just Sold</option>
            <option value="open-house">Open House Invitation</option>
            <option value="farming">Neighborhood Farming</option>
            <option value="market-update">Market Update</option>
            <option value="custom">Custom / Other</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Mailing Audience</label>
          <select
            className={selectCls}
            value={data.mailingAudience}
            onChange={(e) => onChange("mailingAudience", e.target.value)}
          >
            <option value="">Select…</option>
            <option value="just-listed-neighbors">Just-Listed Neighbors</option>
            <option value="farm-area">Geographic Farm Area</option>
            <option value="past-clients">Past Clients</option>
            <option value="sphere">Sphere of Influence</option>
            <option value="open-house-invites">Open House Invites</option>
            <option value="custom">Custom List</option>
          </select>
        </div>
      </div>

      {/* Quantity + file option */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>
            Mailing Quantity {errors.quantity && <span className="text-coral normal-case font-normal tracking-normal ml-2">Required</span>}
          </label>
          <select
            className={selectCls}
            value={data.quantity}
            onChange={(e) => onChange("quantity", e.target.value)}
          >
            <option value="">Select…</option>
            <option value="100">100 postcards</option>
            <option value="250">250 postcards</option>
            <option value="500">500 postcards</option>
            <option value="1000">1,000 postcards</option>
            <option value="digital-only">Digital file only (I'll print)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>File Delivery</label>
          <select
            className={selectCls}
            value={data.fileOption}
            onChange={(e) => onChange("fileOption", e.target.value)}
          >
            <option value="">Select…</option>
            <option value="print-ready-pdf">Print-ready PDF</option>
            <option value="canva-link">Editable Canva link</option>
            <option value="both">Both PDF + Canva</option>
          </select>
        </div>
      </div>

      {/* Back of postcard — agent info */}
      <div>
        <p className={labelCls + " text-[0.7rem] font-bold text-coral mb-3"}>Back of Postcard — Agent Info</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Agent Name</label>
            <input className={inputCls} placeholder="Jane Smith" value={data.agentName} onChange={(e) => onChange("agentName", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Title / License #</label>
            <input className={inputCls} placeholder="Realtor® | BK3123456" value={data.agentTitle} onChange={(e) => onChange("agentTitle", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Agent Phone</label>
            <input className={inputCls} type="tel" placeholder="(555) 000-0000" value={data.agentPhone} onChange={(e) => onChange("agentPhone", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Agent Email</label>
            <input className={inputCls} type="email" placeholder="jane@firm.com" value={data.agentEmail} onChange={(e) => onChange("agentEmail", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Website</label>
            <input className={inputCls} placeholder="www.janesmith.com" value={data.agentWebsite} onChange={(e) => onChange("agentWebsite", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Personal Tagline</label>
            <input className={inputCls} placeholder="Your home. My mission." value={data.tagline} onChange={(e) => onChange("tagline", e.target.value)} />
          </div>
        </div>
      </div>

      {/* File uploads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FileUploadField
          label="Headshot Photo"
          hint="JPG or PNG, high-res preferred"
          fileRef={headshotRef}
          fileName={data.headshotFile}
          onChange={(name) => onChange("headshotFile", name)}
        />
        <FileUploadField
          label="Brokerage Logo"
          hint="PNG with transparent background preferred"
          fileRef={logoRef}
          fileName={data.logoFile}
          onChange={(name) => onChange("logoFile", name)}
        />
      </div>

      {/* Notes */}
      <div>
        <label className={labelCls}>Additional Notes</label>
        <textarea
          className={inputCls + " resize-none"}
          rows={3}
          placeholder="Any special instructions, colors, or details…"
          value={data.notes}
          onChange={(e) => onChange("notes", e.target.value)}
        />
      </div>
    </div>
  );
}

// ── File upload helper ────────────────────────────────────────────────────────

function FileUploadField({ label, hint, fileRef, fileName, onChange }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full border-2 border-dashed border-border rounded-xl py-4 px-4 text-center hover:border-coral transition-colors duration-200 group"
      >
        {fileName ? (
          <span className="font-sans text-[0.82rem] text-deep font-medium break-all">{fileName}</span>
        ) : (
          <>
            <span className="block text-xl mb-1 opacity-50 group-hover:opacity-80 transition-opacity">📎</span>
            <span className="font-sans text-[0.8rem] text-slate group-hover:text-coral transition-colors">
              Click to attach
            </span>
            <span className="block font-sans text-[0.7rem] text-slate/50 mt-0.5">{hint}</span>
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        className="sr-only"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file.name);
        }}
      />
    </div>
  );
}

