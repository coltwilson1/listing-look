"use client";

import Icon from "./Icons";

export default function ServicesWithModals({ content: c }) {
  function scrollToStart() {
    document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" });
  }

  const LISTING_FEATURES = [
    { icon: "home", title: "Custom Landing Page", desc: "Built from your MLS ID and listing photos — a shareable link for every platform." },
    { icon: "phone", title: "Every Stage Covered", desc: "Just Listed, Under Contract, Price Reduced, and Sold graphics included." },
    { icon: "pen", title: "Ready-to-Use Captions", desc: "Copy, paste, and post — captions written for every graphic." },
    { icon: "bolt", title: "No Subscription Needed", desc: "Standalone purchase, $99 per listing. Order anytime." },
  ];

  return (
    <section id="services" className="py-28 px-6 md:px-10 bg-ivory">
      <div className="max-w-[1180px] mx-auto">

        {/* Section header */}
        <div className="flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-brass mb-4">
          <span className="w-8 h-px bg-brass/60" />
          {c.tag}
        </div>
        <h2 className="font-serif text-[clamp(2.3rem,4.4vw,3.5rem)] leading-[1.1] text-ink mb-5 max-w-[680px]">{c.title}</h2>
        <p className="font-sans text-[1.02rem] text-slate leading-[1.8] max-w-[560px] mb-16">
          {c.subtitle}
        </p>

        {/* ── Subscription Plans ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-10">
          {c.items.map(({ icon, title, description, listItems, price, buttonText, badge }, i) => (
            <div
              key={i}
              className={`relative rounded-[4px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(15,26,43,0.14)] ${
                badge
                  ? "bg-ink border border-ink shadow-[0_18px_40px_rgba(15,26,43,0.18)]"
                  : "bg-white border border-border"
              }`}
            >
              <div className="p-9">
                <div className="flex items-center justify-between mb-6">
                  <span className={`text-[0.7rem] tracking-[0.3em] ${badge ? "text-champagne" : "text-brass"}`}>{icon}</span>
                  {badge && (
                    <span className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-champagne border border-champagne/40 px-3 py-1 rounded-[2px]">
                      {badge}
                    </span>
                  )}
                </div>
                <h3 className={`font-serif text-[2rem] leading-none mb-3 ${badge ? "text-white" : "text-ink"}`}>{title}</h3>
                <div className={`font-serif text-[1.5rem] mb-5 ${badge ? "text-champagne" : "text-brass"}`}>{price}</div>
                <p className={`font-sans text-[0.88rem] leading-[1.75] pb-6 mb-6 border-b ${badge ? "text-white/65 border-white/15" : "text-slate border-border"}`}>{description}</p>
                <ul className="space-y-2.5 mb-9 list-none p-0">
                  {(listItems || []).map((item, j) => (
                    <li key={j} className={`font-sans text-[0.84rem] flex items-start gap-2.5 ${badge ? "text-white/75" : "text-slate"}`}>
                      <Icon name="check" size={14} strokeWidth={1.8} className={`mt-[0.2rem] flex-shrink-0 ${badge ? "text-champagne" : "text-brass"}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={scrollToStart}
                  className={`w-full font-sans text-[0.76rem] font-semibold uppercase tracking-[0.18em] py-4 rounded-[3px] border-none cursor-pointer transition-colors duration-300 ${
                    badge
                      ? "bg-champagne text-ink hover:bg-white"
                      : "bg-ink text-white hover:bg-brass"
                  }`}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px bg-border" />
          <span className="font-sans text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-slate/70 whitespace-nowrap">
            Also available — no subscription required
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* ── Listing Launch (one-time) ── */}
        <div className="bg-ink rounded-[4px] overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start gap-0">

            {/* Left: copy */}
            <div className="flex-1 p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 border border-champagne/40 text-champagne text-[0.64rem] font-semibold uppercase tracking-[0.24em] px-3.5 py-1.5 rounded-[2px] mb-6">
                One-Time Package
              </div>
              <h3 className="font-serif text-[clamp(2.2rem,3.4vw,2.9rem)] leading-none text-white mb-3">
                Listing Launch
              </h3>
              <div className="font-serif text-[1.5rem] text-champagne mb-5">$99 / listing</div>
              <p className="font-sans text-[0.95rem] text-white/65 leading-[1.75] mb-8 max-w-[400px]">
                A complete marketing package for a single listing — landing page, social graphics for every stage, and ready-to-use captions. No subscription needed.
              </p>
              <a
                href="/listing-launch"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-sans bg-champagne text-ink font-semibold px-9 py-4 rounded-[3px] text-[0.76rem] uppercase tracking-[0.18em] no-underline hover:bg-white transition-colors duration-300"
              >
                Launch Your Listing
              </a>
            </div>

            {/* Right: features */}
            <div className="flex-1 grid grid-cols-2 gap-px bg-white/[0.06] border-t lg:border-t-0 lg:border-l border-white/[0.08] w-full">
              {LISTING_FEATURES.map(({ icon, title, desc }) => (
                <div key={title} className="bg-ink p-7 hover:bg-white/[0.04] transition-colors">
                  <Icon name={icon} size={24} className="text-champagne mb-4" />
                  <h4 className="font-sans text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-white mb-2">{title}</h4>
                  <p className="font-sans text-[0.8rem] text-white/50 leading-[1.65]">{desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
