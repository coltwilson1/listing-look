import { sanityFetch } from "@/sanity/lib/live";
import SiteHeader from "./components/SiteHeader";
import CustomOrderForm from "./components/CustomOrderForm";
import ServicesWithModals from "./components/ServicesWithModals";

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
      { icon: "📋", title: "Fill Out the Form", description: "Tell us which plan interests you and a bit about your goals." },
      { icon: "💬", title: "We'll Reach Out", description: "Expect a reply within 24 hours to confirm your plan and schedule your discovery call." },
      { icon: "🤝", title: "Discovery Consultation", description: "A one-time call to learn your brand, style, target audience, and posting preferences — so everything feels like you." },
      { icon: "📱", title: "We Post Every Week", description: "Custom-branded content goes live on your Facebook & Instagram — designed and posted entirely by us." },
    ],
  },
  account: {
    tag: "Agent Portal",
    title: "Track everything in one place.",
    subtitle:
      "Your own dashboard to monitor orders, message your designer, and keep your brand assets on file.",
    cards: [
      {
        icon: "📦",
        title: "Order Tracking",
        description: "Real-time status on every active and completed order, plus downloadable final files.",
      },
      {
        icon: "🖼️",
        title: "Brand Asset Vault",
        description: "Upload your headshot, logo, and colors once — we pull them automatically for every future order.",
      },
      {
        icon: "💬",
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

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero({ content: c }) {
  return (
    <section className="min-h-screen flex items-center pt-[100px] pb-16 px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 70% 30%, rgba(242,196,176,0.38) 0%, transparent 60%),
            radial-gradient(ellipse at 10% 80%, rgba(212,168,83,0.15) 0%, transparent 50%)
          `,
        }}
      />
      <div className="absolute rounded-full bg-coral opacity-[0.07] animate-float pointer-events-none"
        style={{ width: 560, height: 560, top: -120, right: -120 }} />
      <div className="absolute rounded-full bg-gold opacity-[0.07] animate-float-reverse pointer-events-none"
        style={{ width: 320, height: 320, bottom: 40, left: -90 }} />

      <div className="max-w-[680px] mx-auto w-full relative z-10">
        <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-1.5 text-[0.8rem] font-medium text-slate mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse-dot inline-block" />
          {c.badge}
        </div>

        <h1 className="font-serif text-[clamp(2.6rem,5.5vw,4.2rem)] leading-[1.12] text-deep mb-6">
          {c.headlineStart}{" "}
          <em className="italic text-coral">{c.headlineEmphasis}</em>
        </h1>

        <p className="font-sans text-[1.1rem] leading-[1.75] text-slate mb-10 max-w-[580px]">
          {c.subheadline}
        </p>

        <div className="flex gap-4 flex-wrap">
          <a
            href="#services"
            className="font-sans bg-deep text-white font-semibold px-8 py-3.5 rounded-full text-[0.95rem] no-underline hover:bg-coral hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,130,90,0.35)] transition-all duration-200"
          >
            {c.primaryButtonText}
          </a>
          <a
            href="#custom"
            className="font-sans text-deep font-medium px-8 py-3.5 rounded-full text-[0.95rem] no-underline border border-border hover:border-coral hover:text-coral transition-all duration-200"
          >
            {c.secondaryButtonText}
          </a>
        </div>
      </div>
    </section>
  );
}


// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks({ content: c }) {
  return (
    <section id="how-it-works" className="py-24 px-8 bg-deep">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-blush mb-3">{c.tag}</div>
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-white mb-4">{c.title}</h2>
        <p className="font-sans text-[1.05rem] text-white/60 leading-[1.7] max-w-[520px] mb-14">{c.subtitle}</p>

        <div className="relative">
          <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px bg-white/10 z-0" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {c.steps.map(({ title, description }, i) => (
              <div key={i} className="group text-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center font-serif text-xl font-bold text-blush mx-auto mb-4 shadow-sm transition-all duration-200 group-hover:bg-coral group-hover:text-white group-hover:border-coral group-hover:scale-110">
                  {i + 1}
                </div>
                <h3 className="font-sans text-[1rem] font-semibold text-white mb-2">{title}</h3>
                <p className="font-sans text-[0.87rem] text-white/55 leading-[1.65]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Get Started Section ───────────────────────────────────────────────────────

function CustomSection({ content: c }) {
  return (
    <section id="custom" className="bg-deep py-24 px-8">
      <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <div className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-blush mb-3">{c.tag}</div>
          <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-white mb-4">{c.title}</h2>
          <p className="font-sans text-[1.05rem] text-white/65 leading-[1.7] mb-10">{c.subtitle}</p>
          <ul className="space-y-6 list-none p-0">
            {c.steps.map(({ icon, title, description }, i) => (
              <li key={i} className="flex gap-5 items-start">
                <div className="w-11 h-11 rounded-xl bg-blush/15 flex items-center justify-center flex-shrink-0 text-xl">
                  {icon}
                </div>
                <div>
                  <h4 className="font-sans text-[0.95rem] font-semibold text-white mb-1">{title}</h4>
                  <p className="font-sans text-[0.84rem] text-white/55 leading-[1.6]">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white/[0.05] border border-white/10 rounded-3xl p-10">
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
    a: "Yes — Listing Launch is completely standalone. No subscription required. Just fill out the form, select Listing Launch, and we'll handle the rest. $150 flat per listing.",
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
    <section id="faq" className="py-24 px-8 bg-light-gray">
      <div className="max-w-[820px] mx-auto">
        <div className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-coral mb-3">FAQ</div>
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-deep mb-4">Common questions.</h2>
        <p className="font-sans text-[1.05rem] text-slate leading-[1.7] mb-12">Everything you need to know before getting started.</p>
        <div className="space-y-3">
          {FAQ_ITEMS.map(({ q, a }) => (
            <details key={q} className="group bg-white rounded-2xl border border-border overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-7 py-5 cursor-pointer list-none font-sans text-[0.97rem] font-semibold text-deep select-none">
                {q}
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-light-gray flex items-center justify-center text-slate text-[1rem] leading-none transition-transform duration-200 group-open:rotate-45">+</span>
              </summary>
              <div className="px-7 pb-6 font-sans text-[0.9rem] text-slate leading-[1.75]">{a}</div>
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
    <section id="account" className="py-24 px-8">
      <div className="max-w-[1100px] mx-auto text-center">
        <div className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-coral mb-3">{c.tag}</div>
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-deep mb-4">{c.title}</h2>
        <p className="font-sans text-[1.05rem] text-slate leading-[1.7] max-w-[520px] mx-auto">{c.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {c.cards.map(({ icon, title, description }, i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-border text-left hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200">
              <span className="text-3xl mb-4 block">{icon}</span>
              <h3 className="font-sans text-[1rem] font-semibold text-deep mb-2">{title}</h3>
              <p className="font-sans text-[0.85rem] text-slate leading-[1.65]">{description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <a
            href="/portal"
            className="inline-block font-sans bg-deep text-white font-semibold px-8 py-3.5 rounded-full text-[0.95rem] no-underline hover:bg-coral hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,130,90,0.35)] transition-all duration-200"
          >
            Log In to Your Portal
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Payment Strip ─────────────────────────────────────────────────────────────

function PaymentStrip({ content: c }) {
  return (
    <div className="bg-blush py-10 px-8 text-center">
      <div className="max-w-[600px] mx-auto">
        <h3 className="font-serif text-[1.5rem] text-deep mb-2">{c.heading}</h3>
        <p className="font-sans text-[0.9rem] text-slate mb-5 leading-relaxed">{c.body}</p>
        <span className="inline-flex items-center gap-2.5 bg-[#008CFF] text-white font-bold text-[0.95rem] px-6 py-2.5 rounded-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
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
    <footer className="bg-deep pt-12 pb-8 px-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 pb-8 border-b border-white/10">
          <div>
            <a href="#" className="font-serif text-xl text-white no-underline">
              The Listing <span className="text-coral">Look</span>
            </a>
            <p className="font-sans text-[0.85rem] text-white/50 leading-[1.7] mt-3 max-w-[280px]">{c.tagline}</p>
          </div>
          <div>
            <h4 className="font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-white/40 mb-4">Plans</h4>
            <ul className="list-none p-0 space-y-2">
              {c.servicesLinks.map((label, i) => (
                <li key={i}>
                  <a href={SERVICES_HREFS[i] ?? "#services"} className="font-sans text-[0.88rem] text-white/65 no-underline hover:text-blush transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-white/40 mb-4">Account</h4>
            <ul className="list-none p-0 space-y-2">
              {c.accountLinks.map((label, i) => (
                <li key={i}>
                  <a href={ACCOUNT_HREFS[i] ?? "#"} className="font-sans text-[0.88rem] text-white/65 no-underline hover:text-blush transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between mt-6 font-sans text-[0.8rem] text-white/30 gap-2">
          <span>&copy; 2025 The Listing Look. All rights reserved.</span>
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
      <Hero content={cms.hero} />
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
