import { sanityFetch } from "@/sanity/lib/live";
import SiteHeader from "./components/SiteHeader";
import CustomOrderForm from "./components/CustomOrderForm";
import ServicesWithModals from "./components/ServicesWithModals";
import Logo from "./components/Logo";
import Icon from "./components/Icons";

const HOME_QUERY = `*[_type == "homePage" && _id == "homePage"][0]`;

const DEFAULTS = {
  hero: {
    badge: "Social Media Management for Real Estate Agents",
    headlineStart: "Your Social Media,",
    headlineEmphasis: "Done for You",
    subheadline:
      "Custom branded graphics, captions, and consistent posting on Facebook & Instagram — every week, without you lifting a finger. Stay visible, build your brand, and never miss a listing moment.",
    primaryButtonText: "See Plans",
    secondaryButtonText: "Get Started",
  },
  stats: [
    { num: "3–5×", label: "Posts per week, every week" },
    { num: "1", label: "Discovery call before your first post" },
    { num: "0", label: "Long-term contracts required" },
  ],
  howItWorks: {
    tag: "How It Works",
    title: "Up and running in days, not weeks.",
    subtitle:
      "No guesswork, no back-and-forth. We start with a real conversation about your brand so every post feels like you.",
    steps: [
      {
        title: "Choose Your Plan",
        description:
          "Pick Essential, Growth, or Signature based on how many posts you want each week. Month-to-month — no contracts, cancel anytime.",
      },
      {
        title: "Discovery Consultation",
        description:
          "We hop on a one-time call to learn your style, branding, target audience, and goals — so the content is truly yours from day one.",
      },
      {
        title: "We Post Every Week",
        description:
          "We design and publish your posts directly to Facebook & Instagram on your behalf — using KW Command or your Facebook login.",
      },
    ],
  },
  services: {
    tag: "What We Offer",
    title: "Monthly plans built for agents who want to grow.",
    subtitle:
      "Three subscription tiers — plus a standalone listing package for when you need it. All content is fully custom to your brand, not recycled templates.",
    items: [
      {
        icon: "✦",
        title: "Essential",
        description: "Stay consistent and visible with 3 branded posts every week.",
        listItems: [
          "3 posts per week (12–14/month)",
          "Custom branded graphics",
          "Caption writing",
          "Facebook & Instagram posting",
          "Listing, pending, sold & open house posts",
          "Real estate tips & educational content",
          "Local & community-focused content",
          "Holiday & seasonal content",
          "Monthly content planning",
          "1 round of revisions included",
        ],
        price: "$450 / month",
        buttonText: "Get Started",
      },
      {
        icon: "✦✦",
        title: "Growth",
        description: "More content, more personalization, and strategic support to actively grow your audience.",
        listItems: [
          "4 posts per week (16–18/month)",
          "Everything in Essential, plus:",
          "More personalized agent-focused content",
          "Client testimonial graphics",
          "Market update graphics",
          "Buyer & seller educational content",
          "Community & local business spotlights",
          "Content tailored to your business goals",
          "Monthly strategy check-in call",
          "Priority turnaround for listings & closings",
        ],
        price: "$600 / month",
        buttonText: "Get Started",
        badge: "Most Popular",
      },
      {
        icon: "✦✦✦",
        title: "Signature",
        description: "The full-service experience — a completely custom content strategy built around your brand.",
        listItems: [
          "5 posts per week (20–22/month)",
          "Everything in Growth, plus:",
          "Fully customized monthly content calendar",
          "Increased personal branding content",
          "Custom campaigns for listings & events",
          "Monthly market-focused content series",
          "In-depth educational carousel posts",
          "Content ideas tailored to your audience",
          "Monthly performance review",
          "Ongoing social media strategy",
          "Priority design & scheduling",
        ],
        price: "$750 / month",
        buttonText: "Get Started",
      },
    ],
  },
  customOrder: {
    tag: "Get Started",
    title: "Ready to stay top of mind?",
    subtitle:
      "Fill out the short form and we'll reach out within 24 hours to answer questions and get your account set up.",
    steps: [
      { icon: "clipboard", title: "Fill Out the Form", description: "Tell us which plan interests you and a bit about your goals." },
      { icon: "chat", title: "We'll Reach Out", description: "Expect a reply within 24 hours to confirm your plan and schedule your discovery call." },
      { icon: "handshake", title: "Discovery Consultation", description: "A one-time call to learn your brand, style, target audience, and posting preferences — so everything feels like you." },
      { icon: "phone", title: "We Post Every Week", description: "Custom-branded content goes live on your Facebook & Instagram — designed and posted entirely by us." },
    ],
  },
  account: {
    tag: "Agent Portal",
    title: "Track everything in one place.",
    subtitle:
      "Your own dashboard to monitor orders, message your designer, and keep your brand assets on file.",
    cards: [
      {
        icon: "package",
        title: "Order Tracking",
        description: "Real-time status on every active and completed order, plus downloadable final files.",
      },
      {
        icon: "image",
        title: "Brand Asset Vault",
        description: "Upload your headshot, logo, and colors once — we pull them automatically for every future order.",
      },
      {
        icon: "chat",
        title: "Direct Designer Chat",
        description: "Request changes, approve proofs, or ask questions without hunting through email threads.",
      },
    ],
  },
  payment: {
    heading: "Simple, flexible billing",
    body: "Payment is due by the 25th of each month for the following month's content. No auto-charges — we send a reminder each month. All payments via Venmo.",
  },
  footer: {
    tagline:
      "Social media management for real estate agents who want to stay visible and grow their brand — without creating content themselves.",
    servicesLinks: ["Essential Plan", "Growth Plan", "Signature Plan", "Listing Launch"],
    accountLinks: ["Agent Portal", "Log In", "How It Works"],
  },
};

