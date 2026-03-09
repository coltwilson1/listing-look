import { sanityFetch } from "@/sanity/lib/live";
import SiteHeader from "./components/SiteHeader";
import CustomOrderForm from "./components/CustomOrderForm";
import ServicesWithModals from "./components/ServicesWithModals";

// ── GROQ query ────────────────────────────────────────────────────────────────
const HOME_QUERY = `*[_type == "homePage" && _id == "homePage"][0]`;

// ── Fallback defaults (mirrors the Sanity initialValue) ───────────────────────
const DEFAULTS = {
  hero: {
    badge: "Real Estate Marketing Made Easy",
    headlineStart: "Your Listings Deserve a",
    headlineEmphasis: "Beautiful Look",
    subheadline:
      "Beautiful social media graphics, postcards, and custom marketing materials — designed just for real estate agents. Place your order, get a proof, and go sell homes.",
    primaryButtonText: "Browse Services",
    secondaryButtonText: "Request Custom Design",
  },
  stats: [
    { num: "48hrs", label: "Proof turnaround time" },
    { num: "1", label: "Free revision per order" },
    { num: "3", label: "Product categories & growing" },
  ],
  howItWorks: {
    tag: "The Process",
    title: "Simple from start to sign.",
    subtitle:
      "No back-and-forth confusion. Just pick what you need, share your details, and we handle the rest.",
    steps: [
      {
        title: "Browse & Order",
        description:
          "Pick a service or template from our catalog, fill in your listing details, and submit your order.",
      },
      {
        title: "We Design It",
        description:
          "Our designer gets to work creating your custom materials within 48 hours.",
      },
      {
        title: "Review Your Proof",
        description:
          "You'll receive a proof by email. One round of edits is included — just tell us what to tweak.",
      },
      {
        title: "Approve & Go!",
        description:
          "Give the green light and receive your final print-ready or digital files.",
      },
    ],
  },
  services: {
    tag: "What We Offer",
    title: "Marketing materials that move listings.",
    subtitle:
      "Every piece is custom-designed for your brand and property. No templates that look like everyone else's.",
    items: [
      {
        icon: "📲",
        title: "Social Media Graphics",
        description:
          "Eye-catching graphics sized perfectly for Instagram, Facebook, and more — open houses, new listings, just sold, and beyond.",
        listItems: [
          "Instagram posts & stories",
          "Facebook event banners",
          "Open house announcements",
          "Just Listed / Just Sold sets",
        ],
        price: "Starting at — Contact for pricing",
        buttonText: "Order Now",
      },
      {
        icon: "📮",
        title: "Postcards & Print",
        description:
          "Tangible marketing that gets noticed. Beautiful, professionally designed postcards and print materials for your farm or listings.",
        listItems: [
          "Just Listed & Just Sold postcards",
          "Open house invitations",
          "Neighborhood farming mailers",
          "Print-ready files included",
        ],
        price: "Starting at — Contact for pricing",
        buttonText: "Order Now",
      },
      {
        icon: "✨",
        title: "Custom Design Request",
        description:
          "Have something specific in mind? Submit a custom request and we'll bring your vision to life — your brand, your style.",
        listItems: [
          "Brand kits & logo variations",
          "Seasonal campaigns",
          "Listing presentations",
          "Any creative project",
        ],
        price: "Custom quote provided",
        buttonText: "Get a Quote",
      },
    ],
  },
  customOrder: {
    tag: "Custom Orders",
    title: "Tell us exactly what you need.",
    subtitle:
      "Fill out the form and we'll get back to you within 24 hours with a quote and next steps.",
    steps: [
      {
        icon: "📋",
        title: "Submit Your Request",
        description:
          "Describe what you need, your style preferences, and any deadline requirements.",
      },
      {
        icon: "💬",
        title: "We Send a Quote",
        description: "You'll get a personalized quote via email within 24 hours.",
      },
      {
        icon: "💸",
        title: "Pay via Venmo",
        description:
          "Once you approve the quote, send payment via Venmo and we get started.",
      },
      {
        icon: "🎨",
        title: "Proof + 1 Revision",
        description:
          "We'll email you a proof within 48 hours. One revision is always included.",
      },
    ],
  },
  account: {
    tag: "Your Account",
    title: "Track every order in one place.",
    subtitle:
      "Create a free account to manage your orders, upload assets, and keep your brand info handy.",
    cards: [
      {
        icon: "📦",
        title: "Order History",
        description:
          "See every past and active order at a glance — status updates, delivery timelines, and downloadable final files.",
      },
      {
        icon: "🖼️",
        title: "Asset Vault",
        description:
          "Upload your headshot, logo, and brand colors once. We'll pull them automatically for every future order.",
      },
      {
        icon: "✏️",
        title: "Revision Requests",
        description:
          "Submit your one included revision directly through your dashboard — no more hunting through email chains.",
      },
    ],
  },
  payment: {
    heading: "We accept payment via Venmo",
    body: "After your quote is approved, you'll receive our Venmo handle to complete your payment. Simple and fast.",
  },
  footer: {
    tagline:
      "Custom marketing materials for real estate agents who want their brand to stand out in every market.",
    servicesLinks: ["Social Media Graphics", "Postcards & Print", "Custom Design"],
    accountLinks: ["Create Account", "Log In", "How It Works"],
  },
};

