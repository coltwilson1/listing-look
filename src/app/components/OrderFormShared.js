"use client";

import { useEffect, useRef } from "react";

// ── Google Maps loader (singleton) ────────────────────────────────────────────
let _mapsReady = false;
let _mapsCallbacks = [];

function loadGoogleMaps(cb) {
  if (_mapsReady) { cb(); return; }
  _mapsCallbacks.push(cb);
  if (document.querySelector('script[src*="maps.googleapis.com"]')) return;
  window.__tllMapsInit = () => {
    _mapsReady = true;
    _mapsCallbacks.forEach((fn) => fn());
    _mapsCallbacks = [];
  };
  const s = document.createElement("script");
  s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=__tllMapsInit`;
  s.async = true;
  document.head.appendChild(s);
}

// ── Shared input style helpers ────────────────────────────────────────────────

export const labelCls =
  "block font-sans text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-slate mb-1.5";

export const inputCls =
  "w-full font-sans text-[0.9rem] text-deep bg-cream border border-border rounded-xl px-4 py-2.5 outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all placeholder:text-slate/40";

export const selectCls = inputCls + " cursor-pointer";

// Error variant — coral border + tinted background
const inputErrCls =
  "w-full font-sans text-[0.9rem] text-deep bg-coral/5 border-2 border-coral rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-coral/20 transition-all placeholder:text-slate/40";

export function ic(hasErr) { return hasErr ? inputErrCls : inputCls; }
export function sc(hasErr) { return hasErr ? inputErrCls + " cursor-pointer" : selectCls; }

// ── Step 1 — Contact Info ─────────────────────────────────────────────────────

export function ContactStep({ data, onChange, errors = {} }) {
  const field = (name) => ({
    value: data[name] || "",
    onChange: (e) => onChange(name, e.target.value),
  });

  return (
    <div className="step-animate grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Full Name * {errors.name && <span className="text-coral normal-case font-normal tracking-normal ml-1">Required</span>}</label>
          <input className={ic(errors.name)} placeholder="Jane Smith" {...field("name")} />
        </div>
        <div>
          <label className={labelCls}>Brokerage / Firm</label>
          <input className={inputCls} placeholder="Keller Williams" {...field("firm")} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Phone * {errors.phone && <span className="text-coral normal-case font-normal tracking-normal ml-1">Required</span>}</label>
          <input
            className={ic(errors.phone)}
            type="tel"
            placeholder="(555) 000-0000"
            value={data.phone || ""}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 10);
              const fmt = d.length <= 3 ? (d ? `(${d}` : "")
                : d.length <= 6 ? `(${d.slice(0,3)}) ${d.slice(3)}`
                : `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
              onChange("phone", fmt);
            }}
          />
        </div>
        <div>
          <label className={labelCls}>Email * {errors.email && <span className="text-coral normal-case font-normal tracking-normal ml-1">Required</span>}</label>
          <input className={ic(errors.email)} type="email" placeholder="jane@firm.com" {...field("email")} />
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

export function ListingStep({ data, onChange, hidePhotoDelivery = false, errors = {} }) {
  const field = (name) => ({
    value: data[name] || "",
    onChange: (e) => onChange(name, e.target.value),
  });

  const check = (name) => ({
    checked: !!data[name],
    onChange: (e) => onChange(name, e.target.checked),
  });

  const addressRef = useRef(null);
  const acRef = useRef(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return;
    loadGoogleMaps(() => {
      if (!addressRef.current || acRef.current) return;
      acRef.current = new window.google.maps.places.Autocomplete(addressRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["formatted_address"],
      });
      acRef.current.addListener("place_changed", () => {
        const place = acRef.current.getPlace();
        if (place?.formatted_address) onChange("address", place.formatted_address);
      });
    });
    return () => {
      if (acRef.current) window.google?.maps?.event?.clearInstanceListeners(acRef.current);
    };
  }, []);

  return (
    <div className="step-animate grid grid-cols-1 gap-4">
      <div>
        <label className={labelCls}>Property Address * {errors.address && <span className="text-coral normal-case font-normal tracking-normal ml-1">Required</span>}</label>
        <input
          ref={addressRef}
          className={ic(errors.address)}
          placeholder="123 Oak Street, Tampa, FL 33601"
          value={data.address || ""}
          onChange={(e) => onChange("address", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Listing Price * {errors.price && <span className="text-coral normal-case font-normal tracking-normal ml-1">Required</span>}</label>
          <input
            className={ic(errors.price)}
            placeholder="$485,000"
            value={data.price || ""}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^0-9]/g, "");
              onChange("price", digits ? "$" + parseInt(digits, 10).toLocaleString() : "");
            }}
          />
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