function mergeContent(_data) {
  return DEFAULTS;
}

// ── Shared ────────────────────────────────────────────────────────────────────

function Eyebrow({ children, light = false }) {
  return (
    <div className={`flex items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.28em] mb-4 ${light ? "text-champagne" : "text-brass"}`}>
      <span className={`w-8 h-px ${light ? "bg-champagne/60" : "bg-brass/60"}`} />
      {children}
    </div>
  );
}

const primaryBtn =
  "inline-block font-sans bg-ink text-white font-semibold px-9 py-4 rounded-[3px] text-[0.78rem] uppercase tracking-[0.18em] no-underline hover:bg-brass transition-colors duration-300";
const secondaryBtn =
  "inline-block font-sans text-ink font-semibold px-9 py-4 rounded-[3px] text-[0.78rem] uppercase tracking-[0.18em] no-underline border border-ink/25 hover:border-ink transition-colors duration-300";

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero({ content: c, stats }) {
  return (
    <section className="relative overflow-hidden pt-[150px] pb-20 px-6 md:px-10">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 85% 20%, rgba(196,164,107,0.14) 0%, transparent 55%)" }}
      />

      <div className="max-w-[1180px] mx-auto relative grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-16 items-center">
        <div>
          <Eyebrow>{c.badge}</Eyebrow>

          <h1 className="font-serif text-[clamp(3rem,6.2vw,5.4rem)] leading-[1.02] text-ink mb-7">
            {c.headlineStart}
            <br />
            <em className="italic text-brass">{c.headlineEmphasis}</em>
          </h1>

          <p className="font-sans text-[1.06rem] leading-[1.8] text-slate mb-10 max-w-[540px]">
            {c.subheadline}
          </p>

          <div className="flex gap-4 flex-wrap">
            <a href="#services" className={primaryBtn}>{c.primaryButtonText}</a>
            <a href="#custom" className={secondaryBtn}>{c.secondaryButtonText}</a>
          </div>
        </div>

        {/* Editorial preview card */}
        <div className="relative hidden lg:block h-[520px]">
          <div className="absolute top-0 right-0 w-[78%] h-[88%] bg-light-gray border border-border rounded-[4px]" />
          <div className="absolute bottom-0 left-0 w-[78%] h-[88%] bg-ink rounded-[4px] shadow-[0_30px_60px_rgba(15,26,43,0.25)] p-3">
            <div className="h-full border border-champagne/35 rounded-[2px] flex flex-col justify-between p-9">
              <div className="flex items-center justify-between text-champagne/80 text-[0.62rem] uppercase tracking-[0.32em]">
                <span>Just Listed</span>
                <span>No. 014</span>
              </div>
              <div>
                <div className="font-serif italic text-champagne text-[1.1rem] mb-2">Introducing</div>
                <div className="font-serif text-white text-[2.6rem] leading-[1.05] mb-5">
                  1420 Riverview
                  <br />
                  Terrace
                </div>
                <div className="w-10 h-px bg-champagne/60 mb-5" />
                <div className="font-sans text-white/60 text-[0.72rem] uppercase tracking-[0.24em]">
                  4 Bed · 3.5 Bath · 3,210 Sq Ft
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-sans text-white/40 text-[0.62rem] uppercase tracking-[0.3em]">Your Brand Here</span>
                <Icon name="home" size={18} className="text-champagne/70" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-[1180px] mx-auto relative mt-20 grid grid-cols-1 sm:grid-cols-3 border-t border-border">
        {stats.map(({ num, label }, i) => (
          <div key={i} className={`pt-8 pb-2 sm:px-8 ${i > 0 ? "sm:border-l border-border" : "sm:pl-0"}`}>
            <div className="font-serif text-[2.6rem] leading-none text-ink mb-2">{num}</div>
            <div className="font-sans text-[0.78rem] uppercase tracking-[0.16em] text-slate">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks({ content: c }) {
  return (
    <section id="how-it-works" className="py-28 px-6 md:px-10 bg-ink">
      <div className="max-w-[1180px] mx-auto">
        <Eyebrow light>{c.tag}</Eyebrow>
        <h2 className="font-serif text-[clamp(2.3rem,4.4vw,3.5rem)] leading-[1.1] text-white mb-5 max-w-[640px]">{c.title}</h2>
        <p className="font-sans text-[1.02rem] text-white/60 leading-[1.8] max-w-[520px] mb-16">{c.subtitle}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-white/15">
          {c.steps.map(({ title, description }, i) => (
            <div key={i} className={`group pt-10 pb-4 md:px-10 ${i > 0 ? "md:border-l border-white/15" : "md:pl-0"}`}>
              <div className="font-serif italic text-[3.2rem] leading-none text-champagne/80 mb-6 transition-colors duration-300 group-hover:text-champagne">
                0{i + 1}
              </div>
              <h3 className="font-sans text-[0.85rem] font-semibold uppercase tracking-[0.16em] text-white mb-3">{title}</h3>
              <p className="font-sans text-[0.9rem] text-white/55 leading-[1.75]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Get Started Section ───────────────────────────────────────────────────────

function CustomSection({ content: c }) {
  return (
    <section id="custom" className="bg-ink py-28 px-6 md:px-10 border-t border-white/10">
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <Eyebrow light>{c.tag}</Eyebrow>
          <h2 className="font-serif text-[clamp(2.3rem,4.4vw,3.5rem)] leading-[1.1] text-white mb-5">{c.title}</h2>
          <p className="font-sans text-[1.02rem] text-white/60 leading-[1.8] mb-12">{c.subtitle}</p>
          <ul className="space-y-7 list-none p-0">
            {c.steps.map(({ icon, title, description }, i) => (
              <li key={i} className="flex gap-5 items-start">
                <div className="w-11 h-11 rounded-full border border-champagne/40 text-champagne flex items-center justify-center flex-shrink-0">
                  <Icon name={icon} size={19} />
                </div>
                <div>
                  <h4 className="font-sans text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-white mb-1.5">{title}</h4>
                  <p className="font-sans text-[0.88rem] text-white/55 leading-[1.7]">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/[0.04] border border-white/12 rounded-[4px] p-10">
          <CustomOrderForm />
        </div>
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
    q: "Can I buy Listing Launch without a monthly plan?",
    a: "Yes — Listing Launch is completely standalone. No subscription required. Just fill out the form, select Listing Launch, and we'll handle the rest. $99 flat per listing.",
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
    <section id="faq" className="py-28 px-6 md:px-10 bg-ivory">
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-14">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="font-serif text-[clamp(2.3rem,4.4vw,3.5rem)] leading-[1.1] text-ink mb-5">Common questions.</h2>
          <p className="font-sans text-[1.02rem] text-slate leading-[1.8]">Everything you need to know before getting started.</p>
        </div>
        <div className="border-t border-border">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details key={q} className="group border-b border-border">
              <summary className="flex items-center justify-between gap-6 py-6 cursor-pointer list-none font-serif text-[1.35rem] text-ink select-none hover:text-brass transition-colors">
                {q}
                <span className="flex-shrink-0 font-sans font-light text-brass text-[1.5rem] leading-none transition-transform duration-300 group-open:rotate-45">+</span>
              </summary>
              <div className="pb-7 pr-10 font-sans text-[0.93rem] text-slate leading-[1.8]">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Account Section ───────────────────────────────────────────────────────────

function AccountSection({ content: c }) {
  return (
    <section id="account" className="py-28 px-6 md:px-10 bg-light-gray">
      <div className="max-w-[1180px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-14">
          <div>
            <Eyebrow>{c.tag}</Eyebrow>
            <h2 className="font-serif text-[clamp(2.3rem,4.4vw,3.5rem)] leading-[1.1] text-ink mb-5">{c.title}</h2>
            <p className="font-sans text-[1.02rem] text-slate leading-[1.8] max-w-[520px]">{c.subtitle}</p>
          </div>
          <a href="/portal" className={`${primaryBtn} self-start md:self-auto flex-shrink-0`}>
            Log In to Your Portal
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {c.cards.map(({ icon, title, description }, i) => (
            <div key={i} className="bg-white rounded-[4px] p-9 border border-border hover:border-brass/50 hover:shadow-[0_18px_40px_rgba(15,26,43,0.08)] transition-all duration-300">
              <Icon name={icon} size={26} className="text-brass mb-6" />
              <h3 className="font-serif text-[1.45rem] text-ink mb-2">{title}</h3>
              <p className="font-sans text-[0.88rem] text-slate leading-[1.75]">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Payment Strip ─────────────────────────────────────────────────────────────

function PaymentStrip({ content: c }) {
  return (
    <div className="bg-ivory border-t border-border py-14 px-6 md:px-10">
      <div className="max-w-[1180px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-[620px]">
          <h3 className="font-serif text-[1.9rem] text-ink mb-2">{c.heading}</h3>
          <p className="font-sans text-[0.92rem] text-slate leading-relaxed">{c.body}</p>
        </div>
        <span className="inline-flex items-center gap-2.5 bg-[#008CFF] text-white font-semibold text-[0.88rem] px-6 py-3 rounded-[3px] self-start md:self-auto flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M19.5 2C20.9 2 22 3.1 22 4.5c0 .9-.5 2.2-1.3 3.5L14 20.5H8.3L5 2H10l1.8 10.7L16.5 2H19.5z" />
          </svg>
          @Colt-Wilson on Venmo
        </span>
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

const SERVICES_HREFS = ["#services", "#services", "#services", "#services"];
const ACCOUNT_HREFS  = ["/portal", "#", "#how-it-works"];

function Footer({ content: c }) {
  return (
    <footer className="bg-ink pt-20 pb-10 px-6 md:px-10">
      <div className="max-w-[1180px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 pb-12 border-b border-white/10">
          <div>
            <Logo tone="light" href="#" height={64} />
            <p className="font-sans text-[0.88rem] text-white/50 leading-[1.8] mt-6 max-w-[320px]">{c.tagline}</p>
          </div>
          <div>
            <h4 className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-champagne mb-5">Plans</h4>
            <ul className="list-none p-0 space-y-3">
              {c.servicesLinks.map((label, i) => (
                <li key={i}>
                  <a href={SERVICES_HREFS[i] ?? "#services"} className="font-sans text-[0.9rem] text-white/65 no-underline hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-champagne mb-5">Account</h4>
            <ul className="list-none p-0 space-y-3">
              {c.accountLinks.map((label, i) => (
                <li key={i}>
                  <a href={ACCOUNT_HREFS[i] ?? "#"} className="font-sans text-[0.9rem] text-white/65 no-underline hover:text-white transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between mt-8 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-white/35 gap-2">
          <span>&copy; {new Date().getFullYear()} Elevate Marketing Co. All rights reserved.</span>
          <span>Built for real estate agents who mean business.</span>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { data } = await sanityFetch({ query: HOME_QUERY });
  const cms = mergeContent(data);

  return (
    <main>
      <SiteHeader />
      <Hero content={cms.hero} stats={cms.stats} />
      <HowItWorks content={cms.howItWorks} />
      <ServicesWithModals content={cms.services} />
      <CustomSection content={cms.customOrder} />
      <FAQ />
      <AccountSection content={cms.account} />
      <PaymentStrip content={cms.payment} />
      <Footer content={cms.footer} />
    </main>
  );
}
