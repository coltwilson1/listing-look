// Brand Discovery Questionnaire — shared by the form page, the submit API and the admin view.
// Field types: text | email | tel | url | textarea | chips (multi-select) | choice (single-select cards)

export const STEPS = [
  {
    id: "about",
    title: "About you",
    intro: "The basics, so we know who we're building for.",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, placeholder: "Jane Smith" },
      { name: "email", label: "Email address", type: "email", required: true, placeholder: "jane@example.com" },
      { name: "phone", label: "Phone number", type: "tel", placeholder: "(555) 000-0000" },
      { name: "brokerage", label: "Brokerage", type: "text", required: true, placeholder: "Keller Williams" },
      { name: "market", label: "Where do you sell?", type: "text", required: true, placeholder: "City, county, or neighborhoods", full: true },
      {
        name: "experience",
        label: "Years in real estate",
        type: "choice",
        options: ["Less than 1", "1–3 years", "4–9 years", "10+ years"],
        full: true,
      },
      { name: "instagram", label: "Instagram handle", type: "text", placeholder: "@janesmithrealtor" },
      { name: "facebook", label: "Facebook page", type: "text", placeholder: "facebook.com/janesmithrealtor" },
      { name: "website", label: "Website (if you have one)", type: "url", placeholder: "janesmithhomes.com", full: true },
    ],
  },
  {
    id: "brand",
    title: "Your brand",
    intro: "How you want to look, sound, and feel.",
    fields: [
      {
        name: "personality",
        label: "Pick the words that best describe your brand",
        hint: "Choose up to four.",
        type: "chips",
        max: 4,
        required: true,
        options: ["Luxury", "Approachable", "Modern", "Classic", "Bold", "Warm", "Professional", "Playful", "Minimal", "Local expert", "Trustworthy", "Energetic"],
      },
      { name: "threeWords", label: "In three words, how should clients feel after working with you?", type: "text", placeholder: "Confident, cared for, informed", full: true },
      {
        name: "logoStatus",
        label: "Where is your logo today?",
        type: "choice",
        required: true,
        options: ["I have one I love", "I have one, but it needs a refresh", "I don't have one yet", "I use my brokerage's branding"],
        full: true,
      },
      { name: "colors", label: "Brand colors you use or love", type: "text", placeholder: "Navy and gold, or HEX codes if you have them", full: true },
      { name: "avoid", label: "Anything you never want to see in your brand?", type: "text", placeholder: "Colors, fonts, styles, clichés…", full: true },
      { name: "inspiration", label: "Agents, brands, or accounts whose look you admire", type: "textarea", placeholder: "Share handles or links and what you like about them", full: true },
    ],
  },
  {
    id: "audience",
    title: "Your clients",
    intro: "Who you serve, so every post speaks to them.",
    fields: [
      {
        name: "clients",
        label: "Who are your ideal clients?",
        hint: "Select all that apply.",
        type: "chips",
        required: true,
        options: ["First-time buyers", "Move-up buyers", "Luxury buyers", "Sellers", "Investors", "Relocation", "Downsizers & retirees", "Military families", "New construction", "Land & acreage"],
      },
      { name: "priceRange", label: "Typical price range", type: "text", placeholder: "$250K–$600K" },
      { name: "neighborhoods", label: "Neighborhoods you want to be known for", type: "text", placeholder: "Downtown, Riverside, Oak Hill" },
      { name: "standOut", label: "What sets you apart from other agents in your market?", type: "textarea", required: true, placeholder: "Your story, your approach, what clients rave about…", full: true },
    ],
  },
  {
    id: "goals",
    title: "Goals & content",
    intro: "What success looks like for your social media.",
    fields: [
      {
        name: "goals",
        label: "What do you want social media to do for you?",
        hint: "Select all that apply.",
        type: "chips",
        required: true,
        options: ["Generate more leads", "Stay top of mind with my sphere", "Look more established", "Showcase listings", "Build trust & credibility", "Grow my following", "Save me time"],
      },
      {
        name: "content",
        label: "Content you'd like to see",
        hint: "Select all that apply.",
        type: "chips",
        options: ["Listings & solds", "Market updates", "Buyer & seller tips", "Local spotlights", "Holidays & seasonal", "Testimonials", "Personal & behind-the-scenes", "Open houses"],
      },
      {
        name: "posting",
        label: "Should we post for you, or deliver content for you to post?",
        type: "choice",
        required: true,
        options: ["Post for me", "Deliver it, I'll post", "Not sure yet"],
        full: true,
      },
      { name: "currentPosting", label: "How often do you post today?", type: "choice", options: ["Rarely or never", "A few times a month", "Weekly", "Several times a week"], full: true },
      { name: "topicsAvoid", label: "Topics we should stay away from", type: "text", placeholder: "Politics, specific competitors…", full: true },
    ],
  },
  {
    id: "final",
    title: "Final details",
    intro: "The last few things we need to get started.",
    fields: [
      { name: "compliance", label: "Required brokerage disclosures or compliance text", type: "textarea", placeholder: "Equal Housing logo, license number, brokerage name and phone…", full: true },
      {
        name: "assets",
        label: "Which of these do you already have?",
        hint: "Select all that apply.",
        type: "chips",
        options: ["Professional headshot", "Logo files", "Brand colors / fonts", "Brokerage brand guide", "Past marketing I like"],
      },
      { name: "contactPref", label: "Best way to reach you", type: "choice", options: ["Text", "Phone call", "Email"], full: true },
      { name: "anythingElse", label: "Anything else we should know?", type: "textarea", placeholder: "Deadlines, upcoming listings, big goals for this year…", full: true },
    ],
  },
];

export const ALL_FIELDS = STEPS.flatMap((s) => s.fields);

// [label, value] rows in question order, for email and admin display.
export function answerRows(answers) {
  return ALL_FIELDS.map((f) => {
    const v = answers?.[f.name];
    return [f.label, Array.isArray(v) ? v.join(", ") : String(v ?? "").trim()];
  });
}
