"use client";

import { useEffect, useRef, useState } from "react";
import { LogoImage } from "@/app/components/Logo";
import Icon from "@/app/components/Icons";
import { STEPS } from "./questions";
import "@/app/components/scroll-home.css";

const DRAFT_KEY = "ev_brand_discovery_draft";

// Same button styles as the homepage (ScrollHome.js).
const btnDark =
  "inline-block bg-ink text-white font-semibold px-8 py-4 rounded-full text-[0.8rem] uppercase tracking-[0.16em] no-underline hover:bg-brass transition-colors duration-300 border-none cursor-pointer disabled:opacity-60";
const btnGhost =
  "inline-block text-ink font-semibold px-8 py-4 rounded-full text-[0.8rem] uppercase tracking-[0.16em] no-underline border border-ink/20 hover:border-ink transition-colors duration-300 bg-transparent cursor-pointer";

// Light-background version of the homepage waitlist form fields (CustomOrderForm.js).
const inputClass =
  "w-full bg-ivory border border-border rounded-[3px] px-4 py-3 text-ink text-[0.95rem] placeholder:text-slate/45 focus:outline-none focus:border-brass transition-colors font-sans";
const labelClass = "block text-[0.82rem] font-semibold text-slate uppercase tracking-[0.08em] mb-1.5";

function isFilled(v) {
  return Array.isArray(v) ? v.length > 0 : Boolean(String(v ?? "").trim());
}

