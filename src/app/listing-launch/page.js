"use client";

import { useState } from "react";

const STYLES = [
  { id: "professional", label: "Professional", desc: "Polished, elegant, trust-building" },
  { id: "conversational", label: "Conversational", desc: "Warm, personable, relatable" },
  { id: "energetic", label: "Energetic", desc: "Bold, exciting, high-energy" },
];

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

function LandingPreview({ lp, listing, agent }) {
  return (
    <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-lg">
      {/* Hero */}
      <div className="bg-deep px-8 py-12 text-center">
        <div className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.18em] text-coral mb-3">Now Available</div>
        <h1 className="font-serif text-[clamp(1.5rem,3vw,2.4rem)] text-white leading-tight mb-3">{lp.headline}</h1>
        <p className="font-sans text-[0.95rem] text-white/65 mb-5">{lp.subheadline}</p>
        <div className="inline-flex gap-5 flex-wrap justify-center font-sans text-[0.85rem] text-white/80">
          <span>🛏 {listing.beds} Beds</span>
          <span>🛁 {listing.baths} Baths</span>
          <span>📐 {parseInt(listing.sqft || 0).toLocaleString()} sqft</span>
          <span>💰 ${parseInt(listing.price || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="px-8 py-8 space-y-7">
        {/* Description */}
        <div>
          <h3 className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.12em] text-coral mb-2">About This Home</h3>
          <p className="font-sans text-[0.9rem] text-slate leading-[1.75]">{lp.description}</p>
        </div>

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

        {/* Agent CTA */}
        <div className="bg-light-gray rounded-2xl p-6 text-center">
          <p className="font-serif text-[1.1rem] text-deep mb-1">{agent.name}</p>
          <p className="font-sans text-[0.82rem] text-slate mb-4">{agent.brokerage}</p>
          <div className="inline-block bg-coral text-white font-sans font-semibold text-[0.88rem] px-6 py-2.5 rounded-full">
            {lp.callToAction}
          </div>
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
  const [svgGraphic, setSvgGraphic] = useState(null);
  const [graphicLoading, setGraphicLoading] = useState(false);
  const [graphicError, setGraphicError] = useState("");

  const [kwError, setKwError] = useState("");
  const [agent, setAgent] = useState({ name: "", brokerage: "", license: "", phone: "", brokerName: "", style: "professional" });
  const [listing, setListing] = useState({ address: "", city: "", state: "", zip: "", price: "", beds: "", baths: "", sqft: "", yearBuilt: "", features: "", notes: "" });

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

  async function generateGraphic(l, a) {
    setGraphicLoading(true);
    setGraphicError("");
    setSvgGraphic(null);
    try {
      const res = await fetch("/api/listing-launch/graphic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent: a, listing: l }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Graphic generation failed");
      setSvgGraphic(data.svg);
    } catch (e) {
      setGraphicError(e.message);
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
              <p className="font-sans text-[0.85rem] text-slate mb-5">AI-generated landing page for <strong>{l.address}</strong>. This is a preview — send this to The Listing Look team to publish it as a live shareable link.</p>
              <LandingPreview lp={generated.landingPage} listing={l} agent={a} />
            </div>
          )}

          {activeTab === "graphics" && (
            <div>
              {/* AI-designed Just Listed graphic */}
              <div className="bg-light-gray rounded-2xl p-6 mb-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <h3 className="font-sans text-[0.95rem] font-semibold text-deep mb-1">AI-Designed Just Listed Graphic</h3>
                    <p className="font-sans text-[0.82rem] text-slate">Claude designs a unique 1080×1080 graphic for your listing — download as PNG or SVG and post directly.</p>
                  </div>
                  {!svgGraphic && (
                    <button
                      onClick={() => generateGraphic(l, a)}
                      disabled={graphicLoading}
                      className="flex-shrink-0 flex items-center gap-2 bg-deep text-white font-sans text-[0.85rem] font-semibold px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-coral transition-colors disabled:opacity-60"
                    >
                      {graphicLoading ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin inline-block" />
                          Designing…
                        </>
                      ) : "✨ Design My Graphic"}
                    </button>
                  )}
                </div>

                {graphicError && <p className="font-sans text-[0.82rem] text-coral mb-3">{graphicError}</p>}

                {graphicLoading && (
                  <div className="bg-white rounded-2xl border border-border flex items-center justify-center" style={{ aspectRatio: "1/1", maxWidth: 400 }}>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full border-2 border-coral border-t-transparent animate-spin mx-auto mb-3" />
                      <p className="font-sans text-[0.85rem] text-slate">Claude is designing your graphic…</p>
                    </div>
                  </div>
                )}

                {svgGraphic && (
                  <div>
                    <div
                      className="rounded-2xl overflow-hidden border border-border mb-4"
                      style={{ maxWidth: 420 }}
                      dangerouslySetInnerHTML={{ __html: svgGraphic.replace('<svg', '<svg width="100%" height="100%"') }}
                    />
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => downloadPNG(svgGraphic, `just-listed-${l.address.replace(/\s+/g, "-").toLowerCase()}.png`)}
                        className="flex items-center gap-2 bg-coral text-white font-sans text-[0.85rem] font-semibold px-5 py-2.5 rounded-full border-none cursor-pointer hover:bg-coral-dark transition-colors"
                      >
                        ⬇ Download PNG
                      </button>
                      <button
                        onClick={() => downloadSVG(svgGraphic, `just-listed-${l.address.replace(/\s+/g, "-").toLowerCase()}.svg`)}
                        className="flex items-center gap-2 border border-border text-slate font-sans text-[0.85rem] font-semibold px-5 py-2.5 rounded-full bg-transparent cursor-pointer hover:border-coral hover:text-coral transition-colors"
                      >
                        ⬇ Download SVG
                      </button>
                      <button
                        onClick={() => { setSvgGraphic(null); generateGraphic(l, a); }}
                        className="flex items-center gap-2 border border-border text-slate font-sans text-[0.85rem] px-5 py-2.5 rounded-full bg-transparent cursor-pointer hover:border-coral hover:text-coral transition-colors"
                      >
                        ↻ Regenerate
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Stage preview cards */}
              <p className="font-sans text-[0.82rem] text-slate mb-4">Additional graphics for every stage of the sale:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {GRAPHIC_TYPES.map(({ key, label, color }) => (
                  <div key={key}>
                    <GraphicCard type={key} graphicText={generated.graphicText?.[key]} listing={l} agent={a} color={color} />
                    <p className="font-sans text-[0.75rem] text-slate text-center mt-2">{label}</p>
                  </div>
                ))}
              </div>
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
          <p className="font-sans text-[0.9rem] text-slate">Get a landing page, social graphics, and captions — AI-generated in seconds.</p>
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
                <label className={lCls}>Brokerage <span className="text-coral normal-case font-normal tracking-normal">— must be a KW office</span></label>
                <input className={iCls} placeholder="Keller Williams Realty, Nashville, TN" value={agent.brokerage} onChange={e => { setAgent(a => ({ ...a, brokerage: e.target.value })); setKwError(""); }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>TN License # <span className="text-coral">*</span></label>
                  <input className={iCls} placeholder="e.g. 123456" value={agent.license} onChange={e => setAgent(a => ({ ...a, license: e.target.value }))} />
                </div>
                <div>
                  <label className={lCls}>Phone / Website <span className="text-coral">*</span></label>
                  <input className={iCls} placeholder="(615) 000-0000" value={agent.phone} onChange={e => setAgent(a => ({ ...a, phone: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className={lCls}>Responsible Broker Name <span className="text-coral">*</span></label>
                <input className={iCls} placeholder="Your KW team leader or designated broker" value={agent.brokerName} onChange={e => setAgent(a => ({ ...a, brokerName: e.target.value }))} />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="font-sans text-[0.78rem] text-amber-700 leading-relaxed">
                  <strong>TREC compliance:</strong> Your license number, brokerage, broker name, and contact info will be embedded on every graphic per TREC Rule 1260-02.
                </p>
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
              {kwError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="font-sans text-[0.85rem] text-red-600">{kwError}</p>
                </div>
              )}
              <button
                onClick={() => {
                  const isKW = agent.brokerage.toLowerCase().includes("keller williams") || agent.brokerage.toLowerCase().includes("kw ");
                  if (!isKW) { setKwError("Listing Launch is currently available for Keller Williams agents only. If you believe this is an error, contact The Listing Look."); return; }
                  setKwError("");
                  setStep(1);
                }}
                disabled={!agent.name || !agent.brokerage || !agent.license || !agent.phone || !agent.brokerName}
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
                <p className="font-sans text-[0.87rem] text-slate mb-6">Enter the listing address and price. The MLS must have this as an active listing.</p>
              </div>
              <div>
                <label className={lCls}>Street Address</label>
                <input className={iCls} placeholder="123 Maple Street" value={listing.address} onChange={e => setListing(l => ({ ...l, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>City</label>
                  <input className={iCls} placeholder="Austin" value={listing.city} onChange={e => setListing(l => ({ ...l, city: e.target.value }))} />
                </div>
                <div>
                  <label className={lCls}>State</label>
                  <input className={iCls} placeholder="TX" value={listing.state} onChange={e => setListing(l => ({ ...l, state: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lCls}>Zip Code</label>
                  <input className={iCls} placeholder="78701" value={listing.zip} onChange={e => setListing(l => ({ ...l, zip: e.target.value }))} />
                </div>
                <div>
                  <label className={lCls}>List Price</label>
                  <input className={iCls} placeholder="450000" type="number" value={listing.price} onChange={e => setListing(l => ({ ...l, price: e.target.value }))} />
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
                <p className="font-sans text-[0.87rem] text-slate mb-6">The more you share, the better the AI-generated content will be.</p>
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
