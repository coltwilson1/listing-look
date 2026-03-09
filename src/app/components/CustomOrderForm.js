"use client";

import { useState } from "react";

export default function CustomOrderForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    listing: "",
    style: "",
    deadline: "",
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
        <div className="text-5xl mb-4">🚀</div>
        <h3 className="font-serif text-2xl text-white mb-2">
          Request Submitted!
        </h3>
        <p className="font-sans text-white/60 text-sm leading-relaxed">
          We&apos;ll get back to you within 24 hours with a quote and next
          steps.
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

      <div className="grid grid-cols-2 gap-4">
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
          <label className={labelClass}>Phone (optional)</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 000-0000"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>What do you need?</label>
        <select
          name="category"
          required
          value={formData.category}
          onChange={handleChange}
          className={inputClass + " appearance-none cursor-pointer"}
        >
          <option value="" style={{ background: "#1C1C2E" }}>
            Select a category...
          </option>
          <option style={{ background: "#1C1C2E" }}>
            Social Media Graphics — Open House
          </option>
          <option style={{ background: "#1C1C2E" }}>
            Social Media Graphics — New Listing
          </option>
          <option style={{ background: "#1C1C2E" }}>
            Social Media Graphics — Just Sold
          </option>
          <option style={{ background: "#1C1C2E" }}>
            Postcards &amp; Print Materials
          </option>
          <option style={{ background: "#1C1C2E" }}>Custom / Other</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Property / Listing Details</label>
        <textarea
          name="listing"
          value={formData.listing}
          onChange={handleChange}
          placeholder="Address, price, bedrooms, baths, any key features..."
          rows={3}
          className={inputClass + " resize-none"}
        />
      </div>

      <div>
        <label className={labelClass}>Style Notes or Special Requests</label>
        <textarea
          name="style"
          value={formData.style}
          onChange={handleChange}
          placeholder="Colors, fonts, brand guidelines, vibe you're going for..."
          rows={2}
          className={inputClass + " resize-none"}
        />
      </div>

      <div>
        <label className={labelClass}>Deadline</label>
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coral text-white font-semibold text-[1rem] py-4 rounded-full border-none cursor-pointer hover:bg-coral-dark hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,130,90,0.4)] transition-all duration-200 disabled:opacity-60 font-sans"
      >
        {loading ? "Submitting..." : "🚀 Submit My Request"}
      </button>
    </form>
  );
}
