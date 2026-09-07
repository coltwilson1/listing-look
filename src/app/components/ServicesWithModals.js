"use client";

export default function ServicesWithModals({ content: c }) {
  function handleGetStarted() {
    document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="services" className="py-24 px-8 bg-light-gray">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-coral mb-3">
          {c.tag}
        </div>
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-deep mb-4">{c.title}</h2>
        <p className="font-sans text-[1.05rem] text-slate leading-[1.7] max-w-[560px] mb-14">
          {c.subtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
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
                <span className="text-coral text-[0.85rem] font-bold tracking-[0.25em] mb-3 block">{icon}</span>
                <h3 className="font-serif text-[1.5rem] text-deep mb-1">{title}</h3>
                <div className="font-sans text-[1.35rem] font-bold text-coral mb-4">{price}</div>
                <p className="font-sans text-[0.88rem] text-slate leading-[1.7] mb-6">{description}</p>
                <ul className="space-y-2 mb-8 list-none p-0">
                  {(listItems || []).map((item, j) => (
                    <li key={j} className="font-sans text-[0.85rem] text-slate flex items-start gap-2">
                      <span className="text-coral font-bold text-[0.8rem] mt-[0.15rem] flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleGetStarted}
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
      </div>
    </section>
  );
}
