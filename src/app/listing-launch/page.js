"use client";

import { useState, useEffect, useRef } from "react";

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

const COLOR_SCHEMES = [
  { id: "kwred",     label: "KW Red",    swatch: ["#C8102E", "#ffffff"] },
  { id: "forest",    label: "Forest",    swatch: ["#1a3d35", "#c9a84c"] },
  { id: "navy",      label: "Navy",      swatch: ["#1C1C2E", "#E8825A"] },
  { id: "midnight",  label: "Midnight",  swatch: ["#0f0f0f", "#e2e8f0"] },
  { id: "warm",      label: "Warm",      swatch: ["#2a1810", "#d4835a"] },
  { id: "slate",     label: "Slate",     swatch: ["#1a2233", "#60a5fa"] },
  { id: "burgundy",  label: "Burgundy",  swatch: ["#2d0f14", "#c9a84c"] },
  { id: "sage",      label: "Sage",      swatch: ["#2a3d2a", "#e8d5b0"] },
  { id: "ocean",     label: "Ocean",     swatch: ["#0d2233", "#48cae4"] },
  { id: "plum",      label: "Plum",      swatch: ["#2a1a33", "#c084fc"] },
  { id: "charcoal",  label: "Charcoal",  swatch: ["#2a2a2a", "#fbbf24"] },
  { id: "rose",      label: "Rose",      swatch: ["#2d1a1f", "#f9a8c9"] },
  { id: "emerald",   label: "Emerald",   swatch: ["#0f2d1f", "#34d399"] },
  { id: "desert",    label: "Desert",    swatch: ["#3d2a1a", "#e8c06a"] },
  { id: "crimson",   label: "Crimson",   swatch: ["#7f0000", "#ffffff"] },
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

// ── Social graphic card preview ───────────────────────────────────────────────

function GraphicCard({ type, graphicText, listing, agent, color }) {
  const labels = { justListed: "Just Listed", underContract: "Under Contract", priceReduced: "Price Reduced", sold: "Sold" };
  const colors = { justListed: "#E8825A", underContract: "#3b82f6", priceReduced: "#f59e0b", sold: "#10b981" };
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

function CaptionCard({ label, caption, color }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(caption).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.1em]" style={{ color }}>{label}</span>
        <button onClick={copy} className="font-sans text-[0.75rem] text-slate hover:text-coral transition-colors border-none bg-transparent cursor-pointer">
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>
      <p className="font-sans text-[0.85rem] text-slate leading-[1.7] whitespace-pre-line">{caption}</p>
    </div>
  );
}

// ── Landing page preview ──────────────────────────────────────────────────────