function Field({ field, value, onChange }) {
  const { name, label, hint, type, placeholder, required, options, max } = field;

  const heading = (
    <label htmlFor={type === "chips" || type === "choice" ? undefined : name} className={labelClass}>
      {label}
      {required && <span className="text-brass"> *</span>}
      {hint && <span className="block normal-case tracking-normal font-normal text-slate/70 text-[0.82rem] mt-1">{hint}</span>}
    </label>
  );

  if (type === "chips") {
    const selected = value || [];
    const toggle = (opt) => {
      const on = selected.includes(opt);
      if (!on && max && selected.length >= max) return;
      onChange(on ? selected.filter((x) => x !== opt) : [...selected, opt]);
    };
    return (
      <div>
        {heading}
        <div className="flex flex-wrap gap-2.5 mt-3">
          {options.map((opt) => {
            const on = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(opt)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.85rem] font-sans border cursor-pointer transition-all duration-300 ev-ease ${
                  on ? "bg-ink text-white border-ink" : "bg-white text-ink border-border hover:border-ink/40 hover:-translate-y-0.5"
                }`}
              >
                {on && <Icon name="check" size={13} strokeWidth={2} className="text-champagne" />}
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === "choice") {
    return (
      <div>
        {heading}
        <div className={`grid gap-3 mt-3 ${options.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
          {options.map((opt) => {
            const on = value === opt;
            return (
              <button
                key={opt}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(on ? "" : opt)}
                className={`ev-plan flex items-center justify-between gap-3 text-left rounded-[1.25rem] px-5 py-4 text-[0.92rem] font-sans border cursor-pointer ${
                  on ? "bg-ink text-white border-ink" : "bg-white text-ink border-border hover:border-ink/30"
                }`}
              >
                {opt}
                <span className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${on ? "border-champagne bg-champagne text-ink" : "border-ink/25"}`}>
                  {on && <Icon name="check" size={12} strokeWidth={2.2} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const common = {
    id: name,
    name,
    value: value || "",
    placeholder,
    required,
    onChange: (e) => onChange(e.target.value),
    className: inputClass,
  };
  return (
    <div>
      {heading}
      {type === "textarea" ? <textarea rows={4} {...common} className={inputClass + " resize-none"} /> : <input type={type} {...common} />}
    </div>
  );
}

export default function BrandDiscoveryForm({ inviteKey }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [company, setCompany] = useState(""); // honeypot
  const topRef = useRef(null);
  const loaded = useRef(false);

  // Restore a saved draft so agents can come back and finish later.
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (d?.answers) { setAnswers(d.answers); setStep(Math.min(d.step || 0, STEPS.length - 1)); }
    } catch {}
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current || submitted) return;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ answers, step })); } catch {}
  }, [answers, step, submitted]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const set = (name) => (v) => setAnswers((a) => ({ ...a, [name]: v }));

  const goTo = (i) => {
    setError("");
    setStep(i);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function handleNext(e) {
    e.preventDefault();
    const missing = current.fields.filter((f) => f.required && !isFilled(answers[f.name]));
    if (missing.length) {
      setError(`Please complete: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    if (!isLast) return goTo(step + 1);

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/brand-discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: inviteKey, answers, company }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setSubmitted(true);
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ev-page min-h-screen flex flex-col">
      <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-ink/75 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-[1100px] h-full mx-auto px-6 flex items-center justify-between">
          <LogoImage tone="light" height={30} />
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/70">Brand Discovery</span>
        </div>
      </nav>

      <section className="flex-1 pt-32 pb-24 px-6" ref={topRef} style={{ scrollMarginTop: "3.5rem" }}>
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-14">
            <div className="ev-rise text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-brass mb-5">Brand discovery questionnaire</div>
            <h1 className="ev-rise font-serif text-ink text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.98]" style={{ animationDelay: "120ms" }}>
              Let&apos;s define <em className="italic text-brass">your brand.</em>
            </h1>
            <p className="ev-rise text-slate text-[1.05rem] leading-[1.7] max-w-[560px] mx-auto mt-6" style={{ animationDelay: "260ms" }}>
              A few questions so every graphic, caption, and post sounds like you. It takes about 10 minutes, and your progress saves as you go.
            </p>
          </div>

          <div className="ev-rise bg-white border border-border rounded-[1.75rem] p-6 sm:p-8 md:p-12" style={{ animationDelay: "400ms" }}>
            {submitted ? (
              <div className="text-center py-10 step-animate">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full border border-brass/50 flex items-center justify-center text-brass">
                  <Icon name="check" size={22} strokeWidth={1.8} />
                </div>
                <h2 className="font-serif text-ink text-[2.4rem] leading-tight mb-3">
                  Thank you, <em className="italic text-brass">{(answers.name || "").split(" ")[0] || "friend"}.</em>
                </h2>
                <p className="text-slate text-[0.98rem] leading-[1.7] max-w-[440px] mx-auto">
                  We&apos;ve received your answers and will review them before your discovery call. We&apos;ll be in touch soon.
                </p>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div className="mb-10">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-brass">
                      Step {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                    </span>
                    <span className="hidden sm:flex gap-5">
                      {STEPS.map((s, i) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => i < step && goTo(i)}
                          disabled={i >= step}
                          className={`text-[0.66rem] uppercase tracking-[0.16em] border-none bg-transparent p-0 transition-colors ${
                            i === step ? "text-ink font-semibold" : i < step ? "text-slate hover:text-brass cursor-pointer" : "text-slate/40 cursor-default"
                          }`}
                        >
                          {s.title}
                        </button>
                      ))}
                    </span>
                  </div>
                  <div className="h-px bg-ink/10 overflow-hidden">
                    <div
                      className="h-full bg-brass origin-left transition-transform duration-700 ev-ease"
                      style={{ transform: `scaleX(${(step + 1) / STEPS.length})` }}
                    />
                  </div>
                </div>

                <form onSubmit={handleNext} noValidate key={current.id} className="step-animate">
                  <h2 className="font-serif text-ink text-[clamp(2rem,4vw,2.8rem)] leading-[1.05]">{current.title}</h2>
                  <p className="text-slate text-[0.95rem] leading-[1.7] mt-2 mb-9">{current.intro}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-8">
                    {current.fields.map((f) => (
                      <div key={f.name} className={f.full || f.type === "chips" || f.type === "textarea" ? "sm:col-span-2" : ""}>
                        <Field field={f} value={answers[f.name]} onChange={set(f.name)} />
                      </div>
                    ))}
                  </div>

                  {/* Honeypot — hidden from people, catches bots */}
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="absolute -left-[9999px] w-px h-px opacity-0"
                    aria-hidden="true"
                  />

                  {error && (
                    <p className="mt-8 text-[0.88rem] text-red-700 font-sans" role="alert">{error}</p>
                  )}

                  <div className="mt-10 pt-8 border-t border-border flex flex-col-reverse sm:flex-row gap-3 sm:items-center sm:justify-between">
                    {step > 0 ? (
                      <button type="button" onClick={() => goTo(step - 1)} className={`${btnGhost} text-center`}>
                        ← Back
                      </button>
                    ) : <span />}
                    <button type="submit" disabled={loading} className={`${btnDark} text-center`}>
                      {loading ? "Sending..." : isLast ? "Submit Questionnaire →" : "Continue →"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-ink border-t border-white/10 py-12 px-6">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <LogoImage tone="light" height={48} />
          <div className="text-[0.68rem] uppercase tracking-[0.16em] text-white/35">&copy; {new Date().getFullYear()} Elevate Marketing Co.</div>
        </div>
      </footer>
    </main>
  );
}
