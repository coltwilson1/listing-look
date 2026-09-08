"use client";

import { useState, useEffect, useRef } from "react";
import SuccessWithAccount from "@/app/components/SuccessWithAccount";

function generateOrderId() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TLL-${year}-${rand}`;
}

// ── Google Maps loader (singleton) ────────────────────────────────────────────
let _mapsReady = false;
let _mapsCallbacks = [];
function loadGoogleMaps(cb) {
  if (_mapsReady) { cb(); return; }
  _mapsCallbacks.push(cb);
  if (document.querySelector('script[src*="maps.googleapis.com"]')) return;
  window.__tllMapsInit = () => { _mapsReady = true; _mapsCallbacks.forEach(fn => fn()); _mapsCallbacks = []; };
  const s = document.createElement("script");
  s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=__tllMapsInit`;
  s.async = true;
  document.head.appendChild(s);
}

// ── Phone formatting helpers ──────────────────────────────────────────────────
function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
}
function phoneComplete(val) {
  return val.replace(/\D/g, "").length === 10;
}

function formatPrice(raw) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return "$" + parseInt(digits).toLocaleString();
}

const STYLES = [
  { id: "professional", label: "Professional", desc: "Polished, elegant, trust-building" },
  { id: "conversational", label: "Conversational", desc: "Warm, personable, relatable" },
  { id: "energetic", label: "Energetic", desc: "Bold, exciting, high-energy" },
];


async function compressPhoto(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1080;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result.split(",")[1]);
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.78);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

async function compressPhotoFromUrl(proxyUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const MAX = 1080;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error("Canvas export failed")); return; }
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result.split(",")[1]);
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.78);
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = proxyUrl;
  });
}

const STEPS = ["You", "Property", "Details", "Generate"];

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[0.75rem] font-bold transition-all ${
            i < step ? "bg-coral text-white" : i === step ? "bg-deep text-white" : "bg-border text-slate/50"
          }`}>
            {i < step ? "✓" : i + 1}
          </div>
          <span className={`font-sans text-[0.8rem] font-medium hidden sm:block ${i === step ? "text-deep" : "text-slate/50"}`}>{label}</span>
          {i < STEPS.length - 1 && <div className={`w-8 h-px mx-1 ${i < step ? "bg-coral" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

// ── Preview watermark ─────────────────────────────────────────────────────────

function PreviewWatermark({ small = false }) {
  const lines = small ? 8 : 14;
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 overflow-hidden" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="absolute left-[-20%] w-[160%] font-sans font-black uppercase text-black/[0.07] whitespace-nowrap"
          style={{
            fontSize: small ? "0.7rem" : "1.3rem",
            letterSpacing: "0.28em",
            top: `${i * (small ? 13 : 8) - 3}%`,
            transform: "rotate(-32deg)",
          }}
        >
          PREVIEW ONLY &nbsp;&nbsp;&nbsp; PREVIEW ONLY &nbsp;&nbsp;&nbsp; PREVIEW ONLY &nbsp;&nbsp;&nbsp; PREVIEW ONLY
        </div>
      ))}
    </div>
  );
}

// ── Social graphic card preview ───────────────────────────────────────────────

function GraphicCard({ type, graphicText, listing, agent, color }) {
  const labels = { forSale: "For Sale", justListed: "Just Listed", underContract: "Under Contract", priceRefresh: "Price Refresh", sold: "Sold" };
  const colors = { forSale: "#22c55e", justListed: "#E8825A", underContract: "#3b82f6", priceRefresh: "#f59e0b", sold: "#10b981" };
  const bg = colors[type] || color;

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-sm" style={{ aspectRatio: "1/1", background: bg }}>
      <div className="flex flex-col justify-between h-full p-5 text-white">
        <div>
          <div className="font-sans text-[0.65rem] font-bold uppercase tracking-[0.2em] opacity-75 mb-1">{agent.brokerage}</div>
          <div className="font-serif text-[1.6rem] leading-tight font-bold">{graphicText?.headline || labels[type]}</div>
        </div>
        <div>
          {graphicText?.price && (
            <div className="font-serif text-[1.2rem] font-bold mb-1">{graphicText.price}</div>
          )}
          <div className="font-sans text-[0.7rem] leading-snug opacity-85">{listing.address}</div>
          <div className="font-sans text-[0.65rem] opacity-65 mt-0.5">{listing.beds} bd · {listing.baths} ba · {parseInt(listing.sqft || 0).toLocaleString()} sqft</div>
          <div className="mt-3 border-t border-white/30 pt-2 font-sans text-[0.62rem] font-semibold italic opacity-80">
            {graphicText?.tagline}
          </div>
          <div className="font-sans text-[0.6rem] opacity-60 mt-1">{agent.name} · {agent.brokerage}</div>
        </div>
      </div>
    </div>
  );
}

// ── Caption card ──────────────────────────────────────────────────────────────

function CaptionCard({ label, caption, color, onUpdate, onRegenerate, regenerating }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(caption);
  const [copied, setCopied] = useState(false);

  // Keep draft in sync when caption changes externally (e.g. after regenerate)
  const prevCaption = useRef(caption);
  if (prevCaption.current !== caption) {
    prevCaption.current = caption;
    setDraft(caption);
  }

  function copy() {
    navigator.clipboard.writeText(draft).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  function save() { onUpdate(draft); setEditing(false); }
  function cancel() { setDraft(caption); setEditing(false); }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border">
        <span className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em]" style={{ color }}>{label}</span>
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <button onClick={save} className="font-sans text-[0.75rem] font-semibold text-white bg-coral px-3 py-1 rounded-full border-none cursor-pointer hover:bg-coral-dark transition-colors">Save</button>
              <button onClick={cancel} className="font-sans text-[0.75rem] text-slate hover:text-coral transition-colors border border-border rounded-full px-3 py-1 bg-transparent cursor-pointer">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={copy} className="font-sans text-[0.75rem] text-slate hover:text-coral transition-colors border-none bg-transparent cursor-pointer px-2 py-1">
                {copied ? "✓ Copied" : "Copy"}
              </button>
              <button onClick={() => { setDraft(caption); setEditing(true); }} className="font-sans text-[0.75rem] text-slate hover:text-coral transition-colors border border-border rounded-full px-3 py-1 bg-transparent cursor-pointer">
                ✏️ Edit
              </button>
              <button
                onClick={onRegenerate}
                disabled={regenerating}
                className="font-sans text-[0.75rem] text-slate hover:text-coral transition-colors border border-border rounded-full px-3 py-1 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {regenerating ? <><span className="w-3 h-3 rounded-full border border-slate border-t-transparent animate-spin inline-block" /> Generating…</> : "↻ Regenerate"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Body */}
      {editing ? (
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={8}
          className="w-full px-5 py-4 font-sans text-[0.85rem] text-slate leading-[1.7] border-none outline-none resize-y bg-light-gray/50"
          autoFocus
        />
      ) : (
        <p className="font-sans text-[0.85rem] text-slate leading-[1.7] whitespace-pre-line px-5 py-4">{draft || caption}</p>
      )}
    </div>
  );
}

// ── Landing page preview ──────────────────────────────────────────────────────

