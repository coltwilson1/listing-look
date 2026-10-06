"use client";

import { useEffect, useRef, useState } from "react";
import { LogoImage } from "@/app/components/Logo";
import Icon from "@/app/components/Icons";
import CustomOrderForm from "@/app/components/CustomOrderForm";
import "./scroll-home.css";

// ── Scroll helpers ────────────────────────────────────────────────────────────

// Writes --p (0 → 1) on the element as it scrolls through the viewport.
function useScene(onProgress) {
  const ref = useRef(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      el.style.setProperty("--p", p.toFixed(4));
      cb.current?.(p);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}

function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("ev-in");
          io.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`ev-rv ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

function CountUp({ to, duration = 1400 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          setVal(Math.round(to * (1 - Math.pow(1 - t, 4))));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to, duration]);
  return <span ref={ref}>{val}</span>;
}

const btnDark =
  "inline-block bg-ink text-white font-semibold px-8 py-4 rounded-full text-[0.8rem] uppercase tracking-[0.16em] no-underline hover:bg-brass transition-colors duration-300";
const btnLight =
  "inline-block bg-champagne text-ink font-semibold px-8 py-4 rounded-full text-[0.8rem] uppercase tracking-[0.16em] no-underline hover:bg-white transition-colors duration-300";

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-ink/75 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-[1100px] h-full mx-auto px-6 flex items-center justify-between">
        <a href="#top" aria-label="Elevate Marketing Co."><LogoImage tone="light" height={30} /></a>
        <div className="hidden md:flex items-center gap-9 text-[0.72rem] uppercase tracking-[0.18em] text-white/70">
          <a href="#work" className="no-underline hover:text-white transition-colors">The Work</a>
          <a href="#process" className="no-underline hover:text-white transition-colors">Process</a>
          <a href="#plans" className="no-underline hover:text-white transition-colors">Plans</a>
          <a href="#services" className="no-underline hover:text-white transition-colors">Coming Soon</a>
          <a href="#faq" className="no-underline hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-5">
          <a href="/portal" className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/75 no-underline hover:text-white transition-colors">
            Log In
          </a>
          <a href="#start" className="bg-champagne text-ink text-[0.68rem] font-semibold uppercase tracking-[0.16em] px-4 py-2 rounded-full no-underline hover:bg-white transition-colors">
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  const ref = useScene();
  return (
    <section id="top" ref={ref} className="relative z-10 h-[170vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center bg-ivory">
        <div className="ev-hero-glow absolute inset-0 pointer-events-none">
          <div
            className="ev-drift absolute rounded-full"
            style={{ width: "70vw", height: "70vw", left: "15vw", top: "10vh", background: "radial-gradient(circle, rgba(198,170,118,0.28) 0%, rgba(198,170,118,0) 62%)" }}
          />
        </div>

        <div className="ev-hero-copy relative text-center px-6">
          <div className="ev-rise text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-brass mb-8">
            Done‑for‑you marketing
          </div>
          <h1 className="ev-rise font-serif text-[clamp(3.4rem,11vw,9.5rem)] leading-[0.95] text-ink" style={{ animationDelay: "120ms" }}>
            Your marketing.
            <br />
            <em className="italic text-brass">Elevated.</em>
          </h1>
          <p className="ev-rise text-[clamp(1rem,1.5vw,1.3rem)] text-slate leading-[1.7] max-w-[620px] mx-auto mt-9" style={{ animationDelay: "260ms" }}>
            Custom branded graphics, captions, and consistent posting — every week, without you lifting a finger.
          </p>
          <div className="ev-rise flex gap-4 justify-center flex-wrap mt-10" style={{ animationDelay: "400ms" }}>
            <a href="#plans" className={btnDark}>See Plans</a>
            <a href="#work" className="inline-block text-ink font-semibold px-8 py-4 rounded-full text-[0.8rem] uppercase tracking-[0.16em] no-underline border border-ink/20 hover:border-ink transition-colors duration-300">
              See the Work
            </a>
          </div>
        </div>

        <div className="ev-hint-wrap absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="ev-hint text-[0.62rem] uppercase tracking-[0.3em] text-slate/70 flex flex-col items-center gap-2">
            Scroll
            <span className="w-px h-8 bg-slate/40" />
          </div>
        </div>

        {/* Navy iris that grows out of the centre and hands off to the phone scene */}
        <div className="ev-iris absolute inset-0 bg-ink flex items-center justify-center px-6" aria-hidden="true">
          <div className="ev-iris-copy text-center">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-champagne mb-5">The work</div>
            <div className="font-serif text-white text-[clamp(2.4rem,7vw,5.5rem)] leading-[1]">
              Content worth <em className="italic text-champagne">stopping for.</em>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Phone scene ───────────────────────────────────────────────────────────────

const SCREENS = [
  {
    img: "/samples/market-moment.webp",
    alt: "Sample post: The market moves. Your strategy should, too.",
    eyebrow: "Market expertise",
    title: "Market know‑how, made shareable.",
    body: "Timely, useful posts that position you as the expert your audience turns to.",
  },
  {
    img: "/samples/fall-curb-appeal.webp",
    alt: "Sample post: Fall curb appeal. Hold the pumpkin patch.",
    eyebrow: "Seasonal",
    title: "Right on time, every season.",
    body: "Holiday and seasonal content with real personality — never the same stock graphic everyone else posts.",
  },
  {
    img: "/samples/love-where-you-live.webp",
    alt: "Sample post: Chattanooga, Tennessee. Love where you live.",
    eyebrow: "Community",
    title: "Local, like you.",
    body: "Neighborhood spotlights and hometown pride your audience actually cares about.",
  },
  {
    img: "/samples/fifteen-minute-reset.webp",
    alt: "Sample post: The 15-minute reset. Your house doesn't clean itself.",
    eyebrow: "Everyday living",
    title: "Useful, with a wink.",
    body: "Everyday content with personality that keeps you top of mind all year.",
  },
];

function PhoneScene() {
  const [active, setActive] = useState(0);
  // The scene starts pinned underneath the hero (see -mt-[100vh]) so it is revealed
  // in place as the hero slides away; that first 100vh of its scroll is hidden.
  const visible = SCREENS.length * 100 + 60;
  const ref = useScene((p) => {
    const q = Math.max(0, (p * (visible + 100) - 100) / visible);
    setActive(Math.min(SCREENS.length - 1, Math.floor(q * SCREENS.length)));
  });

  return (
    <section ref={ref} className="relative bg-ink -mt-[100vh]" style={{ height: `${visible + 200}vh` }}>
      <span id="work" className="absolute left-0 top-[100vh]" />
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 px-6 pt-14">
        {/* Captions */}
        <div className="relative w-full md:w-[400px] h-[190px] md:h-[300px] order-2 md:order-1">
          {SCREENS.map((s, i) => (
            <div key={i} className={`ev-cap absolute inset-0 flex flex-col justify-center text-center md:text-left ${i === active ? "ev-on" : i < active ? "ev-past" : ""}`}>
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-champagne mb-4">{s.eyebrow}</div>
              <h2 className="font-serif text-white text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.05] mb-4">{s.title}</h2>
              <p className="text-white/60 text-[0.95rem] md:text-[1.02rem] leading-[1.7]">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Phone */}
        <div className="ev-phone relative order-1 md:order-2 flex-shrink-0" style={{ width: "min(290px, 58vw)", aspectRatio: "9 / 16.4" }}>
          <div className="absolute -inset-16 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(198,170,118,0.22) 0%, transparent 65%)" }} />
          <div className="relative h-full rounded-[2.6rem] bg-[#05090F] p-[9px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] ring-1 ring-white/15">
            <div className="relative h-full rounded-[2.1rem] overflow-hidden bg-white flex flex-col">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-[#05090F] z-10" />
              <div className="pt-10 px-3 pb-2 flex items-center gap-2 border-b border-border">
                <span className="w-6 h-6 rounded-full bg-ink flex items-center justify-center text-champagne font-serif text-[0.7rem]">E</span>
                <span className="text-[0.62rem] font-semibold text-ink">yourbrand</span>
              </div>
              <div className="relative w-full flex-shrink-0" style={{ aspectRatio: "1122 / 1402" }}>
                {SCREENS.map((sc, i) => (
                  <div key={i} className={`ev-screen absolute inset-0 ${i === active ? "ev-on" : ""}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sc.img} alt={sc.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="px-3 py-3 flex-1">
                <div className="flex gap-2 mb-1.5 text-ink text-[0.8rem] leading-none">♡ <span className="opacity-60">◯</span> <span className="opacity-60">➤</span></div>
                <div className="h-1.5 w-3/4 rounded-full bg-ink/10 mb-1" />
                <div className="h-1.5 w-1/2 rounded-full bg-ink/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="hidden md:flex order-3 flex-col gap-3">
          {SCREENS.map((_, i) => (
            <span key={i} className={`w-1 rounded-full transition-all duration-500 ${i === active ? "h-10 bg-champagne" : "h-4 bg-white/20"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Statement ─────────────────────────────────────────────────────────────────

const STATEMENT =
  "Your brand. Your voice. Your story. Consistently created. Beautifully delivered. Always visible.";

function Statement() {
  const ref = useScene();
  const words = STATEMENT.split(" ");
  return (
    <section ref={ref} className="relative h-[230vh] bg-ivory">
      <div className="sticky top-0 h-screen flex items-center justify-center px-6">
        <p className="font-serif text-ink text-[clamp(2rem,5vw,4.4rem)] leading-[1.14] max-w-[1050px] text-center" style={{ "--n": words.length }}>
          {words.map((w, i) => (
            <span key={i} className="ev-word" style={{ "--i": i }}>{w} </span>
          ))}
        </p>
      </div>
    </section>
  );
}

// ── Process (horizontal) ──────────────────────────────────────────────────────

const STEPS = [
  { icon: "clipboard", title: "Choose your plan", body: "Pick the pace that fits. Month‑to‑month, no contracts, cancel anytime." },
  { icon: "handshake", title: "One discovery call", body: "We learn your style, audience, and goals so every post sounds like you from day one." },
  { icon: "phone", title: "We post every week", body: "We design, write, and publish straight to your Facebook and Instagram." },
];

function Process() {
  const ref = useScene();
  return (
    <section id="process" ref={ref} className="relative h-[320vh] bg-light-gray">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="ev-track flex items-stretch gap-6 md:gap-10 w-max px-6 md:px-[8vw]">
          <div className="w-[78vw] md:w-[40vw] flex flex-col justify-center pr-6">
            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-brass mb-5">How it works</div>
            <h2 className="font-serif text-ink text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.98]">
              Up and running in <em className="italic text-brass">days,</em> not weeks.
            </h2>
          </div>
          {STEPS.map((s, i) => (
            <div key={i} className="w-[78vw] md:w-[36vw] min-h-[52vh] bg-white rounded-[1.75rem] p-9 md:p-12 flex flex-col justify-between shadow-[0_30px_60px_-30px_rgba(20,36,58,0.25)]">
              <div className="flex items-start justify-between">
                <span className="font-serif italic text-brass text-[clamp(4rem,8vw,7rem)] leading-none">0{i + 1}</span>
                <Icon name={s.icon} size={30} className="text-ink/40" />
              </div>
              <div>
                <h3 className="font-serif text-ink text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.05] mb-4">{s.title}</h3>
                <p className="text-slate text-[1rem] leading-[1.75] max-w-[420px]">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-10 left-6 right-6 md:left-[8vw] md:right-[8vw] h-px bg-ink/10">
          <div className="ev-bar h-full bg-brass" />
        </div>
      </div>
    </section>
  );
}

// ── Numbers ───────────────────────────────────────────────────────────────────

function Numbers() {
  const items = [
    { to: 22, prefix: "Up to ", label: "branded posts a month" },
    { to: 24, suffix: "h", label: "to hear back from us" },
    { to: 0, label: "long‑term contracts" },
  ];
  return (
    <section className="bg-ink py-32 px-6">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-14 text-center">
        {items.map((it, i) => (
          <Reveal key={i} delay={i * 140}>
            <div className="font-serif text-white text-[clamp(4.5rem,9vw,8rem)] leading-none">
              {it.prefix && <span className="text-[0.28em] text-champagne align-middle mr-2 uppercase tracking-[0.14em] font-sans">{it.prefix}</span>}
              <CountUp to={it.to} />
              {it.suffix}
            </div>
            <div className="text-champagne text-[0.75rem] uppercase tracking-[0.26em] mt-5">{it.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Plans ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: "Starter",
    price: 300,
    pace: "1–2 posts a week",
    blurb: "A simple, polished presence for agents just getting started.",
    items: ["Real estate tips & education", "Local & community content", "Holiday & seasonal posts", "Custom branded graphics", "Captions written for you"],
    note: "Listing posts not included",
  },
  {
    name: "Essential",
    price: 450,
    pace: "3 posts a week",
    blurb: "Stay consistent and visible, listings included.",
    items: ["Everything in Starter, plus:", "Listing, pending, sold & open house posts", "Monthly content planning", "1 round of revisions"],
  },
  {
    name: "Growth",
    price: 600,
    pace: "4 posts a week",
    blurb: "More content and strategy to actively grow your audience.",
    items: ["Everything in Essential, plus:", "Client testimonial graphics", "Market update graphics", "Monthly strategy check‑in call", "Priority turnaround"],
    featured: true,
  },
  {
    name: "Signature",
    price: 750,
    pace: "5 posts a week",
    blurb: "A fully custom content strategy built around your brand.",
    items: ["Everything in Growth, plus:", "Custom monthly content calendar", "Campaigns for listings & events", "Educational carousel posts", "Monthly performance review"],
  },
];

function Plans() {
  return (
    <section id="plans" className="bg-ivory py-32 px-6">
      <div className="max-w-[1280px] mx-auto">
        <Reveal className="text-center mb-20">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-brass mb-5">Social media plans · for real estate agents</div>
          <h2 className="font-serif text-ink text-[clamp(2.8rem,7vw,6rem)] leading-[0.98]">
            Pick your <em className="italic text-brass">pace.</em>
          </h2>
          <p className="text-slate text-[1.05rem] leading-[1.7] max-w-[520px] mx-auto mt-6">
            Month‑to‑month. No contracts. Everything custom to your brand — never recycled templates.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 110} className="h-full">
              <div className={`ev-plan h-full rounded-[1.75rem] p-8 flex flex-col ${p.featured ? "bg-ink text-white" : "bg-white text-ink border border-border"}`}>
                <div className="flex items-center justify-between mb-8 h-6">
                  <span className={`text-[0.7rem] font-semibold uppercase tracking-[0.26em] ${p.featured ? "text-champagne" : "text-brass"}`}>{p.name}</span>
                  {p.featured && <span className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] bg-champagne text-ink px-2.5 py-1 rounded-full">Most popular</span>}
                  {i === 0 && <span className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] border border-brass/40 text-brass px-2.5 py-1 rounded-full">New</span>}
                </div>
                <div className="font-serif text-[4.2rem] leading-none">
                  <span className="text-[0.4em] align-top mr-0.5">$</span>{p.price}
                  <span className={`font-sans text-[0.8rem] ml-1.5 ${p.featured ? "text-white/50" : "text-slate"}`}>/ month</span>
                </div>
                <div className={`font-serif italic text-[1.3rem] mt-3 ${p.featured ? "text-champagne" : "text-brass"}`}>{p.pace}</div>
                <p className={`text-[0.88rem] leading-[1.7] mt-4 pb-6 mb-6 border-b ${p.featured ? "text-white/65 border-white/15" : "text-slate border-border"}`}>{p.blurb}</p>
                <ul className="list-none p-0 space-y-3 mb-8 flex-1">
                  {p.items.map((it) => (
                    <li key={it} className={`flex gap-2.5 text-[0.86rem] leading-snug ${p.featured ? "text-white/80" : "text-slate"}`}>
                      <Icon name="check" size={14} strokeWidth={1.8} className={`mt-0.5 flex-shrink-0 ${p.featured ? "text-champagne" : "text-brass"}`} />
                      {it}
                    </li>
                  ))}
                  {p.note && <li className="text-[0.76rem] text-slate/70 italic pl-6">{p.note}</li>}
                </ul>
                <a href="#start" className={`${p.featured ? btnLight : btnDark} text-center`}>Get Started</a>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}

// ── Coming soon ───────────────────────────────────────────────────────────────

const COMING_SOON = [
  { icon: "pen", name: "Branding", body: "Logos, color palettes, and brand guides that make you unmistakable." },
  { icon: "image", name: "Websites", body: "Clean, modern websites designed to turn visitors into clients." },
  { icon: "home", name: "Listing Launch", body: "For real estate agents: a landing page, graphics for every stage, and ready‑to‑post captions for a single listing." },
];

function ComingSoon() {
  return (
    <section id="services" className="bg-light-gray py-32 px-6">
      <div className="max-w-[1280px] mx-auto">
        <Reveal className="text-center mb-16">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-brass mb-5">Coming soon</div>
          <h2 className="font-serif text-ink text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.98]">
            More ways to <em className="italic text-brass">elevate.</em>
          </h2>
          <p className="text-slate text-[1.05rem] leading-[1.7] max-w-[540px] mx-auto mt-6">
            We&apos;re growing beyond social media — for any business that wants to look its best.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COMING_SOON.map((c, i) => (
            <Reveal key={c.name} delay={i * 110} className="h-full">
              <div className="h-full bg-white rounded-[1.75rem] p-9 border border-border flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <Icon name={c.icon} size={28} className="text-brass" />
                  <span className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] border border-brass/40 text-brass px-2.5 py-1 rounded-full">Coming soon</span>
                </div>
                <h3 className="font-serif text-ink text-[2.2rem] leading-none mb-4">{c.name}</h3>
                <p className="text-slate text-[0.92rem] leading-[1.75]">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="text-center mt-12">
          <p className="text-slate text-[0.95rem]">
            …and more on the way. Have something in mind?{" "}
            <a href="#start" className="text-ink font-semibold underline underline-offset-4 decoration-brass hover:text-brass transition-colors">Tell us what you need</a>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "How does billing work?",
    a: "Plans are month-to-month with no auto-renewal. Payment is due by the 25th of each month for the following month's content. We'll send a reminder each month — no auto-charges, no surprises. All payments are via Venmo @Colt-Wilson.",
  },
  {
    q: "Will you post for me, or just send me the content?",
    a: "Both options are available. Most clients have us post directly to their Facebook and Instagram accounts. If you'd rather post yourself, we'll deliver everything ready to go — graphics and captions all set. Just let us know your preference during onboarding.",
  },
  {
    q: "What do I need to provide to get started?",
    a: "Just your logo, a headshot, your brand colors, and your brokerage name. After you sign up, we schedule a one-time discovery consultation call to understand your style, audience, and posting preferences — then we take it from there.",
  },
  {
    q: "Do the graphics include my brokerage name and compliance disclosures?",
    a: "Absolutely. All graphics include your brokerage name and any required compliance text you provide — so every post is brand-compliant and ready to share.",
  },
  {
    q: "Can I cancel my plan anytime?",
    a: "Yes. Since plans are month-to-month with no auto-renewal, you simply don't pay for the next month and your service ends at the close of the current billing period. No cancellation fees, no hassle.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="bg-ivory py-32 px-6">
      <div className="max-w-[900px] mx-auto">
        <Reveal className="text-center mb-14">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-brass mb-5">FAQ</div>
          <h2 className="font-serif text-ink text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.98]">
            Good <em className="italic text-brass">questions.</em>
          </h2>
        </Reveal>
        <Reveal>
          <div className="border-t border-border">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details key={q} className="group border-b border-border">
                <summary className="flex items-center justify-between gap-6 py-6 cursor-pointer list-none font-serif text-[1.4rem] text-ink select-none hover:text-brass transition-colors">
                  {q}
                  <span className="flex-shrink-0 font-sans font-light text-brass text-[1.6rem] leading-none transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <div className="pb-7 pr-10 text-[0.95rem] text-slate leading-[1.8]">{a}</div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ── CTA + Footer ──────────────────────────────────────────────────────────────

function Start() {
  return (
    <section id="start" className="bg-ink py-32 px-6">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <Reveal>
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-champagne mb-5">Get started</div>
          <h2 className="font-serif text-white text-[clamp(3rem,7vw,6rem)] leading-[0.96]">
            Ready to <em className="italic text-champagne">elevate?</em>
          </h2>
          <p className="text-white/60 text-[1.05rem] leading-[1.75] mt-7 max-w-[440px]">
            Tell us a little about you. We&apos;ll reach out within 24 hours to answer questions and schedule your discovery call.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <div className="bg-white/[0.04] border border-white/10 rounded-[1.75rem] p-8 md:p-10">
            <CustomOrderForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink border-t border-white/10 py-12 px-6">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <LogoImage tone="light" height={48} />
        <div className="flex gap-8 text-[0.72rem] uppercase tracking-[0.18em] text-white/55">
          <a href="/portal" className="no-underline hover:text-white transition-colors">Agent Portal</a>
          <a href="#plans" className="no-underline hover:text-white transition-colors">Plans</a>
        </div>
        <div className="text-[0.68rem] uppercase tracking-[0.16em] text-white/35">&copy; {new Date().getFullYear()} Elevate Marketing Co.</div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ScrollHome() {
  return (
    <main className="ev-page">
      <Nav />
      <Hero />
      <PhoneScene />
      <Statement />
      <Process />
      <Numbers />
      <Plans />
      <ComingSoon />
      <FAQ />
      <Start />
      <Footer />
    </main>
  );
}
