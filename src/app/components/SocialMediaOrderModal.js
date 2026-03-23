"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ContactStep, ListingStep, labelCls, inputCls } from "./OrderFormShared";
import { buildSocialOrder, getCurrentUser } from "@/app/lib/auth";
import SuccessWithAccount from "./SuccessWithAccount";
import OrderFormLoginBanner from "./OrderFormLoginBanner";

// ── Graphic types ─────────────────────────────────────────────────────────────

const GRAPHIC_TYPES = [
  { id: "just-listed",      emoji: "🏡", label: "Just Listed" },
  { id: "just-sold",        emoji: "🎉", label: "Just Sold" },
  { id: "open-house",       emoji: "🚪", label: "Open House" },
  { id: "under-contract",   emoji: "🤝", label: "Under Contract" },
  { id: "price-reduction",  emoji: "💰", label: "Price Reduction" },
  { id: "custom",           emoji: "✨", label: "Custom / Other" },
];

// ── Package descriptions keyed by graphic type ────────────────────────────────

const PKG_DESC = {
  "just-listed": {
    starter:  "1 Just Listed feed post",
    standard: "1 Just Listed feed post + 1 Just Listed story",
    premium:  "1 Just Listed feed post + 1 story + 1 animated graphic",
  },
  "just-sold": {
    starter:  "1 Just Sold feed post",
    standard: "1 Just Sold feed post + 1 Just Sold story",
    premium:  "1 Just Sold feed post + 1 story + 1 animated graphic",
  },
  "open-house": {
    starter:  "1 Open House announcement graphic",
    standard: "1 Open House post + 1 Open House story",
    premium:  "1 Open House post + 1 story + 1 animated graphic",
  },
  "under-contract": {
    starter:  "1 Under Contract feed post",
    standard: "1 Under Contract post + 1 Under Contract story",
    premium:  "1 Under Contract post + 1 story + 1 animated graphic",
  },
  "price-reduction": {
    starter:  "1 Price Reduction feed post",
    standard: "1 Price Reduction post + 1 Price Reduction story",
    premium:  "1 Price Reduction post + 1 story + 1 animated graphic",
  },
  custom: {
    starter:  "1 custom graphic (you describe what you need)",
    standard: "1 custom feed post + 1 custom story graphic",
    premium:  "1 custom feed post + 1 story + 1 animated graphic",
  },
};

// ── Animation & music options (Premium only) ─────────────────────────────────

const ANIMATION_STYLES = [
  { id: "classy",   emoji: "🥂", label: "Classy",   desc: "Smooth, elegant reveals" },
  { id: "lively",   emoji: "⚡", label: "Lively",   desc: "Energetic, fast-paced" },
  { id: "fun",      emoji: "🎉", label: "Fun",       desc: "Playful and bouncy" },
  { id: "bold",     emoji: "💥", label: "Bold",      desc: "Strong, punchy cuts" },
  { id: "minimal",  emoji: "🤍", label: "Minimal",   desc: "Subtle, understated" },
  { id: "cinematic",emoji: "🎬", label: "Cinematic", desc: "Dramatic, story-driven" },
];

const MUSIC_STYLES = [
  { id: "upbeat-pop",    emoji: "🎵", label: "Upbeat Pop" },
  { id: "acoustic-warm", emoji: "🎸", label: "Acoustic / Warm" },
  { id: "hip-hop",       emoji: "🔥", label: "Hip-Hop / Trendy" },
  { id: "corporate",     emoji: "💼", label: "Corporate / Clean" },
  { id: "cinematic",     emoji: "🎻", label: "Cinematic / Epic" },
  { id: "no-music",      emoji: "🔇", label: "No Music" },
];

function getPackages(graphicType) {
  const desc = PKG_DESC[graphicType] || PKG_DESC.custom;
  return [
    {
      id: "starter",
      name: "Starter",
      price: "$25",
      description: desc.starter,
      tagline: "Perfect for a quick announcement",
      extras: ["1 revision included", "48-hr turnaround"],
    },
    {
      id: "standard",
      name: "Standard",
      price: "$35",
      popular: true,
      description: desc.standard,
      tagline: "Full Instagram and Facebook coverage",
      extras: ["1 revision included", "48-hr turnaround"],
    },
    {
      id: "premium",
      name: "Premium",
      price: "$45",
      description: desc.premium,
      tagline: "Maximum exposure across all platforms",
      extras: ["2 revisions included", "24-hr turnaround"],
    },
  ];
}

