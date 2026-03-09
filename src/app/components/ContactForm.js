"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M7 16l6 6 12-12"
              stroke="#E07060"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">
          Message Sent!
        </h3>
        <p className="text-charcoal/60 text-sm leading-relaxed">
          Thanks for reaching out. We&apos;ll be in touch within one business day.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-charcoal/15 bg-cream text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all text-sm font-sans";
  const labelClass =
    "block text-xs font-bold text-charcoal/55 uppercase tracking-wider mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Full Name *</label>
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
          <label className={labelClass}>Email Address *</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="jane@realestate.com"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(555) 000-0000"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>I&apos;m Interested In *</label>
        <select
          name="service"
          required
          value={formData.service}
          onChange={handleChange}
          className={inputClass + " appearance-none cursor-pointer"}
        >
          <option value="">Select a service...</option>
          <option value="social-media">Social Media Graphics</option>
          <option value="postcards">Postcards &amp; Mailers</option>
          <option value="print">Print Materials</option>
          <option value="full-package">Full Marketing Package</option>
          <option value="other">Other / Not Sure Yet</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Tell Us About Your Listing</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Share listing details, branding preferences, deadlines, or any questions..."
          rows={4}
          className={inputClass + " resize-none"}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coral text-white font-bold text-sm py-4 rounded-xl hover:bg-coral-dark transition-all duration-200 disabled:opacity-60 shadow-md hover:shadow-lg hover:-translate-y-0.5 font-sans"
      >
        {loading ? "Sending..." : "Send Message \u2192"}
      </button>

      <p className="text-xs text-charcoal/40 text-center font-sans">
        We typically respond within one business day.
      </p>
    </form>
  );
}
