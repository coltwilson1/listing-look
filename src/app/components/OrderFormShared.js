"use client";

// ── Shared input style helpers ────────────────────────────────────────────────

export const labelCls =
  "block font-sans text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1.5";

export const inputCls =
  "w-full font-sans text-[0.9rem] text-deep bg-cream border border-border rounded-xl px-4 py-2.5 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all placeholder:text-slate/40";

export const selectCls = inputCls + " cursor-pointer";

// ── Step 1 — Contact Info ─────────────────────────────────────────────────────

export function ContactStep({ data, onChange }) {
  const field = (name) => ({
    value: data[name] || "",
    onChange: (e) => onChange(name, e.target.value),
  });

  return (
    <div className="step-animate grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Full Name *</label>
          <input className={inputCls} placeholder="Jane Smith" {...field("name")} />
        </div>
        <div>
          <label className={labelCls}>Brokerage / Firm</label>
          <input className={inputCls} placeholder="Keller Williams" {...field("firm")} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Phone *</label>
          <input className={inputCls} type="tel" placeholder="(555) 000-0000" {...field("phone")} />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input className={inputCls} type="email" placeholder="jane@firm.com" {...field("email")} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Instagram Handle</label>
          <input className={inputCls} placeholder="@janesmith.realtor" {...field("instagram")} />
        </div>
        <div>
          <label className={labelCls}>Facebook Profile / Page</label>
          <input className={inputCls} placeholder="facebook.com/janesmith" {...field("facebook")} />
        </div>
      </div>
    </div>
  );
}

// ── Step 2 — Listing Details ──────────────────────────────────────────────────

export function ListingStep({ data, onChange, hidePhotoDelivery = false }) {
  const field = (name) => ({
    value: data[name] || "",
    onChange: (e) => onChange(name, e.target.value),
  });

  const check = (name) => ({
    checked: !!data[name],
    onChange: (e) => onChange(name, e.target.checked),
  });

  return (
    <div className="step-animate grid grid-cols-1 gap-4">
      <div>
        <label className={labelCls}>Property Address *</label>
        <input className={inputCls} placeholder="123 Oak Street, Tampa, FL 33601" {...field("address")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Listing Price *</label>
          <input className={inputCls} placeholder="$485,000" {...field("price")} />
        </div>
        <div>
          <label className={labelCls}>MLS #</label>
          <input className={inputCls} placeholder="T3523100" {...field("mls")} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Beds</label>
          <input className={inputCls} placeholder="4" {...field("beds")} />
        </div>
        <div>
          <label className={labelCls}>Baths</label>
          <input className={inputCls} placeholder="2.5" {...field("baths")} />
        </div>
        <div>
          <label className={labelCls}>Sq Ft</label>
          <input className={inputCls} placeholder="2,100" {...field("sqft")} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Property Highlights</label>
        <textarea
          className={inputCls + " resize-none"}
          rows={3}
          placeholder="Pool, updated kitchen, corner lot, new roof..."
          {...field("highlights")}
        />
      </div>

      {/* MLS toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none group w-fit">
        <div className="relative">
          <input type="checkbox" className="sr-only" {...check("mlsPublic")} />
          <div
            className={`w-10 h-5 rounded-full transition-colors duration-200 ${
              data.mlsPublic ? "bg-coral" : "bg-border"
            }`}
          />
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
              data.mlsPublic ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </div>
        <span className="font-sans text-[0.85rem] text-slate group-hover:text-deep transition-colors">
          Include MLS # on graphic
        </span>
      </label>

      {/* Photo delivery */}
      {!hidePhotoDelivery && (
        <div>
          <label className={labelCls}>How will you provide photos?</label>
          <select className={selectCls} {...field("photoDelivery")}>
            <option value="">Select option…</option>
            <option value="dropbox">Dropbox / Google Drive link</option>
            <option value="mls">Pull from MLS listing</option>
            <option value="email">Email after submitting</option>
            <option value="zillow">Zillow / Realtor.com listing URL</option>
          </select>
        </div>
      )}
    </div>
  );
}