function hexToRgba(hex, alpha) {
  const c = (hex || "#1C1C2E").replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function contrastText(hex) {
  const c = (hex || "#ffffff").replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? "#000000" : "#ffffff";
}

function LandingPreview({ lp, listing, agent, primaryPhoto, additionalPhotos, team }) {
  const [lightbox, setLightbox] = useState(null);
  const mainPhoto = primaryPhoto?.base64;
  const allPhotos = [primaryPhoto, ...additionalPhotos].filter(Boolean);
  const primary   = agent.primaryColor || "#C8102E";
  const accent    = agent.accentColor  || "#ffffff";
  const labelClr  = agent.labelColor   || primary;
  const bodyClr   = agent.bodyColor    || "#475569";

  const sectionLabel = "font-sans text-[0.7rem] font-bold uppercase tracking-[0.12em] mb-2";

  return (
    <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-lg">
      {/* Hero */}
      <div
        className="relative px-8 py-14 text-center"
        style={mainPhoto
          ? { backgroundImage: `url(data:image/jpeg;base64,${mainPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: primary }
        }
      >
        {mainPhoto && (
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${hexToRgba(primary, 0.35)}, ${hexToRgba(primary, 0.72)})` }} />
        )}
        <div className="relative z-10">
          <div className={`${sectionLabel} mb-3`} style={{ color: accent }}>Now Available</div>
          <h1 className="font-serif text-[clamp(1.5rem,3vw,2.4rem)] text-white leading-tight mb-3">{lp.headline}</h1>
          <p className="font-sans text-[0.95rem] text-white/75 mb-5">{lp.subheadline}</p>
          <div className="inline-flex gap-5 flex-wrap justify-center font-sans text-[0.85rem] text-white/85 bg-black/20 px-5 py-2.5 rounded-full backdrop-blur-sm">
            <span>🛏 {listing.beds} Beds</span>
            <span>🛁 {listing.baths} Baths</span>
            <span>📐 {parseInt(listing.sqft || 0).toLocaleString()} sqft</span>
            <span>💰 ${parseInt(listing.price || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={`data:image/jpeg;base64,${allPhotos[lightbox]?.base64}`} alt="" className="max-w-full max-h-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white text-[1.5rem] bg-black/40 w-10 h-10 rounded-full border-none cursor-pointer flex items-center justify-center">×</button>
        </div>
      )}

      <div className="px-8 py-8 space-y-7">
        {/* Description */}
        <div>
          <h3 className={sectionLabel} style={{ color: labelClr }}>About This Home</h3>
          <p className="font-sans text-[0.9rem] leading-[1.75]" style={{ color: bodyClr }}>{lp.description}</p>
        </div>

        {/* Photo gallery — below description, scrollable row */}
        {allPhotos.length > 0 && (
          <div>
            <h3 className={sectionLabel} style={{ color: labelClr }}>Photos</h3>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
              {allPhotos.map((p, i) => (
                <img
                  key={i}
                  src={`data:image/jpeg;base64,${p.base64}`}
                  alt=""
                  onClick={() => setLightbox(i)}
                  className="flex-shrink-0 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity border border-border"
                  style={{ width: 220, height: 160 }}
                />
              ))}
            </div>
            <p className="font-sans text-[0.72rem] text-slate/50 mt-2">Tap any photo to enlarge</p>
          </div>
        )}

        {/* Highlights */}
        <div>
          <h3 className={`${sectionLabel} mb-3`} style={{ color: labelClr }}>Property Highlights</h3>
          <div className="grid grid-cols-2 gap-2">
            {(lp.highlights || []).map((h, i) => (
              <div key={i} className="flex items-start gap-2 font-sans text-[0.85rem]" style={{ color: bodyClr }}>
                <span className="font-bold mt-0.5" style={{ color: labelClr }}>✓</span> {h}
              </div>
            ))}
          </div>
        </div>

        {/* Neighborhood */}
        <div>
          <h3 className={sectionLabel} style={{ color: labelClr }}>The Neighborhood</h3>
          <p className="font-sans text-[0.9rem] leading-[1.75]" style={{ color: bodyClr }}>{lp.neighborhood}</p>
        </div>

        {/* Schools */}
        <div>
          <h3 className={sectionLabel} style={{ color: labelClr }}>Schools</h3>
          <p className="font-sans text-[0.9rem] leading-[1.75]" style={{ color: bodyClr }}>{lp.schools}</p>
        </div>

        {/* Market */}
        <div>
          <h3 className={sectionLabel} style={{ color: labelClr }}>Local Market</h3>
          <p className="font-sans text-[0.9rem] leading-[1.75]" style={{ color: bodyClr }}>{lp.marketContext}</p>
        </div>

        {/* Agent CTA / Footer */}
        <div className="rounded-2xl p-8 text-center" style={{ background: primary }}>
          {/* Logo row — KW + team logo side by side */}
          <div className="flex items-center justify-center gap-6 mb-5 flex-wrap">
            <img
              src="/logos/KW%20Logos/Black_White/KellerWilliams_Realty_GreaterChattanooga_Logo_rev-W.png"
              alt="Keller Williams Realty Greater Chattanooga"
              className="w-auto object-contain"
              style={{ height: 64 }}
            />
            {team?.logo && (
              <img
                src={team.logo}
                alt={team.name || "Team logo"}
                className="w-auto object-contain"
                style={{ height: 64 }}
              />
            )}
          </div>
          <p className="font-serif text-[1.3rem] mb-0.5" style={{ color: agent.footerTextColor || "#ffffff" }}>{agent.name}</p>
          {team?.name && (
            <p className="font-sans text-[0.82rem] font-semibold mb-1" style={{ color: agent.footerTextColor || "#ffffff", opacity: 0.85 }}>{team.name}</p>
          )}
          <p className="font-sans text-[0.88rem] mb-1" style={{ color: agent.footerTextColor || "#ffffff", opacity: 0.75 }}>{agent.officePhone} &nbsp;·&nbsp; Office</p>
          <p className="font-sans text-[0.88rem] mb-5" style={{ color: agent.footerTextColor || "#ffffff", opacity: 0.75 }}>{agent.mobilePhone} &nbsp;·&nbsp; Mobile</p>
          <a
            href={`tel:${agent.mobilePhone.replace(/\D/g, "")}`}
            className="inline-block font-sans font-semibold text-[0.88rem] px-6 py-2.5 rounded-full mb-6 no-underline"
            style={{ background: accent, color: contrastText(accent) }}
          >
            {lp.callToAction}
          </a>
          <p className="font-sans text-[0.72rem]" style={{ color: agent.footerTextColor || "#ffffff", opacity: 0.45 }}>Each office is independently owned and operated.</p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ListingLaunchPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [captions, setCaptions] = useState({});
  const [captionRegenerating, setCaptionRegenerating] = useState({});
  const [activeTab, setActiveTab] = useState("landing");
  const [svgGraphics, setSvgGraphics] = useState({});
  const [graphicLoadings, setGraphicLoadings] = useState({});
  const [graphicErrors, setGraphicErrors] = useState({});

  const [kwError, setKwError] = useState("");
  const [phoneErrors, setPhoneErrors] = useState({ officePhone: false, mobilePhone: false });
  const [agent, setAgent] = useState({ name: "", brokerage: "Keller Williams Realty - Greater Chattanooga", license: "", gaLicense: "", officePhone: "", mobilePhone: "", style: "professional", primaryColor: "#C8102E", accentColor: "#ffffff", labelColor: "", bodyColor: "#475569", footerTextColor: "#ffffff" });
  const [themeOpen, setThemeOpen] = useState(false);
  const [listing, setListing] = useState({ address: "", city: "", state: "", zip: "", price: "", beds: "", baths: "", sqft: "", yearBuilt: "", features: "", notes: "" });
  const [primaryPhoto, setPrimaryPhoto] = useState(null);     // { name, base64 } — graphic background
  const [additionalPhotos, setAdditionalPhotos] = useState([]); // [{ name, base64 }] up to 10 — website gallery
  const primaryPhotoRef = useRef(null);
  const additionalPhotosRef = useRef(null);
  const teamLogoRef = useRef(null);
  const [team, setTeam] = useState({ name: "", logo: null }); // logo = full data URI
  const [showTeam, setShowTeam] = useState(false);

  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState({ type: "", text: "" });
  const [pickerPhotos, setPickerPhotos] = useState([]);       // URLs found from import
  const [savedPhotoUrls, setSavedPhotoUrls] = useState([]);  // original URLs kept for portal
  const [pickerSelected, setPickerSelected] = useState(new Set());
  const [pickerImporting, setPickerImporting] = useState(false);

  const [purchaseOpen, setPurchaseOpen]       = useState(false);
  const [purchaseName, setPurchaseName]       = useState("");
  const [purchaseEmail, setPurchaseEmail]     = useState("");
  const [purchaseStep, setPurchaseStep]       = useState("form"); // "form" | "account"
  const [purchaseOrder, setPurchaseOrder]     = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseError, setPurchaseError]     = useState("");

  function openPurchase() {
    setPurchaseName(result?.agent?.name || agent.name || "");
    setPurchaseEmail("");
    setPurchaseStep("form");
    setPurchaseOrder(null);
    setPurchaseError("");
    setPurchaseOpen(true);
  }

  async function handlePurchaseSubmit(e) {
    e.preventDefault();
    if (!purchaseName.trim() || !purchaseEmail.trim()) {
      setPurchaseError("Please fill in all fields.");
      return;
    }
    setPurchaseLoading(true);
    setPurchaseError("");
    try {
      const order = {
        id: generateOrderId(),
        type: "listing-launch",
        typeLabel: "Listing Launch",
        address: result?.listing?.address || listing.address,
        listingPrice: result?.listing?.price || listing.price,
        submittedAt: new Date().toISOString(),
        status: "submitted",
        notes: [],
        paid: false,
        venmoRef: "",
        deliveredFiles: [],
        deliveryMessage: "",
        adminNotes: "",
        formData: {
          agent: result?.agent || agent,
          listing: result?.listing || listing,
          captions: result?.generated?.captions,
          graphicText: result?.generated?.graphicText,
          landingPage: result?.generated?.landingPage,
          photoUrls: savedPhotoUrls,
          addressSlug: (result?.listing?.address || listing.address || "")
            .trim().toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "-"),
        },
      };
      let res;
      try {
        res = await fetch("/api/orders/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order, clientName: purchaseName.trim(), clientEmail: purchaseEmail.trim() }),
        });
      } catch (networkErr) {
        throw new Error("Network error — check your connection and try again.");
      }
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server error (${res.status}) — please try again.`);
      }
      if (!data.ok) throw new Error(data.error || `Error ${res.status}`);
      setPurchaseOrder(order);
      setPurchaseStep("account");
    } catch (err) {
      setPurchaseError(err.message);
    } finally {
      setPurchaseLoading(false);
    }
  }

  const addressRef = useRef(null);
  const acRef = useRef(null);

  useEffect(() => {
    if (step !== 1) return;
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return;
    loadGoogleMaps(() => {
      if (!addressRef.current || acRef.current) return;
      acRef.current = new window.google.maps.places.Autocomplete(addressRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["address_components", "formatted_address"],
      });
      acRef.current.addListener("place_changed", () => {
        const place = acRef.current.getPlace();
        if (!place?.address_components) return;
        const get = (type) => place.address_components.find(c => c.types.includes(type))?.long_name || "";
        const getShort = (type) => place.address_components.find(c => c.types.includes(type))?.short_name || "";
        const streetNum = get("street_number");
        const streetName = get("route");
        setListing(l => ({
          ...l,
          address: `${streetNum} ${streetName}`.trim() || place.formatted_address,
          city: get("locality") || get("sublocality"),
          state: getShort("administrative_area_level_1"),
          zip: get("postal_code"),
        }));
      });
    });
    return () => {
      if (acRef.current) window.google?.maps?.event?.clearInstanceListeners(acRef.current);
      acRef.current = null;
    };
  }, [step]);

  const iCls = "w-full bg-white border border-border rounded-xl px-4 py-3 text-deep text-[0.9rem] placeholder:text-slate/40 focus:outline-none focus:border-coral transition-colors font-sans";
  const lCls = "block font-sans text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1.5";

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/listing-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, listing }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
      setCaptions(data.generated?.captions || {});
      setStep(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    const url = importUrl.trim();
    if (!url) return;
    setImporting(true);
    setImportMsg({ type: "", text: "" });
    setPickerPhotos([]);
    setPickerSelected(new Set());
    try {
      const res = await fetch("/api/listing-launch/import-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Import failed");

      const d = data.listing || {};
      setListing(l => ({
        ...l,
        address:   d.address   || l.address,
        city:      d.city      || l.city,
        state:     d.state     || l.state,
        zip:       d.zip       || l.zip,
        price:     d.price     || l.price,
        beds:      d.beds      || l.beds,
        baths:     d.baths     || l.baths,
        sqft:      d.sqft      || l.sqft,
        yearBuilt: d.yearBuilt || l.yearBuilt,
        features:  d.features  || l.features,
        notes:     d.notes     || l.notes,
      }));

      const photos = data.photos || [];
      if (photos.length > 0) {
        setPickerPhotos(photos);
        setPickerSelected(new Set()); // default unchecked — user selects up to 10
        setImportMsg({ type: "ok", text: `Found ${photos.length} photo${photos.length !== 1 ? "s" : ""} — select up to 10 below.` });
      } else {
        setImportMsg({ type: "ok", text: "Details filled in. No photos found on this page — upload them below." });
      }
    } catch (err) {
      setImportMsg({ type: "err", text: err.message });
    } finally {
      setImporting(false);
    }
  }

  function togglePicker(i) {
    setPickerSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else if (next.size < 10) {
        next.add(i);
      }
      return next;
    });
  }

  async function importSelectedPhotos() {
    if (pickerSelected.size === 0) return;
    setPickerImporting(true);
    const selected = pickerPhotos.filter((_, i) => pickerSelected.has(i));
    const results = await Promise.allSettled(
      selected.map(url =>
        compressPhotoFromUrl(`/api/listing-launch/proxy-photo?url=${encodeURIComponent(url)}`)
      )
    );
    const valid = results
      .map((r, i) => r.status === "fulfilled" ? { name: `photo-${i + 1}.jpg`, base64: r.value } : null)
      .filter(Boolean);
    if (valid.length === 0) {
      setImportMsg({ type: "err", text: "Couldn't load those photos — try uploading them manually below." });
    } else {
      setSavedPhotoUrls(selected); // save original URLs before clearing
      setPrimaryPhoto(valid[0]);
      setAdditionalPhotos(valid.slice(1));
      setPickerPhotos([]);
      setPickerSelected(new Set());
      setImportMsg({ type: "ok", text: `Imported ${valid.length} photo${valid.length !== 1 ? "s" : ""}` });
    }
    setPickerImporting(false);
  }

  async function generateGraphic(l, a, stage) {
    setGraphicLoadings(prev => ({ ...prev, [stage]: true }));
    setGraphicErrors(prev => ({ ...prev, [stage]: "" }));
    setSvgGraphics(prev => ({ ...prev, [stage]: null }));
    try {
      const res = await fetch("/api/listing-launch/graphic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: a, listing: l, stage, primaryPhoto: primaryPhoto?.base64 || null, secondaryPhotos: [...additionalPhotos].sort(() => Math.random() - 0.5).slice(0, 2).map(p => p.base64), team }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Graphic generation failed");
      setSvgGraphics(prev => ({ ...prev, [stage]: data.svg }));
    } catch (e) {
      setGraphicErrors(prev => ({ ...prev, [stage]: e.message }));
    } finally {
      setGraphicLoadings(prev => ({ ...prev, [stage]: false }));
    }
  }

  function downloadSVG(svg, filename = "just-listed.svg") {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPNG(svg, filename = "just-listed.png") {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 1080, 1350);
      canvas.toBlob((pngBlob) => {
        const pngUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  // ── Results view ─────────────────────────────────────────────────────────────
  if (step === 4 && result) {
    const { generated, listing: l, agent: a } = result;
    const iCls2 = "w-full bg-white border border-border rounded-xl px-4 py-3 text-deep text-[0.9rem] placeholder:text-slate/40 focus:outline-none focus:border-coral transition-colors font-sans";
    const GRAPHIC_TYPES = [
      { key: "forSale",       label: "For Sale",       color: "#22c55e" },
      { key: "justListed",    label: "Just Listed",    color: "#E8825A" },
      { key: "underContract", label: "Under Contract", color: "#3b82f6" },
      { key: "priceRefresh",  label: "Price Refresh",  color: "#f59e0b" },
      { key: "sold",          label: "Sold",           color: "#10b981" },
    ];

    return (
      <>
      {/* ── Purchase modal ── */}
      {purchaseOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={e => { if (e.target === e.currentTarget) setPurchaseOpen(false); }}
        >
          <div className="bg-white rounded-3xl w-full max-w-[480px] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 pt-7 pb-4 border-b border-border">
              <h2 className="font-serif text-[1.4rem] text-deep">Complete Your Order</h2>
              <button onClick={() => setPurchaseOpen(false)} className="w-8 h-8 rounded-full bg-light-gray flex items-center justify-center font-sans text-[1rem] text-slate hover:text-coral border-none cursor-pointer bg-transparent">×</button>
            </div>

            <div className="px-8 py-6">
              {purchaseStep === "form" ? (
                <>
                  {/* What's included */}
                  <div className="bg-light-gray rounded-2xl p-5 mb-6">
                    <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em] text-coral mb-3">What's Included</p>
                    {[
                      "Live shareable landing page with your listing details",
                      "5 social media graphics (For Sale, Just Listed, Under Contract, Price Refresh, Sold)",
                      "5 ready-to-post captions — in your posting style",
                      "Access to your order in the client portal",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                        <span className="text-coral font-bold mt-0.5 text-[0.8rem]">✓</span>
                        <span className="font-sans text-[0.85rem] text-slate leading-snug">{item}</span>
                      </div>
                    ))}
                    <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
                      <span className="font-sans text-[0.85rem] font-semibold text-deep">Listing Launch Package</span>
                      <span className="font-serif text-[1.3rem] text-coral font-bold">$99</span>
                    </div>
                  </div>

                  {/* Contact form */}
                  <form onSubmit={handlePurchaseSubmit} className="space-y-4">
                    <div>
                      <label className="block font-sans text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1.5">Your Name</label>
                      <input className={iCls2} placeholder="Jane Smith" value={purchaseName} onChange={e => setPurchaseName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block font-sans text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1.5">Email Address</label>
                      <input className={iCls2} type="email" placeholder="your@email.com" value={purchaseEmail} onChange={e => setPurchaseEmail(e.target.value)} />
                    </div>
                    {purchaseError && <p className="font-sans text-[0.82rem] text-coral">{purchaseError}</p>}
                    <button
                      type="submit"
                      disabled={purchaseLoading}
                      className="w-full bg-coral text-white font-sans font-semibold py-3.5 rounded-full border-none cursor-pointer hover:bg-coral-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {purchaseLoading
                        ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block"/>Submitting…</span>
                        : "Continue →"}
                    </button>
                    <p className="font-sans text-[0.72rem] text-slate/50 text-center">Payment via Venmo @Colt-Wilson after checkout</p>
                  </form>
                </>
              ) : purchaseOrder ? (
                <SuccessWithAccount
                  contactName={purchaseName}
                  email={purchaseEmail}
                  order={purchaseOrder}
                  onReset={() => { setPurchaseOpen(false); setStep(0); setResult(null); setCaptions({}); }}
                  onClose={() => setPurchaseOpen(false)}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-cream">
        <div className="max-w-[1100px] mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] text-coral mb-1">Listing Launch</div>
              <h1 className="font-serif text-[2rem] text-deep">{l.address}</h1>
              <p className="font-sans text-[0.88rem] text-slate mt-1">${parseInt(l.price).toLocaleString()} · {l.beds} bd · {l.baths} ba · {parseInt(l.sqft || 0).toLocaleString()} sqft</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => { setStep(0); setResult(null); setCaptions({}); }} className="font-sans text-[0.85rem] text-slate hover:text-coral transition-colors border border-border rounded-full px-4 py-2 bg-transparent cursor-pointer">
                ← New Listing
              </button>
              <button
                onClick={openPurchase}
                className="font-sans text-[0.88rem] font-semibold bg-coral text-white px-5 py-2 rounded-full border-none cursor-pointer hover:bg-coral-dark transition-colors shadow-sm"
              >
                Complete Purchase →
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white border border-border rounded-2xl p-1.5 mb-8 flex-wrap">
            {[
              { id: "landing", label: "🏠 Landing Page" },
              { id: "graphics", label: "📱 Social Graphics" },
              { id: "captions", label: "✍️ Captions" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 font-sans text-[0.88rem] font-semibold py-2.5 px-4 rounded-xl border-none cursor-pointer transition-all ${
                  activeTab === t.id ? "bg-deep text-white" : "text-slate bg-transparent hover:bg-light-gray"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "landing" && (
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <p className="font-sans text-[0.85rem] text-slate">AI-powered landing page for <strong>{l.address}</strong>. Send to The Listing Look team to publish as a live shareable link.</p>
                <button
                  onClick={() => setThemeOpen(o => !o)}
                  className="flex items-center gap-2 font-sans text-[0.85rem] font-semibold px-4 py-2 rounded-full border border-border bg-white hover:border-coral hover:text-coral transition-colors cursor-pointer text-slate"
                >
                  🎨 {themeOpen ? "Close Theme" : "Edit Theme"}
                </button>
              </div>

              {themeOpen && (
                <div className="bg-white border border-border rounded-2xl p-5 mb-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-sans text-[0.95rem] font-semibold text-deep">Customize Theme</h3>
                    <button
                      onClick={() => setAgent(a => ({ ...a, primaryColor: "#C8102E", accentColor: "#ffffff", labelColor: "", bodyColor: "#475569", footerTextColor: "#ffffff" }))}
                      className="font-sans text-[0.78rem] text-slate hover:text-coral transition-colors cursor-pointer border-none bg-transparent"
                    >
                      Reset to defaults
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-5">
                    {[
                      { label: "Background / Brand", key: "primaryColor", hint: "Hero, footer, section labels" },
                      { label: "Accent / Button",    key: "accentColor",  hint: "CTA button, badge" },
                      { label: "Section Headings",   key: "labelColor",   hint: "Small uppercase labels", fallback: agent.primaryColor },
                      { label: "Body Text",          key: "bodyColor",    hint: "Paragraph text" },
                    ].map(({ label, key, hint, fallback }) => (
                      <div key={key}>
                        <p className="font-sans text-[0.75rem] font-semibold text-deep mb-0.5">{label}</p>
                        <p className="font-sans text-[0.7rem] text-slate/60 mb-2 leading-snug">{hint}</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={agent[key] || fallback || "#475569"}
                            onChange={e => setAgent(a => ({ ...a, [key]: e.target.value }))}
                            className="w-12 h-10 rounded-xl border border-border cursor-pointer p-0.5 bg-white"
                          />
                          <span className="font-sans text-[0.75rem] text-slate uppercase tracking-wide">{agent[key] || fallback || "#475569"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="font-sans text-[0.75rem] font-semibold text-deep mb-0.5">Footer Text</p>
                    <p className="font-sans text-[0.7rem] text-slate/60 mb-2 leading-snug">Name &amp; phone text on the colored footer</p>
                    <div className="flex gap-2">
                      {[{ label: "White", value: "#ffffff" }, { label: "Black", value: "#000000" }].map(({ label, value }) => (
                        <button
                          key={value}
                          onClick={() => setAgent(a => ({ ...a, footerTextColor: value }))}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-sans text-[0.8rem] font-semibold cursor-pointer transition-all ${
                            (agent.footerTextColor || "#ffffff") === value
                              ? "border-coral text-coral bg-coral/5"
                              : "border-border text-slate bg-white hover:border-slate/40"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full border border-black/20 flex-shrink-0" style={{ background: value }} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="relative overflow-hidden rounded-3xl">
                <LandingPreview lp={generated.landingPage} listing={l} agent={agent} primaryPhoto={primaryPhoto} additionalPhotos={additionalPhotos} team={team} />
                <PreviewWatermark />
              </div>
            </div>
          )}

          {activeTab === "graphics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="font-sans text-[0.85rem] text-slate">Generate a custom 1080×1080 graphic for each stage — download as PNG or SVG and post directly.</p>
                <button
                  onClick={() => setThemeOpen(o => !o)}
                  className="flex items-center gap-2 font-sans text-[0.85rem] font-semibold px-4 py-2 rounded-full border border-border bg-white hover:border-coral hover:text-coral transition-colors cursor-pointer text-slate"
                >
                  🎨 {themeOpen ? "Close Theme" : "Edit Theme"}
                </button>
              </div>

              {themeOpen && (
                <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-sans text-[0.95rem] font-semibold text-deep">Customize Theme</h3>
                    <button
                      onClick={() => setAgent(a => ({ ...a, primaryColor: "#C8102E", accentColor: "#ffffff" }))}
                      className="font-sans text-[0.78rem] text-slate hover:text-coral transition-colors cursor-pointer border-none bg-transparent"
                    >
                      Reset to defaults
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    {[
                      { label: "Background / Brand", key: "primaryColor", hint: "Main color behind the graphic" },
                      { label: "Accent / Highlight",  key: "accentColor",  hint: "Price text, accent lines" },
                    ].map(({ label, key, hint }) => (
                      <div key={key}>
                        <p className="font-sans text-[0.75rem] font-semibold text-deep mb-0.5">{label}</p>
                        <p className="font-sans text-[0.7rem] text-slate/60 mb-2 leading-snug">{hint}</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={agent[key] || "#C8102E"}
                            onChange={e => setAgent(a => ({ ...a, [key]: e.target.value }))}
                            className="w-12 h-10 rounded-xl border border-border cursor-pointer p-0.5 bg-white"
                          />
                          <span className="font-sans text-[0.75rem] text-slate uppercase tracking-wide">{agent[key] || "#C8102E"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="font-sans text-[0.75rem] text-slate/50 mt-4">Color changes apply the next time you hit Design or Regenerate.</p>
                </div>
              )}
              {GRAPHIC_TYPES.map(({ key, label, color }) => {
                const svg = svgGraphics[key];
                const loading = graphicLoadings[key];
                const err = graphicErrors[key];
                const slug = `${key}-${l.address.replace(/\s+/g, "-").toLowerCase()}`;
                return (
                  <div key={key} className="bg-light-gray rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                      <div>
                        <div className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ background: color }} />
                        <span className="font-sans text-[0.95rem] font-semibold text-deep">{label} Graphic</span>
                        <p className="font-sans text-[0.8rem] text-slate mt-0.5">AI-powered custom graphic — 1080×1350 (4:5), ready to post.</p>
                      </div>
                      {!svg && (
                        <button
                          onClick={() => generateGraphic(l, agent, key)}
                          disabled={loading}
                          className="flex-shrink-0 flex items-center gap-2 bg-deep text-white font-sans text-[0.85rem] font-semibold px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-coral transition-colors disabled:opacity-60"
                        >
                          {loading ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" /> Designing…</> : "✨ Design Graphic"}
                        </button>
                      )}
                    </div>
                    {err && <p className="font-sans text-[0.82rem] text-coral mb-3">{err}</p>}
                    {loading && !svg && (
                      <div className="bg-white rounded-2xl border border-border flex items-center justify-center" style={{ aspectRatio: "1/1", maxWidth: 380 }}>
                        <div className="text-center">
                          <div className="w-10 h-10 rounded-full border-2 border-coral border-t-transparent animate-spin mx-auto mb-3" />
                          <p className="font-sans text-[0.85rem] text-slate">Designing your {label} graphic…</p>
                        </div>
                      </div>
                    )}
                    {svg && (
                      <div>
                        <div className="relative rounded-2xl overflow-hidden border border-border mb-4" style={{ maxWidth: 400 }}>
                          <div dangerouslySetInnerHTML={{ __html: svg.replace("<svg", '<svg width="100%" height="100%"') }} />
                          <PreviewWatermark small />
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          <button onClick={() => { setSvgGraphics(p => ({ ...p, [key]: null })); generateGraphic(l, agent, key); }} className="flex items-center gap-2 border border-border text-slate font-sans text-[0.85rem] px-5 py-2.5 rounded-full bg-transparent cursor-pointer hover:border-coral hover:text-coral transition-colors">↻ Regenerate</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "captions" && (
            <div className="space-y-4">
              <p className="font-sans text-[0.85rem] text-slate mb-2">Ready-to-post captions for every stage — edit inline or regenerate any individual caption.</p>
              {GRAPHIC_TYPES.map(({ key, label, color }) => (
                <CaptionCard
                  key={key}
                  label={label}
                  caption={captions[key] || ""}
                  color={color}
                  onUpdate={text => setCaptions(prev => ({ ...prev, [key]: text }))}
                  regenerating={!!captionRegenerating[key]}
                  onRegenerate={async () => {
                    setCaptionRegenerating(prev => ({ ...prev, [key]: true }));
                    try {
                      const res = await fetch("/api/listing-launch/caption", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ agent, listing: l, stage: key }),
                      });
                      const data = await res.json();
                      if (data.ok) setCaptions(prev => ({ ...prev, [key]: data.caption }));
                    } catch {} finally {
                      setCaptionRegenerating(prev => ({ ...prev, [key]: false }));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      </>
    );
  }

  // ── Form wizard ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[580px]">

        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="font-serif text-[1.2rem] text-deep no-underline">The Listing <span className="text-coral">Look</span></a>
          <h1 className="font-serif text-[2rem] text-deep mt-4 mb-1">Listing Launch</h1>
          <p className="font-sans text-[0.9rem] text-slate">Get a landing page, social graphics, and ready-to-post captions — powered by AI in seconds.</p>
        </div>

        <div className="bg-white rounded-3xl border border-border p-4 sm:p-8 shadow-sm">
          <ProgressBar step={step} />

          {/* Step 0: Agent info */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-[1.5rem] text-deep mb-1">Tell us about you</h2>
                <p className="font-sans text-[0.87rem] text-slate mb-1">This personalizes everything we generate for your brand.</p>
                <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-full px-3 py-1 mb-5">
                  <span className="text-[0.7rem]">🔒</span>
                  <span className="font-sans text-[0.72rem] font-semibold text-red-600">Keller Williams agents only</span>
                </div>
              </div>
              <div>
                <label className={lCls}>Your Full Name</label>
                <input className={iCls} placeholder="Jane Smith" value={agent.name} onChange={e => setAgent(a => ({ ...a, name: e.target.value }))} />
              </div>
              <div>
                <label className={lCls}>Brokerage</label>
                <select className={iCls} value={agent.brokerage} onChange={e => setAgent(a => ({ ...a, brokerage: e.target.value }))}>
                  <option value="Keller Williams Realty - Greater Chattanooga">Keller Williams Realty - Greater Chattanooga</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>TN License # <span className="font-normal text-slate/50 normal-case tracking-normal">(optional)</span></label>
                  <input className={iCls} placeholder="e.g. 123456" maxLength={7} value={agent.license} onChange={e => setAgent(a => ({ ...a, license: e.target.value }))} />
                </div>
                <div>
                  <label className={lCls}>GA License # <span className="font-normal text-slate/50 normal-case tracking-normal">(optional)</span></label>
                  <input className={iCls} placeholder="e.g. 123456" maxLength={7} value={agent.gaLicense} onChange={e => setAgent(a => ({ ...a, gaLicense: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>
                    Office Phone <span className="text-coral">*</span>
                    {phoneErrors.officePhone && <span className="text-coral normal-case font-normal tracking-normal ml-1">— incomplete number</span>}
                  </label>
                  <input
                    className={`${iCls} ${phoneErrors.officePhone ? "border-coral ring-2 ring-coral/20" : ""}`}
                    placeholder="(423) 000-0000"
                    value={agent.officePhone}
                    onChange={e => { setAgent(a => ({ ...a, officePhone: formatPhone(e.target.value) })); setPhoneErrors(p => ({ ...p, officePhone: false })); }}
                    onBlur={() => { if (agent.officePhone && !phoneComplete(agent.officePhone)) setPhoneErrors(p => ({ ...p, officePhone: true })); }}
                    inputMode="tel"
                  />
                </div>
                <div>
                  <label className={lCls}>
                    Mobile Phone <span className="text-coral">*</span>
                    {phoneErrors.mobilePhone && <span className="text-coral normal-case font-normal tracking-normal ml-1">— incomplete number</span>}
                  </label>
                  <input
                    className={`${iCls} ${phoneErrors.mobilePhone ? "border-coral ring-2 ring-coral/20" : ""}`}
                    placeholder="(423) 000-0000"
                    value={agent.mobilePhone}
                    onChange={e => { setAgent(a => ({ ...a, mobilePhone: formatPhone(e.target.value) })); setPhoneErrors(p => ({ ...p, mobilePhone: false })); }}
                    onBlur={() => { if (agent.mobilePhone && !phoneComplete(agent.mobilePhone)) setPhoneErrors(p => ({ ...p, mobilePhone: true })); }}
                    inputMode="tel"
                  />
                </div>
              </div>
              <div>
                <label className={lCls}>Posting Style</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setAgent(a => ({ ...a, style: s.id }))}
                      className={`rounded-xl p-3 text-left border-2 transition-all cursor-pointer bg-transparent ${agent.style === s.id ? "border-coral bg-coral/5" : "border-border hover:border-slate/30"}`}
                    >
                      <div className={`font-sans text-[0.85rem] font-semibold mb-0.5 ${agent.style === s.id ? "text-coral" : "text-deep"}`}>{s.label}</div>
                      <div className="font-sans text-[0.72rem] text-slate leading-snug">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={lCls}>Graphic Colors</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="font-sans text-[0.75rem] text-slate mb-2">Background / Overlay</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={agent.primaryColor}
                        onChange={e => setAgent(a => ({ ...a, primaryColor: e.target.value }))}
                        className="w-14 h-11 rounded-xl border border-border cursor-pointer p-0.5 bg-white"
                      />
                      <span className="font-sans text-[0.8rem] text-slate uppercase tracking-wide">{agent.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-sans text-[0.75rem] text-slate mb-2">Accent / Highlight</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={agent.accentColor}
                        onChange={e => setAgent(a => ({ ...a, accentColor: e.target.value }))}
                        className="w-14 h-11 rounded-xl border border-border cursor-pointer p-0.5 bg-white"
                      />
                      <span className="font-sans text-[0.8rem] text-slate uppercase tracking-wide">{agent.accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Team section */}
              <div className="border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowTeam(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-transparent border-none cursor-pointer hover:bg-light-gray transition-colors"
                >
                  <span className="font-sans text-[0.88rem] font-semibold text-deep">Are you part of a team? <span className="font-normal text-slate">(optional)</span></span>
                  <span className="font-sans text-[0.8rem] text-slate">{showTeam ? "▲" : "▼"}</span>
                </button>
                {showTeam && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    <div>
                      <label className={lCls}>Team Name</label>
                      <input
                        className={iCls}
                        placeholder="The Smith Group"
                        value={team.name}
                        onChange={e => setTeam(t => ({ ...t, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className={lCls}>Team Logo <span className="font-normal text-slate/60">(optional)</span></label>
                      <input
                        ref={teamLogoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = ev => setTeam(t => ({ ...t, logo: ev.target.result }));
                          reader.readAsDataURL(file);
                          e.target.value = "";
                        }}
                      />
                      {team.logo ? (
                        <div className="flex items-center gap-3 mt-1">
                          <img src={team.logo} alt="Team logo" className="h-12 w-auto object-contain rounded-lg border border-border p-1 bg-white" />
                          <button
                            onClick={() => setTeam(t => ({ ...t, logo: null }))}
                            className="font-sans text-[0.78rem] text-slate hover:text-coral transition-colors border-none bg-transparent cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => teamLogoRef.current?.click()}
                          className="mt-1 w-full border-2 border-dashed border-border rounded-xl py-3 font-sans text-[0.85rem] text-slate hover:border-coral hover:text-coral transition-colors bg-transparent cursor-pointer"
                        >
                          + Upload Team Logo
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {kwError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="font-sans text-[0.85rem] text-red-600">{kwError}</p>
                </div>
              )}
              <button
                onClick={() => { setKwError(""); setStep(1); }}
                disabled={!agent.name || !phoneComplete(agent.officePhone) || !phoneComplete(agent.mobilePhone)}
                className="w-full bg-coral text-white font-sans font-semibold py-3.5 rounded-full border-none cursor-pointer hover:bg-coral-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Continue →
              </button>
            </div>
          )}

          {/* Step 1: Address */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-[1.5rem] text-deep mb-1">The property</h2>
                <p className="font-sans text-[0.87rem] text-slate mb-4">Paste your listing link to pull the address and price — or enter them manually below.</p>
              </div>

              {/* ── Import from listing link (step 1 — address + price only) ── */}
              <div className="border border-border rounded-2xl p-4 bg-light-gray/40">
                <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.08em] text-coral mb-2">Import from Listing Link</p>
                <div className="flex gap-2">
                  <input
                    className={iCls + " flex-1 text-[0.85rem] py-2.5"}
                    placeholder="Paste Zillow, Realtor.com, or KW listing URL…"
                    value={importUrl}
                    onChange={e => setImportUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleImport()}
                    disabled={importing}
                  />
                  <button
                    onClick={handleImport}
                    disabled={importing || !importUrl.trim()}
                    className="flex-shrink-0 bg-coral text-white font-sans text-[0.83rem] font-semibold px-4 py-2.5 rounded-xl border-none cursor-pointer hover:bg-coral-dark transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
                  >
                    {importing
                      ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" /> Looking up…</>
                      : "Look Up"}
                  </button>
                </div>
                {importMsg.text && (
                  <p className={`font-sans text-[0.78rem] mt-2 ${importMsg.type === "ok" ? "text-green-700" : "text-coral"}`}>
                    {importMsg.type === "ok" ? "✓ " : "⚠ "}{importMsg.text}
                  </p>
                )}
              </div>

              <div>
                <label className={lCls}>Street Address</label>
                <input
                  ref={addressRef}
                  className={iCls}
                  placeholder="123 Maple Street"
                  value={listing.address}
                  onChange={e => setListing(l => ({ ...l, address: e.target.value }))}
                  autoComplete="off"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>City</label>
                  <input className={iCls} placeholder="Chattanooga" value={listing.city} onChange={e => setListing(l => ({ ...l, city: e.target.value }))} />
                </div>
                <div>
                  <label className={lCls}>State</label>
                  <input className={iCls} placeholder="TN" value={listing.state} onChange={e => setListing(l => ({ ...l, state: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>Zip Code</label>
                  <input className={iCls} placeholder="78701" value={listing.zip} onChange={e => setListing(l => ({ ...l, zip: e.target.value }))} />
                </div>
                <div>
                  <label className={lCls}>List Price</label>
                  <input className={iCls} placeholder="$450,000" inputMode="numeric" value={listing.price ? formatPrice(listing.price) : ""} onChange={e => setListing(l => ({ ...l, price: e.target.value.replace(/\D/g, "") }))} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 border border-border text-slate font-sans font-semibold py-3.5 rounded-full bg-transparent cursor-pointer hover:border-coral hover:text-coral transition-colors">← Back</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!listing.address || !listing.city || !listing.state || !listing.price}
                  className="flex-[2] bg-coral text-white font-sans font-semibold py-3.5 rounded-full border-none cursor-pointer hover:bg-coral-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Property details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-[1.5rem] text-deep mb-1">Property details</h2>
                <p className="font-sans text-[0.87rem] text-slate mb-4">Fill in the details below — or paste your KW, Zillow, or Realtor.com listing link to pull details and photos automatically.</p>
              </div>

              {/* ── Import from listing link ── */}
              <div className="border border-border rounded-2xl overflow-hidden">
                <div className="p-4 bg-light-gray/40">
                  <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.08em] text-coral mb-2">Import from Listing Link</p>
                  <div className="flex gap-2">
                    <input
                      className={iCls + " flex-1 text-[0.85rem] py-2.5"}
                      placeholder="Paste Zillow, Realtor.com, or KW listing URL…"
                      value={importUrl}
                      onChange={e => setImportUrl(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleImport()}
                      disabled={importing}
                    />
                    <button
                      onClick={handleImport}
                      disabled={importing || !importUrl.trim()}
                      className="flex-shrink-0 bg-coral text-white font-sans text-[0.83rem] font-semibold px-4 py-2.5 rounded-xl border-none cursor-pointer hover:bg-coral-dark transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
                    >
                      {importing
                        ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" /> Looking up…</>
                        : "Look Up"}
                    </button>
                  </div>
                  {importMsg.text && (
                    <p className={`font-sans text-[0.78rem] mt-2 ${importMsg.type === "ok" ? "text-green-700" : "text-coral"}`}>
                      {importMsg.type === "ok" ? "✓ " : "⚠ "}{importMsg.text}
                    </p>
                  )}
                </div>

                {/* Photo picker */}
                {pickerPhotos.length > 0 && (
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <p className="font-sans text-[0.82rem] font-semibold text-deep">
                        Select up to 10 photos <span className="font-normal text-slate/60">— first selected becomes primary</span>
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="font-sans text-[0.75rem] text-slate">{pickerSelected.size}/10</span>
                        <button onClick={() => setPickerSelected(new Set(pickerPhotos.slice(0, 10).map((_, i) => i)))} className="font-sans text-[0.75rem] text-coral border-none bg-transparent cursor-pointer hover:underline">First 10</button>
                        <button onClick={() => setPickerSelected(new Set())} className="font-sans text-[0.75rem] text-slate border-none bg-transparent cursor-pointer hover:underline">None</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {pickerPhotos.map((url, i) => {
                        const sel = pickerSelected.has(i);
                        const isFirst = sel && [...pickerSelected][0] === i;
                        return (
                          <div
                            key={i}
                            onClick={() => togglePicker(i)}
                            className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${sel ? "border-coral" : "border-transparent hover:border-border"}`}
                            style={{ aspectRatio: "4/3" }}
                          >
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={e => { e.target.style.display = "none"; e.target.parentElement.style.background = "#f1f5f9"; }}
                            />
                            {sel && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-coral rounded-full flex items-center justify-center">
                                <span className="text-white text-[0.6rem] font-bold">✓</span>
                              </div>
                            )}
                            {isFirst && (
                              <div className="absolute bottom-0 left-0 right-0 bg-coral/90 text-white font-sans text-[0.6rem] font-bold text-center py-0.5 uppercase tracking-wide">
                                Primary
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={importSelectedPhotos}
                      disabled={pickerSelected.size === 0 || pickerImporting}
                      className="w-full bg-coral text-white font-sans text-[0.88rem] font-semibold py-3 rounded-xl border-none cursor-pointer hover:bg-coral-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {pickerImporting
                        ? <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" /> Importing…</>
                        : `Import ${pickerSelected.size} Photo${pickerSelected.size !== 1 ? "s" : ""}`}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={lCls}>Beds</label>
                  <input className={iCls} placeholder="4" type="number" value={listing.beds} onChange={e => setListing(l => ({ ...l, beds: e.target.value }))} />
                </div>
                <div>
                  <label className={lCls}>Baths</label>
                  <input className={iCls} placeholder="2.5" type="number" step="0.5" value={listing.baths} onChange={e => setListing(l => ({ ...l, baths: e.target.value }))} />
                </div>
                <div>
                  <label className={lCls}>Sq Ft</label>
                  <input className={iCls} placeholder="2200" type="number" value={listing.sqft} onChange={e => setListing(l => ({ ...l, sqft: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={lCls}>Year Built (optional)</label>
                <input className={iCls} placeholder="2005" type="number" value={listing.yearBuilt} onChange={e => setListing(l => ({ ...l, yearBuilt: e.target.value }))} />
              </div>
              <div>
                <label className={lCls}>Key Features</label>
                <input className={iCls} placeholder="Pool, updated kitchen, hardwood floors, 3-car garage..." value={listing.features} onChange={e => setListing(l => ({ ...l, features: e.target.value }))} />
              </div>
              <div>
                <label className={lCls}>What makes this listing special?</label>
                <textarea
                  className={iCls + " resize-none"}
                  placeholder="Cul-de-sac lot, backs up to greenbelt, walking distance to top-rated schools, original owners, recently renovated master suite..."
                  rows={3}
                  value={listing.notes}
                  onChange={e => setListing(l => ({ ...l, notes: e.target.value }))}
                />
              </div>
              {/* Primary photo */}
              <div>
                <label className={lCls}>Primary Photo <span className="text-coral normal-case font-normal tracking-normal">— used in social media graphics</span></label>
                <input ref={primaryPhotoRef} type="file" accept="image/*" hidden onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const base64 = await compressPhoto(file);
                  setPrimaryPhoto({ name: file.name, base64 });
                  e.target.value = "";
                }} />
                {primaryPhoto ? (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="relative flex-shrink-0">
                      <img src={`data:image/jpeg;base64,${primaryPhoto.base64}`} alt={primaryPhoto.name} className="w-28 h-28 object-cover rounded-xl border border-border" />
                      <button onClick={() => setPrimaryPhoto(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-deep text-white rounded-full text-[0.65rem] font-bold border-none cursor-pointer flex items-center justify-center">×</button>
                    </div>
                    <button type="button" onClick={() => primaryPhotoRef.current?.click()} className="font-sans text-[0.82rem] text-slate hover:text-coral transition-colors border border-border rounded-full px-4 py-2 bg-transparent cursor-pointer">Replace photo</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => primaryPhotoRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-xl py-6 text-center cursor-pointer hover:border-coral transition-colors bg-transparent mt-1">
                    <div className="font-sans text-[0.88rem] text-slate">Click to upload primary photo</div>
                    <div className="font-sans text-[0.75rem] text-slate/50 mt-1">1 photo — becomes the graphic background</div>
                  </button>
                )}
              </div>

              {/* Additional photos for website gallery */}
              <div>
                <label className={lCls}>Additional Photos <span className="normal-case font-normal text-slate/60 tracking-normal">— website gallery, up to 10</span></label>
                <input ref={additionalPhotosRef} type="file" accept="image/*" multiple hidden onChange={async e => {
                  const files = Array.from(e.target.files);
                  const compressed = await Promise.all(files.map(async f => ({ name: f.name, base64: await compressPhoto(f) })));
                  setAdditionalPhotos(prev => [...prev, ...compressed].slice(0, 10));
                  e.target.value = "";
                }} />
                {additionalPhotos.length === 0 ? (
                  <button type="button" onClick={() => additionalPhotosRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-xl py-4 text-center cursor-pointer hover:border-coral transition-colors bg-transparent mt-1">
                    <div className="font-sans text-[0.85rem] text-slate">+ Add photos for the website gallery</div>
                    <div className="font-sans text-[0.72rem] text-slate/50 mt-0.5">JPG, PNG — up to 10 photos</div>
                  </button>
                ) : (
                  <div className="mt-2">
                    <div className="flex gap-2 flex-wrap">
                      {additionalPhotos.map((p, i) => (
                        <div key={i} className="relative">
                          <img src={`data:image/jpeg;base64,${p.base64}`} alt={p.name} className="w-20 h-20 object-cover rounded-xl border border-border" />
                          <button onClick={() => setAdditionalPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-deep text-white rounded-full text-[0.65rem] font-bold border-none cursor-pointer flex items-center justify-center">×</button>
                        </div>
                      ))}
                      {additionalPhotos.length < 10 && (
                        <button type="button" onClick={() => additionalPhotosRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-coral transition-colors bg-transparent">
                          <span className="text-slate text-[1.5rem]">+</span>
                        </button>
                      )}
                    </div>
                    <p className="font-sans text-[0.72rem] text-slate/50 mt-2">{additionalPhotos.length}/10 photos added</p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-border text-slate font-sans font-semibold py-3.5 rounded-full bg-transparent cursor-pointer hover:border-coral hover:text-coral transition-colors">← Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!listing.beds || !listing.baths || !listing.sqft}
                  className="flex-[2] bg-coral text-white font-sans font-semibold py-3.5 rounded-full border-none cursor-pointer hover:bg-coral-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm & generate */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-[1.5rem] text-deep mb-1">Ready to generate</h2>
                <p className="font-sans text-[0.87rem] text-slate mb-6">Here's what we'll create for <strong>{listing.address}</strong>:</p>
              </div>
              <div className="space-y-3">
                {[
                  { icon: "🏠", label: "Landing page", desc: "Property description, highlights, neighborhood, schools & market context" },
                  { icon: "📱", label: "5 social graphics", desc: "For Sale, Just Listed, Under Contract, Price Refresh, and Sold" },
                  { icon: "✍️", label: "5 ready-to-post captions", desc: `Written in your ${agent.style} style for every stage` },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-4 bg-light-gray rounded-2xl p-4">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <div className="font-sans text-[0.9rem] font-semibold text-deep">{label}</div>
                      <div className="font-sans text-[0.8rem] text-slate mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              {error && <p className="font-sans text-[0.82rem] text-coral">{error}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-border text-slate font-sans font-semibold py-3.5 rounded-full bg-transparent cursor-pointer hover:border-coral hover:text-coral transition-colors" disabled={loading}>← Back</button>
                <button
                  onClick={generate}
                  disabled={loading}
                  className="flex-[2] bg-coral text-white font-sans font-semibold py-3.5 rounded-full border-none cursor-pointer hover:bg-coral-dark transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                      Generating…
                    </span>
                  ) : "✨ Generate Everything"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
