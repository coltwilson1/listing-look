import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function proxyUrl(url) {
  if (!url) return null;
  return `/api/listing-launch/proxy-photo?url=${encodeURIComponent(url)}`;
}

function hex(color, fallback) {
  return color || fallback;
}

export async function generateMetadata({ params }) {
  const { orderId } = await params;
  const supabase = serviceClient();
  const { data: row } = await supabase.from("orders").select("address, form_data").eq("id", orderId).single();
  const lp = row?.form_data?.landingPage;
  return {
    title: lp?.headline || row?.address || "Property Listing",
    description: lp?.subheadline || "",
  };
}

export default async function ListingPage({ params }) {
  const { orderId } = await params;
  const supabase = serviceClient();

  const { data: row } = await supabase.from("orders").select("*").eq("id", orderId).single();
  if (!row) notFound();

  const fd = row.form_data || {};
  const lp = fd.landingPage || {};
  const agent = fd.agent || {};
  const listing = fd.listing || {};
  const photoUrls = fd.photoUrls || [];

  const primary = hex(agent.primaryColor, "#C8102E");
  const accent  = hex(agent.accentColor,  "#ffffff");
  const labelClr = hex(agent.labelColor, primary);
  const bodyClr  = hex(agent.bodyColor, "#475569");
  const footerText = hex(agent.footerTextColor, "#ffffff");

  const primaryImg = photoUrls[0] ? proxyUrl(photoUrls[0]) : null;
  const galleryPhotos = photoUrls.slice(0, 10);

  function hexToRgba(hex, alpha) {
    const c = (hex || "#000000").replace("#", "").padEnd(6, "0");
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  return (
    <main className="min-h-screen bg-[#f8f5f0]">
      {/* Hero */}
      <div
        className="relative px-8 py-20 text-center"
        style={primaryImg
          ? { backgroundImage: `url(${primaryImg})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: primary }
        }
      >
        {primaryImg && (
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${hexToRgba(primary, 0.35)}, ${hexToRgba(primary, 0.72)})` }} />
        )}
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: accent }}>Now Available</p>
          <h1 className="font-serif text-[clamp(1.8rem,4vw,3rem)] text-white leading-tight mb-4">{lp.headline}</h1>
          <p className="font-sans text-[1rem] text-white/80 mb-6">{lp.subheadline}</p>
          <div className="inline-flex gap-5 flex-wrap justify-center font-sans text-[0.88rem] text-white/90 bg-black/25 px-6 py-3 rounded-full backdrop-blur-sm">
            {listing.beds && <span>🛏 {listing.beds} Beds</span>}
            {listing.baths && <span>🛁 {listing.baths} Baths</span>}
            {listing.sqft && <span>📐 {parseInt(listing.sqft || 0).toLocaleString()} sqft</span>}
            {listing.price && <span>💰 ${parseInt(listing.price || 0).toLocaleString()}</span>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* Description */}
        <div>
          <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: labelClr }}>About This Home</p>
          <p className="font-sans text-[0.95rem] leading-[1.8]" style={{ color: bodyClr }}>{lp.description}</p>
        </div>

        {/* Photo gallery */}
        {galleryPhotos.length > 0 && (
          <div>
            <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: labelClr }}>Photos</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryPhotos.map((url, i) => (
                <img
                  key={i}
                  src={proxyUrl(url)}
                  alt=""
                  className="w-full rounded-xl object-cover border border-[#E2DDD6]"
                  style={{ aspectRatio: "4/3" }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Highlights */}
        {lp.highlights?.length > 0 && (
          <div>
            <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] mb-3" style={{ color: labelClr }}>Property Highlights</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {lp.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 font-sans text-[0.9rem]" style={{ color: bodyClr }}>
                  <span className="font-bold mt-0.5" style={{ color: labelClr }}>✓</span> {h}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Neighborhood */}
        {lp.neighborhood && (
          <div>
            <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: labelClr }}>The Neighborhood</p>
            <p className="font-sans text-[0.95rem] leading-[1.8]" style={{ color: bodyClr }}>{lp.neighborhood}</p>
          </div>
        )}

        {/* Schools */}
        {lp.schools && (
          <div>
            <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: labelClr }}>Schools</p>
            <p className="font-sans text-[0.95rem] leading-[1.8]" style={{ color: bodyClr }}>{lp.schools}</p>
          </div>
        )}

        {/* Market */}
        {lp.marketContext && (
          <div>
            <p className="font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: labelClr }}>Local Market</p>
            <p className="font-sans text-[0.95rem] leading-[1.8]" style={{ color: bodyClr }}>{lp.marketContext}</p>
          </div>
        )}
      </div>

      {/* Agent CTA Footer */}
      <div className="px-6 py-12 text-center" style={{ background: primary }}>
        <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
          <img
            src="/logos/KW%20Logos/Black_White/KellerWilliams_Realty_GreaterChattanooga_Logo_rev-W.png"
            alt="Keller Williams Realty Greater Chattanooga"
            className="h-10 w-auto object-contain"
          />
        </div>
        <p className="font-sans text-[0.75rem] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: accent }}>
          {lp.callToAction || "Schedule Your Showing Today"}
        </p>
        <p className="font-serif text-[1.5rem] mb-1" style={{ color: footerText }}>{agent.name}</p>
        <p className="font-sans text-[0.88rem] mb-1" style={{ color: `${footerText}bb` }}>{agent.brokerage}</p>
        {agent.license && (
          <p className="font-sans text-[0.75rem] mb-3" style={{ color: `${footerText}88` }}>
            License #{agent.license}{agent.gaLicense ? ` · GA #${agent.gaLicense}` : ""}
          </p>
        )}
        {agent.mobilePhone && (
          <a
            href={`tel:${agent.mobilePhone.replace(/\D/g, "")}`}
            className="inline-block font-sans font-semibold text-[0.9rem] px-8 py-3 rounded-full border-none cursor-pointer transition-opacity hover:opacity-80 no-underline"
            style={{ background: accent, color: primary }}
          >
            📞 {agent.mobilePhone}
          </a>
        )}
      </div>
    </main>
  );
}