// ── Design tiles ──────────────────────────────────────────────────────────────

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
const INITIAL_LISTING = {
  graphicType: "",
  customRequest: "",
  address: "", price: "", mls: "", beds: "", baths: "", sqft: "",
  highlights: "", mlsPublic: false, notes: "",
};
const INITIAL_PHOTOS  = { photoOption: "", mlsLink: "", photoNames: [] };
const INITIAL_PKG     = { packageId: "", animationStyle: "", musicStyle: "" };
const INITIAL_DESIGN  = { designId: "" };

const LS_KEY = "tll_social_order";
const STEP_LABELS = ["Contact Info", "Graphic Details", "Photos & Package", "Choose Design"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SocialMediaOrderModal({ open, onClose }) {
  const [step, setStep] = useState(1);
  const [contact, setContact]   = useState(INITIAL_CONTACT);
  const [listing, setListing]   = useState(INITIAL_LISTING);
  const [photos, setPhotos]     = useState(INITIAL_PHOTOS);
  const [pkg, setPkg]           = useState(INITIAL_PKG);
  const [design, setDesign]     = useState(INITIAL_DESIGN);
  const [errors, setErrors]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [builtOrder, setBuiltOrder] = useState(null);
  const [sessionUser, setSessionUser] = useState(null); // logged-in user in this form session

  // Non-serializable photo state (for thumbnail previews)
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoUrls, setPhotoUrls]   = useState([]);
  const photoInputRef = useRef(null);

  // Load from localStorage + auto-fill from session user
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
        if (saved.contact) setContact((p) => ({ ...p, ...saved.contact }));
        if (saved.listing) setListing((p) => ({ ...p, ...saved.listing }));
        if (saved.photos)  setPhotos((p)  => ({ ...p, ...saved.photos  }));
        if (saved.pkg)     setPkg((p)     => ({ ...p, ...saved.pkg     }));
        if (saved.design)  setDesign((p)  => ({ ...p, ...saved.design  }));
      } catch {}
      try {
        const u = await getCurrentUser();
        if (u) { setSessionUser(u); applyUserToContact(u); }
      } catch {}
    })();
  }, [open]);

  // Save to localStorage
  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ contact, listing, photos, pkg, design }));
    } catch {}
  }, [open, contact, listing, photos, pkg, design]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => photoUrls.forEach((url) => URL.revokeObjectURL(url));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const setContactField = useCallback((k, v) => setContact((p) => ({ ...p, [k]: v })), []);
  const setListingField = useCallback((k, v) => setListing((p) => ({ ...p, [k]: v })), []);
  const setPhotosField  = useCallback((k, v) => setPhotos((p)  => ({ ...p, [k]: v })), []);

  // Photo upload handlers
  function handlePhotoAdd(e) {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - photoFiles.length;
    const toAdd = files.slice(0, remaining);
    const newUrls = toAdd.map((f) => URL.createObjectURL(f));
    setPhotoFiles((p) => [...p, ...toAdd]);
    setPhotoUrls((p)  => [...p, ...newUrls]);
    setPhotos((p) => ({ ...p, photoNames: [...p.photoNames, ...toAdd.map((f) => f.name)] }));
    e.target.value = "";
  }

  function handlePhotoRemove(i) {
    URL.revokeObjectURL(photoUrls[i]);
    setPhotoFiles((p) => p.filter((_, idx) => idx !== i));
    setPhotoUrls((p)  => p.filter((_, idx) => idx !== i));
    setPhotos((p) => ({ ...p, photoNames: p.photoNames.filter((_, idx) => idx !== i) }));
  }

  // Validation
  function validate() {
    const e = {};
    if (step === 1) {
      if (!contact.name.trim())  e.name  = "Required";
      if (!contact.phone.trim()) e.phone = "Required";
      if (!contact.email.trim()) e.email = "Required";
    }
    if (step === 2) {
      if (!listing.graphicType)                                          e.graphicType    = "Required";
      if (listing.graphicType === "custom" && !listing.customRequest?.trim()) e.customRequest = "Required";
      if (!listing.address.trim())                                       e.address        = "Required";
      if (!listing.price.trim())                                         e.price          = "Required";
    }
    if (step === 3) {
      if (listing.graphicType !== "custom" && !photos.photoOption) e.photoOption = "Required";
      if (!pkg.packageId) e.packageId = "Please choose a package";
    }
    if (step === 4) {
      if (!design.designId) e.designId = "Please choose a design style";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    if (step < 4) { setStep((s) => s + 1); setErrors({}); return; }
    setSubmitting(true);
    setTimeout(async () => {
      const order = buildSocialOrder({ contact, listing, photos, pkg, design });
      try {
        const res = await fetch("/api/orders/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order, clientName: contact.name, clientEmail: contact.email, clientPhone: contact.phone }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          console.error("[TLL] Order save failed:", res.status, body);
          alert(`Order save failed (${res.status}): ${body.error || "unknown error"}`);
        }
      } catch (err) {
        console.error("[TLL] Order submit fetch error:", err);
        alert("Order submit error: " + err.message);
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
    setPhotos(INITIAL_PHOTOS);
    setPkg(INITIAL_PKG);
    setDesign(INITIAL_DESIGN);
    setErrors({});
    setSubmitted(false);
    photoUrls.forEach((url) => URL.revokeObjectURL(url));
    setPhotoFiles([]);
    setPhotoUrls([]);
    try { localStorage.removeItem(LS_KEY); } catch {}
  }

  if (!open) return null;

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
              <h2 className="font-serif text-[1.25rem] sm:text-[1.4rem] text-white leading-tight">Social Media Graphics</h2>
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
                {STEP_LABELS.map((label, i) => {
                  const n = i + 1;
                  const done = n < step;
                  const current = n === step;
                  return (
                    <div key={n} className="flex-1 flex flex-col items-center relative">
                      {/* Left connector */}
                      {i > 0 && (
                        <div className="absolute right-1/2 left-0 top-[13px] h-px transition-colors duration-300"
                          style={{ background: done || current ? "#E8825A" : "rgba(255,255,255,0.2)" }} />
                      )}
                      {/* Right connector */}
                      {i < STEP_LABELS.length - 1 && (
                        <div className="absolute left-1/2 right-0 top-[13px] h-px transition-colors duration-300"
                          style={{ background: done ? "#E8825A" : "rgba(255,255,255,0.2)" }} />
                      )}
                      {/* Circle */}
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
                      {/* Label */}
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
                  <span className="text-slate">Graphic Type</span>
                  <span className="text-deep font-medium">{GRAPHIC_TYPES.find(t => t.id === listing.graphicType)?.label}</span>
                </div>
                <div className="flex justify-between font-sans text-[0.82rem]">
                  <span className="text-slate">Address</span>
                  <span className="text-deep font-medium text-right max-w-[55%]">{listing.address}</span>
                </div>
                <div className="flex justify-between font-sans text-[0.82rem]">
                  <span className="text-slate">Package</span>
                  <span className="text-deep font-medium">{pkg.packageId && (pkg.packageId.charAt(0).toUpperCase() + pkg.packageId.slice(1))} — {{"starter":"$25","standard":"$35","premium":"$45"}[pkg.packageId]}</span>
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

              {step === 2 && (
                <Step2
                  listing={listing}
                  onChange={setListingField}
                  errors={errors}
                />
              )}

              {step === 3 && (
                <Step3
                  photos={photos}
                  onPhotosChange={setPhotosField}
                  photoFiles={photoFiles}
                  photoUrls={photoUrls}
                  onPhotoAdd={handlePhotoAdd}
                  onPhotoRemove={handlePhotoRemove}
                  photoInputRef={photoInputRef}
                  pkg={pkg}
                  onPkgChange={(k, v) => setPkg((p) => ({ ...p, [k]: v }))}
                  graphicType={listing.graphicType}
                  errors={errors}
                />
              )}

              {step === 4 && (
                <Step4
                  designId={design.designId}
                  onChange={(id) => setDesign({ designId: id })}
                  errors={errors}
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
              {submitting ? "Submitting…" : step === 4 ? "Submit Order" : "Continue"}
              {!submitting && step < 4 && (
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

// ── Step 2 — Graphic Type + Listing Details ───────────────────────────────────

function Step2({ listing, onChange, errors }) {
  return (
    <div className="step-animate space-y-6">
      {/* Graphic type selector */}
      <div>
        <p className={labelCls}>
          What type of graphic do you need? *
          {errors.graphicType && (
            <span className="text-coral normal-case font-normal tracking-normal ml-2">Required</span>
          )}
        </p>
        <div className="grid grid-cols-3 gap-2.5 mt-2">
          {GRAPHIC_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange("graphicType", t.id)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl py-4 px-2 border-2 transition-all duration-200 ${
                listing.graphicType === t.id
                  ? "border-coral bg-coral/8 shadow-[0_0_0_3px_rgba(232,130,90,0.15)]"
                  : "border-border bg-white hover:border-coral/40 hover:bg-light-gray"
              }`}
            >
              <span className="text-2xl leading-none">{t.emoji}</span>
              <span
                className={`font-sans text-[0.78rem] font-semibold leading-tight text-center transition-colors ${
                  listing.graphicType === t.id ? "text-coral" : "text-deep"
                }`}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Custom request description — shown only when Custom / Other is selected */}
        {listing.graphicType === "custom" && (
          <div className="mt-3 step-animate">
            <label className={labelCls}>
              Describe Your Custom Request *
              {errors.customRequest && (
                <span className="text-coral normal-case font-normal tracking-normal ml-2">Required</span>
              )}
            </label>
            <textarea
              className={inputCls + " resize-none"}
              rows={3}
              placeholder="Tell us what you have in mind — style, occasion, what you want the graphic to say, any specific imagery or branding notes…"
              value={listing.customRequest || ""}
              onChange={(e) => onChange("customRequest", e.target.value)}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Listing detail fields — shared component, no photo delivery */}
      <ListingStep data={listing} onChange={onChange} hidePhotoDelivery />

      {/* Additional notes */}
      <div>
        <label className={labelCls}>Additional Notes</label>
        <textarea
          className={inputCls + " resize-none"}
          rows={2}
          placeholder="Anything else we should know about this listing…"
          value={listing.notes || ""}
          onChange={(e) => onChange("notes", e.target.value)}
        />
      </div>
    </div>
  );
}

// ── Step 3 — Photos & Package Selection ──────────────────────────────────────

function Step3({
  photos, onPhotosChange, photoFiles, photoUrls, onPhotoAdd, onPhotoRemove, photoInputRef,
  pkg, onPkgChange, graphicType, errors,
}) {
  const packages = getPackages(graphicType);

  return (
    <div className="step-animate space-y-8">

      {/* Part A — Photos */}
      <div>
        <p className={labelCls}>
          How will you provide photos?
          {graphicType !== "custom" && <span className="text-coral ml-1 normal-case font-normal tracking-normal">*</span>}
          {errors.photoOption && (
            <span className="text-coral normal-case font-normal tracking-normal ml-2">{errors.photoOption}</span>
          )}
        </p>
        <div className="space-y-2 mt-2">
          {[
            { value: "mls",    label: "Use MLS photos — provide link below" },
            { value: "upload", label: "I will upload photos now" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-3 cursor-pointer group" onClick={() => onPhotosChange("photoOption", opt.value)}>
              <div
                className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                  photos.photoOption === opt.value
                    ? "border-coral bg-coral"
                    : "border-border bg-white group-hover:border-coral/50"
                }`}
                style={{ width: 18, height: 18 }}
              >
                {photos.photoOption === opt.value && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span
                className={`font-sans text-[0.88rem] transition-colors ${
                  photos.photoOption === opt.value ? "text-deep font-medium" : "text-slate group-hover:text-deep"
                }`}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>

        {/* MLS link field */}
        {photos.photoOption === "mls" && (
          <div className="mt-3">
            <label className={labelCls}>MLS Photo Link</label>
            <input
              className={inputCls}
              placeholder="https://www.mlsgrid.com/listing/..."
              value={photos.mlsLink}
              onChange={(e) => onPhotosChange("mlsLink", e.target.value)}
            />
          </div>
        )}

        {/* Upload field with thumbnails */}
        {photos.photoOption === "upload" && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <label className={labelCls + " mb-0"}>Upload Photos</label>
              <span className="font-sans text-[0.75rem] text-slate">
                {photoFiles.length}/5 photos uploaded
              </span>
            </div>

            {/* Thumbnails */}
            {photoUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onPhotoRemove(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-deep/80 hover:bg-deep text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M1 1l6 6M7 1L1 7"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add more button */}
            {photoFiles.length < 5 && (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl py-3.5 text-center hover:border-coral transition-colors duration-200 group"
              >
                <span className="font-sans text-[0.82rem] text-slate group-hover:text-coral transition-colors">
                  + Add photos{photoFiles.length > 0 ? " (up to 5)" : ""}
                </span>
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onPhotoAdd}
            />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Part B — Package selection */}
      <div>
        <p className={labelCls}>
          Choose a Package *
          {errors.packageId && (
            <span className="text-coral normal-case font-normal tracking-normal ml-2">{errors.packageId}</span>
          )}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {packages.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPkgChange("packageId", p.id)}
              className={`relative text-left rounded-2xl p-4 border-2 transition-all duration-200 ${
                pkg.packageId === p.id
                  ? "border-coral bg-coral/5 shadow-[0_0_0_4px_rgba(232,130,90,0.12)]"
                  : "border-border bg-white hover:border-coral/40"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-coral text-white text-[0.65rem] font-bold uppercase tracking-[0.1em] px-3 py-0.5 rounded-full whitespace-nowrap">
                  Most Popular
                </span>
              )}
              {pkg.packageId === p.id && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-coral flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              <div className="font-serif text-[1.5rem] text-coral">{p.price}</div>
              <div className="font-sans text-[0.9rem] font-semibold text-deep mb-1">{p.name}</div>
              <p className="font-sans text-[0.75rem] text-slate leading-snug mb-2">{p.description}</p>
              <ul className="space-y-1 list-none p-0 mb-2">
                {p.extras.map((item, i) => (
                  <li key={i} className="font-sans text-[0.72rem] text-slate flex items-start gap-1.5">
                    <span className="text-coral mt-px">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="font-sans text-[0.7rem] text-slate/60 italic leading-snug">{p.tagline}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Part C — Animated graphic preferences (Premium only) */}
      {pkg.packageId === "premium" && (
        <div className="step-animate space-y-6 border-t border-border pt-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <p className="font-sans text-[0.85rem] font-semibold text-deep">
              Customize Your Animated Graphic
            </p>
          </div>

          {/* Animation style */}
          <div>
            <p className={labelCls}>Text Animation Style</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {ANIMATION_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onPkgChange("animationStyle", s.id)}
                  className={`text-left rounded-xl p-3 border-2 transition-all duration-200 ${
                    pkg.animationStyle === s.id
                      ? "border-coral bg-coral/5 shadow-[0_0_0_3px_rgba(232,130,90,0.12)]"
                      : "border-border bg-white hover:border-coral/40"
                  }`}
                >
                  <span className="text-xl block mb-1">{s.emoji}</span>
                  <span className={`font-sans text-[0.8rem] font-semibold block mb-0.5 ${pkg.animationStyle === s.id ? "text-coral" : "text-deep"}`}>
                    {s.label}
                  </span>
                  <span className="font-sans text-[0.7rem] text-slate/70 leading-tight">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Music style */}
          <div>
            <p className={labelCls}>Music Style</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {MUSIC_STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onPkgChange("musicStyle", s.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 border-2 transition-all duration-200 ${
                    pkg.musicStyle === s.id
                      ? "border-coral bg-coral/5 shadow-[0_0_0_3px_rgba(232,130,90,0.12)]"
                      : "border-border bg-white hover:border-coral/40"
                  }`}
                >
                  <span className="text-base">{s.emoji}</span>
                  <span className={`font-sans text-[0.78rem] font-medium leading-tight ${pkg.musicStyle === s.id ? "text-coral" : "text-slate"}`}>
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 4 — Choose Your Design ───────────────────────────────────────────────

function Step4({ designId, onChange, errors }) {
  return (
    <div className="step-animate space-y-4">
      <p className={labelCls}>
        Choose a Design Style *
        {errors.designId && (
          <span className="text-coral normal-case font-normal tracking-normal ml-2">{errors.designId}</span>
        )}
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {DESIGN_TILES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            title={t.name}
            className={`relative rounded-xl overflow-hidden aspect-square transition-all duration-150 ${
              designId === t.id
                ? "ring-2 ring-coral ring-offset-2 ring-offset-cream scale-105"
                : "hover:scale-105 opacity-80 hover:opacity-100"
            }`}
            style={{ background: t.bg }}
          >
            {designId === t.id && (
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
  );
}