function LandingPreview({ lp, listing, agent, photos }) {
  const [lightbox, setLightbox] = useState(null);
  const mainPhoto = photos?.[0]?.base64;
  const allPhotos = photos || [];

  return (
    <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-lg">
      {/* Hero */}
      <div
        className="relative px-8 py-14 text-center"
        style={mainPhoto
          ? { backgroundImage: `url(data:image/jpeg;base64,${mainPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: "#1C1C2E" }
        }
      >
        {mainPhoto && <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(28,28,46,0.35), rgba(28,28,46,0.72))" }} />}
        <div className="relative z-10">
          <div className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.18em] text-coral mb-3">Now Available</div>
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
          <h3 className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.12em] text-coral mb-2">About This Home</h3>
          <p className="font-sans text-[0.9rem] text-slate leading-[1.75]">{lp.description}</p>
        </div>

        {/* Photo gallery — below description, scrollable row */}
        {allPhotos.length > 0 && (
          <div>
            <h3 className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.12em] text-coral mb-3">Photos</h3>
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
          <h3 className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.12em] text-coral mb-3">Property Highlights</h3>
          <div className="grid grid-cols-2 gap-2">
            {(lp.highlights || []).map((h, i) => (
              <div key={i} className="flex items-start gap-2 font-sans text-[0.85rem] text-slate">
                <span className="text-coral font-bold mt-0.5">✓</span> {h}
              </div>
            ))}
          </div>
        </div>

        {/* Neighborhood */}
        <div>
          <h3 className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.12em] text-coral mb-2">The Neighborhood</h3>
          <p className="font-sans text-[0.9rem] text-slate leading-[1.75]">{lp.neighborhood}</p>
        </div>

        {/* Schools */}
        <div>
          <h3 className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.12em] text-coral mb-2">Schools</h3>
          <p className="font-sans text-[0.9rem] text-slate leading-[1.75]">{lp.schools}</p>
        </div>

        {/* Market */}
        <div>
          <h3 className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.12em] text-coral mb-2">Local Market</h3>
          <p className="font-sans text-[0.9rem] text-slate leading-[1.75]">{lp.marketContext}</p>
        </div>

        {/* Agent CTA / Footer */}
        <div className="bg-deep rounded-2xl p-8 text-center">
          <img
            src="/logos/KW%20Logos/RGB/KellerWilliams_Realty_GreaterChattanooga_Logo_RGB-rev.png"
            alt="Keller Williams Realty Greater Chattanooga"
            className="mx-auto mb-5 w-auto"
            style={{ height: 72 }}
          />
          <p className="font-serif text-[1.3rem] text-white mb-1">{agent.name}</p>
          <p className="font-sans text-[0.88rem] text-white/70 mb-1">{agent.officePhone} &nbsp;·&nbsp; Office</p>
          <p className="font-sans text-[0.88rem] text-white/70 mb-5">{agent.mobilePhone} &nbsp;·&nbsp; Mobile</p>
          <div className="inline-block bg-coral text-white font-sans font-semibold text-[0.88rem] px-6 py-2.5 rounded-full mb-6">
            {lp.callToAction}
          </div>
          <p className="font-sans text-[0.72rem] text-white/40">Each office is independently owned and operated.</p>
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
  const [activeTab, setActiveTab] = useState("landing");
  const [svgGraphics, setSvgGraphics] = useState({});
  const [graphicLoadings, setGraphicLoadings] = useState({});
  const [graphicErrors, setGraphicErrors] = useState({});

  const [kwError, setKwError] = useState("");
  const [phoneErrors, setPhoneErrors] = useState({ officePhone: false, mobilePhone: false });
  const [agent, setAgent] = useState({ name: "", brokerage: "Keller Williams Realty - Greater Chattanooga", license: "", officePhone: "", mobilePhone: "", style: "professional", colorScheme: "forest" });
  const [listing, setListing] = useState({ address: "", city: "", state: "", zip: "", price: "", beds: "", baths: "", sqft: "", yearBuilt: "", features: "", notes: "" });
  const [photos, setPhotos] = useState([]); // array of { name, base64 }
  const photoInputRef = useRef(null);

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
      setStep(4);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateGraphic(l, a, stage) {
    setGraphicLoadings(prev => ({ ...prev, [stage]: true }));
    setGraphicErrors(prev => ({ ...prev, [stage]: "" }));
    setSvgGraphics(prev => ({ ...prev, [stage]: null }));
    try {
      const res = await fetch("/api/listing-launch/graphic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: a, listing: l, stage, primaryPhoto: photos[0]?.base64 || null }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Graphic generation failed");
      setSvgGraphics(prev => ({ ...prev, [stage]: data.svg }));
    } catch (e) {
      setGraphicErrors(prev => ({ ...prev, [stage]: e.message }));
    } finally {
      setGraphicLoading(false);
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
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 1080, 1080);
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
    const GRAPHIC_TYPES = [
      { key: "justListed", label: "Just Listed", color: "#E8825A" },
      { key: "underContract", label: "Under Contract", color: "#3b82f6" },
      { key: "priceReduced", label: "Price Reduced", color: "#f59e0b" },
      { key: "sold", label: "Sold", color: "#10b981" },
    ];

    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-[1100px] mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <div className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] text-coral mb-1">Listing Launch</div>
              <h1 className="font-serif text-[2rem] text-deep">{l.address}</h1>
              <p className="font-sans text-[0.88rem] text-slate mt-1">${parseInt(l.price).toLocaleString()} · {l.beds} bd · {l.baths} ba · {parseInt(l.sqft || 0).toLocaleString()} sqft</p>
            </div>
            <button onClick={() => { setStep(0); setResult(null); }} className="font-sans text-[0.85rem] text-slate hover:text-coral transition-colors border border-border rounded-full px-4 py-2 bg-transparent cursor-pointer">
              ← New Listing
            </button>
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
              <p className="font-sans text-[0.85rem] text-slate mb-5">AI-powered landing page for <strong>{l.address}</strong>. This is a preview — send this to The Listing Look team to publish it as a live shareable link.</p>
              <LandingPreview lp={generated.landingPage} listing={l} agent={a} photos={photos} />
            </div>
          )}

          {activeTab === "graphics" && (
            <div className="space-y-6">
              <p className="font-sans text-[0.85rem] text-slate">Generate a custom 1080×1080 graphic for each stage — download as PNG or SVG and post directly.</p>
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
                        <p className="font-sans text-[0.8rem] text-slate mt-0.5">AI-powered custom graphic — 1080×1080, ready to post.</p>
                      </div>
                      {!svg && (
                        <button
                          onClick={() => generateGraphic(l, a, key)}
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
                        <div className="rounded-2xl overflow-hidden border border-border mb-4" style={{ maxWidth: 400 }}
                          dangerouslySetInnerHTML={{ __html: svg.replace("<svg", '<svg width="100%" height="100%"') }}
                        />
                        <div className="flex gap-3 flex-wrap">
                          <button onClick={() => downloadPNG(svg, `${slug}.png`)} className="flex items-center gap-2 bg-coral text-white font-sans text-[0.85rem] font-semibold px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-coral-dark transition-colors">⬇ Download PNG</button>
                          <button onClick={() => downloadSVG(svg, `${slug}.svg`)} className="flex items-center gap-2 border border-border text-slate font-sans text-[0.85rem] font-semibold px-5 py-2.5 rounded-full bg-transparent cursor-pointer hover:border-coral hover:text-coral transition-colors">⬇ Download SVG</button>
                          <button onClick={() => { setSvgGraphics(p => ({ ...p, [key]: null })); generateGraphic(l, a, key); }} className="flex items-center gap-2 border border-border text-slate font-sans text-[0.85rem] px-5 py-2.5 rounded-full bg-transparent cursor-pointer hover:border-coral hover:text-coral transition-colors">↻ Regenerate</button>
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
              <p className="font-sans text-[0.85rem] text-slate mb-2">Ready-to-post captions for every stage. Click "Copy" to grab any caption.</p>
              {GRAPHIC_TYPES.map(({ key, label, color }) => (
                <CaptionCard key={key} label={label} caption={generated.captions?.[key] || ""} color={color} />
              ))}
            </div>
          )}
        </div>
      </div>
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

        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">
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
              <div>
                <label className={lCls}>TN License # <span className="text-coral">*</span></label>
                <input className={iCls} placeholder="e.g. 123456" value={agent.license} onChange={e => setAgent(a => ({ ...a, license: e.target.value }))} />
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
                <div className="grid grid-cols-3 gap-3 mt-1">
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
                <label className={lCls}>Graphic Color Scheme</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {COLOR_SCHEMES.map(cs => (
                    <button
                      key={cs.id}
                      onClick={() => setAgent(a => ({ ...a, colorScheme: cs.id }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all cursor-pointer bg-white ${agent.colorScheme === cs.id ? "border-coral" : "border-border hover:border-slate/30"}`}
                    >
                      <span className="flex gap-1 flex-shrink-0">
                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: cs.swatch[0] }} />
                        <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: cs.swatch[1] }} />
                      </span>
                      <span className={`font-sans text-[0.78rem] font-semibold truncate ${agent.colorScheme === cs.id ? "text-coral" : "text-deep"}`}>{cs.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              {kwError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="font-sans text-[0.85rem] text-red-600">{kwError}</p>
                </div>
              )}
              <button
                onClick={() => { setKwError(""); setStep(1); }}
                disabled={!agent.name || !agent.license || !phoneComplete(agent.officePhone) || !phoneComplete(agent.mobilePhone)}
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
                <p className="font-sans text-[0.87rem] text-slate mb-6">Start typing the address and select it from the suggestions.</p>
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
                  <input className={iCls} placeholder="$450,000" inputMode="numeric" value={listing.price} onChange={e => setListing(l => ({ ...l, price: formatPrice(e.target.value) }))} />
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
                <p className="font-sans text-[0.87rem] text-slate mb-6">The more detail you share, the better your AI-powered content will be.</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
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
              <div>
                <label className={lCls}>Listing Photos <span className="text-coral normal-case font-normal tracking-normal">— used as graphic backgrounds</span></label>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={async (e) => {
                    const files = Array.from(e.target.files).slice(0, 5);
                    const compressed = await Promise.all(files.map(async f => ({ name: f.name, base64: await compressPhoto(f) })));
                    setPhotos(prev => [...prev, ...compressed].slice(0, 5));
                    e.target.value = "";
                  }}
                />
                {photos.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl py-6 text-center cursor-pointer hover:border-coral transition-colors bg-transparent mt-1"
                  >
                    <div className="font-sans text-[0.88rem] text-slate">Click to upload photos</div>
                    <div className="font-sans text-[0.75rem] text-slate/50 mt-1">JPG, PNG — up to 5 photos. First photo used as graphic background.</div>
                  </button>
                ) : (
                  <div className="mt-1">
                    <div className="flex gap-2 flex-wrap">
                      {photos.map((p, i) => (
                        <div key={i} className="relative">
                          <img src={`data:image/jpeg;base64,${p.base64}`} alt={p.name} className="w-20 h-20 object-cover rounded-xl border border-border" />
                          {i === 0 && <span className="absolute top-1 left-1 bg-coral text-white font-sans text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full">Main</span>}
                          <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-deep text-white rounded-full text-[0.65rem] font-bold border-none cursor-pointer flex items-center justify-center">×</button>
                        </div>
                      ))}
                      {photos.length < 5 && (
                        <button type="button" onClick={() => photoInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:border-coral transition-colors bg-transparent">
                          <span className="text-slate text-[1.5rem]">+</span>
                        </button>
                      )}
                    </div>
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
                  { icon: "📱", label: "4 social graphics", desc: "Just Listed, Under Contract, Price Reduced, and Sold" },
                  { icon: "✍️", label: "4 ready-to-post captions", desc: `Written in your ${agent.style} style for every stage` },
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