// Merge Sanity data with defaults so the site always has content
function mergeContent(data) {
  if (!data) return DEFAULTS;
  return {
    hero: { ...DEFAULTS.hero, ...data.hero },
    stats: data.stats?.length ? data.stats : DEFAULTS.stats,
    howItWorks: {
      ...DEFAULTS.howItWorks,
      ...data.howItWorks,
      steps: data.howItWorks?.steps?.length
        ? data.howItWorks.steps
        : DEFAULTS.howItWorks.steps,
    },
    services: {
      ...DEFAULTS.services,
      ...data.services,
      items: data.services?.items?.length
        ? data.services.items
        : DEFAULTS.services.items,
    },
    customOrder: {
      ...DEFAULTS.customOrder,
      ...data.customOrder,
      steps: data.customOrder?.steps?.length
        ? data.customOrder.steps
        : DEFAULTS.customOrder.steps,
    },
    account: {
      ...DEFAULTS.account,
      ...data.account,
      cards: data.account?.cards?.length ? data.account.cards : DEFAULTS.account.cards,
    },
    payment: { ...DEFAULTS.payment, ...data.payment },
    footer: {
      ...DEFAULTS.footer,
      ...data.footer,
      servicesLinks: data.footer?.servicesLinks?.length
        ? data.footer.servicesLinks
        : DEFAULTS.footer.servicesLinks,
      accountLinks: data.footer?.accountLinks?.length
        ? data.footer.accountLinks
        : DEFAULTS.footer.accountLinks,
    },
  };
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero({ content: c }) {
  return (
    <section className="min-h-screen flex items-center pt-[100px] pb-16 px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 70% 30%, rgba(242,196,176,0.35) 0%, transparent 60%),
            radial-gradient(ellipse at 10% 80%, rgba(212,168,83,0.15) 0%, transparent 50%)
          `,
        }}
      />
      <div
        className="absolute rounded-full bg-coral opacity-[0.08] animate-float pointer-events-none"
        style={{ width: 500, height: 500, top: -100, right: -100 }}
      />
      <div
        className="absolute rounded-full bg-gold opacity-[0.08] animate-float-reverse pointer-events-none"
        style={{ width: 300, height: 300, bottom: 50, left: -80 }}
      />

      <div className="max-w-[640px] mx-auto w-full relative z-10">
        <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-1.5 text-[0.8rem] font-medium text-slate mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse-dot inline-block" />
          {c.badge}
        </div>

        <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[1.15] text-deep mb-6">
          {c.headlineStart}{" "}
          <em className="italic text-coral">{c.headlineEmphasis}</em>
        </h1>

        <p className="font-sans text-[1.1rem] leading-[1.7] text-slate mb-10">
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

// ── Stats ─────────────────────────────────────────────────────────────────────

function Stats({ content: stats }) {
  return (
    <div className="bg-deep py-12 px-8">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {stats.map(({ num, label }, i) => (
          <div key={i}>
            <span className="font-serif text-[2.8rem] text-blush block">{num}</span>
            <span className="font-sans text-[0.9rem] text-white/60 mt-1 block">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── How It Works ──────────────────────────────────────────────────────────────

function HowItWorks({ content: c }) {
  return (
    <section id="how-it-works" className="py-24 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-coral mb-3">
          {c.tag}
        </div>
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-deep mb-4">{c.title}</h2>
        <p className="font-sans text-[1.05rem] text-slate leading-[1.7] max-w-[560px] mb-14">
          {c.subtitle}
        </p>

        <div className="relative">
          <div className="hidden md:block absolute top-7 left-[10%] right-[10%] h-px bg-border z-0" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {c.steps.map(({ title, description }, i) => (
              <div key={i} className="group text-center relative z-10">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-border flex items-center justify-center font-serif text-xl font-bold text-coral mx-auto mb-4 shadow-sm transition-all duration-200 group-hover:bg-coral group-hover:text-white group-hover:border-coral group-hover:scale-110">
                  {i + 1}
                </div>
                <h3 className="font-sans text-[1rem] font-semibold text-deep mb-2">{title}</h3>
                <p className="font-sans text-[0.87rem] text-slate leading-[1.6]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Services ──────────────────────────────────────────────────────────────────

function Services({ content: c }) {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {c.items.map(({ icon, title, description, listItems, price, buttonText }, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-2xl p-8 border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(28,28,46,0.1)] cursor-pointer"
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
              <a
                href="#custom"
                className="inline-block bg-deep text-white font-sans text-[0.85rem] font-semibold px-6 py-2.5 rounded-full no-underline hover:bg-coral transition-colors duration-200"
              >
                {buttonText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Custom Order Section ──────────────────────────────────────────────────────

function CustomSection({ content: c }) {
  return (
    <section id="custom" className="bg-deep py-24 px-8">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        <div>
          <div className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-blush mb-3">
            {c.tag}
          </div>
          <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-white mb-4">{c.title}</h2>
          <p className="font-sans text-[1.05rem] text-white/65 leading-[1.7] max-w-[560px] mb-10">
            {c.subtitle}
          </p>
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

// ── Account Section ───────────────────────────────────────────────────────────

function AccountSection({ content: c }) {
  return (
    <section id="account" className="py-24 px-8">
      <div className="max-w-[1200px] mx-auto text-center">
        <div className="text-[0.75rem] font-bold uppercase tracking-[0.15em] text-coral mb-3">
          {c.tag}
        </div>
        <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-deep mb-4">{c.title}</h2>
        <p className="font-sans text-[1.05rem] text-slate leading-[1.7] max-w-[560px] mx-auto">
          {c.subtitle}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {c.cards.map(({ icon, title, description }, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 border border-border text-left hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-3xl mb-4 block">{icon}</span>
              <h3 className="font-sans text-[1rem] font-semibold text-deep mb-2">{title}</h3>
              <p className="font-sans text-[0.85rem] text-slate leading-[1.65]">{description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <a
            href="#custom"
            className="inline-block font-sans bg-deep text-white font-semibold px-8 py-3.5 rounded-full text-[0.95rem] no-underline hover:bg-coral hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,130,90,0.35)] transition-all duration-200"
          >
            Create a Free Account
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Payment Strip ─────────────────────────────────────────────────────────────

function PaymentStrip({ content: c }) {
  return (
    <div className="bg-blush py-8 px-8 text-center">
      <div className="max-w-[600px] mx-auto">
        <h3 className="font-serif text-[1.4rem] text-deep mb-2">{c.heading}</h3>
        <p className="font-sans text-[0.9rem] text-slate mb-4 leading-relaxed">{c.body}</p>
        <span className="inline-flex items-center gap-2 bg-[#008CFF] text-white font-bold text-[0.95rem] px-6 py-2.5 rounded-full">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M19.5 2C20.9 2 22 3.1 22 4.5c0 .9-.5 2.2-1.3 3.5L14 20.5H8.3L5 2H10l1.8 10.7L16.5 2H19.5z" />
          </svg>
          Venmo Payment
        </span>
      </div>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

const ACCOUNT_HREFS = ["#account", "#", "#how-it-works"];

function Footer({ content: c }) {
  return (
    <footer className="bg-deep pt-12 pb-8 px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 pb-8 border-b border-white/10">
          <div>
            <a href="#" className="font-serif text-xl text-white no-underline">
              The Listing <span className="text-coral">Look</span>
            </a>
            <p className="font-sans text-[0.85rem] text-white/50 leading-[1.7] mt-3 max-w-[280px]">
              {c.tagline}
            </p>
          </div>

          <div>
            <h4 className="font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-white/40 mb-4">
              Services
            </h4>
            <ul className="list-none p-0 space-y-2">
              {c.servicesLinks.map((label, i) => (
                <li key={i}>
                  <a
                    href="#services"
                    className="font-sans text-[0.88rem] text-white/65 no-underline hover:text-blush transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-white/40 mb-4">
              Account
            </h4>
            <ul className="list-none p-0 space-y-2">
              {c.accountLinks.map((label, i) => (
                <li key={i}>
                  <a
                    href={ACCOUNT_HREFS[i] ?? "#"}
                    className="font-sans text-[0.88rem] text-white/65 no-underline hover:text-blush transition-colors"
                  >
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

// ── Page (async server component) ─────────────────────────────────────────────

export default async function HomePage() {
  const { data } = await sanityFetch({ query: HOME_QUERY });
  const cms = mergeContent(data);

  return (
    <main>
      <SiteHeader />
      <Hero content={cms.hero} />
      <Stats content={cms.stats} />
      <HowItWorks content={cms.howItWorks} />
      <ServicesWithModals content={cms.services} />
      <CustomSection content={cms.customOrder} />
      <AccountSection content={cms.account} />
      <PaymentStrip content={cms.payment} />
      <Footer content={cms.footer} />
    </main>
  );
}
