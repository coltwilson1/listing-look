"use client";

export default function ServicesWithModals({ content: c }) {
  function scrollToStart() {
    document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" });
  }

  const LISTING_FEATURES = [
    { icon: "🏠", title: "Custom Landing Page", desc: "Built from your MLS ID and listing photos — a shareable link for every platform." },
    { icon: "📱", title: "Every Stage Covered", desc: "Just Listed, Under Contract, Price Reduced, and Sold graphics included." },
    { icon: "✍️", title: "Ready-to-Use Captions", desc: "Copy, paste, and post — captions written for every graphic." },
    { icon: "⚡", title: "No Subscription Needed", desc: "Standalone purchase, $150 per listing. Order anytime." },
  ];

  return (
    <section id="services" className="py-24 px-8 bg-light-gray">
      <div className="max-w-[1200px] mx-auto">

        {/* Section header */}
        <div className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-coral mb-3">
          {c.tag}
        </div>
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-deep mb-4">{c.title}</h2>
        <p className="font-sans text-[1.05rem] text-slate leading-[1.7] max-w-[560px] mb-14">
          {c.subtitle}
        </p>

        {/* ── Subscription Plans ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-10">
          {c.items.map(({ icon, title, description, listItems, price, buttonText, badge }, i) => (
            <div
              key={i}
              className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(28,28,46,0.12)] ${
                badge
                  ? "border-2 border-coral shadow-[0_4px_24px_rgba(232,130,90,0.18)]"
                  : "border border-border group"
              }`}
            >
              {badge ? (
                <div className="bg-coral text-white text-center font-sans text-[0.72rem] font-bold uppercase tracking-[0.12em] py-1.5">
                  {badge}
                </div>
              ) : (
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-coral to-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              )}

              <div className="p-8">
                <span className="text-coral text-[0.8rem] font-bold tracking-[0.3em] mb-3 block">{icon}</span>
                <h3 className="font-serif text-[1.5rem] text-deep mb-1">{title}</h3>
                <div className="font-sans text-[1.35rem] font-bold text-coral mb-4">{price}</div>
                <p className="font-sans text-[0.87rem] text-slate leading-[1.7] mb-6">{description}</p>
                <ul className="space-y-2 mb-8 list-none p-0">
                  {(listItems || []).map((item, j) => (
                    <li key={j} className="font-sans text-[0.84rem] text-slate flex items-start gap-2">
                      <span className="text-coral font-bold text-[0.75rem] mt-[0.18rem] flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={scrollToStart}
                  className={`w-full font-sans text-[0.9rem] font-semibold py-3.5 rounded-full border-none cursor-pointer transition-all duration-200 ${
                    badge
                      ? "bg-coral text-white hover:bg-coral-dark hover:shadow-[0_6px_20px_rgba(232,130,90,0.35)]"
                      : "bg-deep text-white hover:bg-coral"
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
          <span className="font-sans text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-slate/50 whitespace-nowrap">
            Also available — no subscription required
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* ── Listing Launch (one-time) ── */}
        <div className="bg-deep rounded-3xl overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start gap-0">

            {/* Left: copy */}
            <div className="flex-1 p-10 lg:p-12">
              <div className="inline-flex items-center gap-2 bg-coral/20 text-coral text-[0.7rem] font-bold uppercase tracking-[0.15em] px-3.5 py-1.5 rounded-full mb-5">
                One-Time Package
              </div>
              <h3 className="font-serif text-[clamp(1.7rem,3vw,2.3rem)] text-white mb-2">
                Listing Launch
              </h3>
              <div className="font-sans text-[1.4rem] font-bold text-coral mb-4">$150 / listing</div>
              <p className="font-sans text-[0.95rem] text-white/65 leading-[1.75] mb-8 max-w-[400px]">
                A complete marketing package for a single listing — landing page, social graphics for every stage, and ready-to-use captions. No subscription needed.
              </p>
              <button
                onClick={scrollToStart}
                className="font-sans bg-coral text-white font-semibold px-8 py-3.5 rounded-full text-[0.9rem] border-none cursor-pointer hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,130,90,0.4)] transition-all duration-200"
              >
                Order a Listing Launch
              </button>
            </div>

            {/* Right: features */}
            <div className="flex-1 grid grid-cols-2 gap-px bg-white/[0.06] border-t lg:border-t-0 lg:border-l border-white/[0.08] w-full">
              {LISTING_FEATURES.map(({ icon, title, desc }) => (
                <div key={title} className="bg-deep p-7 hover:bg-white/[0.04] transition-colors">
                  <span className="text-2xl mb-3 block">{icon}</span>
                  <h4 className="font-sans text-[0.9rem] font-semibold text-white mb-1.5">{title}</h4>
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
