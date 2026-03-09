"use client";

import { useState } from "react";
import SocialMediaOrderModal from "./SocialMediaOrderModal";
import PostcardOrderModal from "./PostcardOrderModal";

export default function ServicesWithModals({ content: c }) {
  const [socialOpen, setSocialOpen] = useState(false);
  const [postcardOpen, setPostcardOpen] = useState(false);

  function handleOrderClick(index) {
    if (index === 0) setSocialOpen(true);
    else if (index === 1) setPostcardOpen(true);
    else {
      // Custom Design — scroll to the custom order form
      document.getElementById("custom")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <>
      <section id="services" className="py-24 px-8 bg-light-gray">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-coral mb-3">
            {c.tag}
          </div>
          <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-deep mb-4">{c.title}</h2>
          <p className="font-sans text-[1.05rem] text-slate leading-[1.7] max-w-[560px] mb-14">
            {c.subtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {c.items.map(({ icon, title, description, listItems, price, buttonText }, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-2xl p-8 border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(28,28,46,0.1)]"
              >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-coral to-gold origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <span className="text-[2.2rem] mb-4 block">{icon}</span>
                <h3 className="font-serif text-[1.25rem] text-deep mb-2">{title}</h3>
                <p className="font-sans text-[0.88rem] text-slate leading-[1.7] mb-6">{description}</p>
                <ul className="space-y-1.5 mb-6 list-none p-0">
                  {(listItems || []).map((item, j) => (
                    <li key={j} className="font-sans text-[0.85rem] text-slate flex items-center gap-2">
                      <span className="text-coral font-bold text-[0.8rem]">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="text-[0.8rem] font-semibold text-coral uppercase tracking-[0.08em] mb-4">
                  {price}
                </div>
                <button
                  onClick={() => handleOrderClick(i)}
                  className="inline-block bg-deep text-white font-sans text-[0.85rem] font-semibold px-6 py-2.5 rounded-full hover:bg-coral transition-colors duration-200 cursor-pointer"
                >
                  {buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SocialMediaOrderModal open={socialOpen} onClose={() => setSocialOpen(false)} />
      <PostcardOrderModal open={postcardOpen} onClose={() => setPostcardOpen(false)} />
    </>
  );
}
