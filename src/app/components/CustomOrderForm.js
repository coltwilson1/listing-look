"use client";

import { useState } from "react";

export default function CustomOrderForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    brokerage: "",
    plan: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  const inputClass =
    "w-full bg-white/[0.08] border border-white/[0.12] rounded-xl px-4 py-3 text-white text-[0.9rem] placeholder:text-white/30 focus:outline-none focus:border-coral transition-colors font-sans";
  const labelClass =
    "block text-[0.82rem] font-semibold text-white/70 uppercase tracking-[0.08em] mb-1.5";

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-serif text-2xl text-white mb-2">We'll be in touch soon!</h3>
        <p className="font-sans text-white/60 text-[0.9rem] leading-relaxed">
          Thanks for reaching out. Expect a response within 24 hours to answer your questions and get you set up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Your Name</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="Jane Smith"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Email Address</label>
        <input
          type="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="jane@realty.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Brokerage</label>
        <input
          type="text"
          name="brokerage"
          required
          value={formData.brokerage}
          onChange={handleChange}
          placeholder="Your brokerage name"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Plan Interest</label>
        <select
          name="plan"
          required
          value={formData.plan}
          onChange={handleChange}
          className={inputClass + " appearance-none cursor-pointer"}
        >
          <option value="" style={{ background: "#1C1C2E" }}>Select a plan...</option>
          <option style={{ background: "#1C1C2E" }}>Essential — $450/month</option>
          <option style={{ background: "#1C1C2E" }}>Growth — $600/month</option>
          <option style={{ background: "#1C1C2E" }}>Signature — $750/month</option>
          <option style={{ background: "#1C1C2E" }}>Listing Launch — $150 one-time</option>
          <option style={{ background: "#1C1C2E" }}>Not sure yet — just exploring</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Notes or Questions (optional)</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Tell us about your goals, current posting habits, or any questions you have..."
          rows={3}
          className={inputClass + " resize-none"}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coral text-white font-semibold text-[1rem] py-4 rounded-full border-none cursor-pointer hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,130,90,0.4)] transition-all duration-200 disabled:opacity-60 font-sans"
      >
        {loading ? "Sending..." : "Send My Inquiry →"}
      </button>
    </form>
  );
}
