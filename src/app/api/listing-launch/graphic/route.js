import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STAGE_CONFIG = {
  justListed:    { headline: "Just Listed",    showPrice: true  },
  underContract: { headline: "Under Contract", showPrice: false },
  priceReduced:  { headline: "Price Reduced",  showPrice: true  },
  sold:          { headline: "Just Sold!",     showPrice: false },
};


function getLogoBase64(style) {
  try {
    const isEnergetic = style === "energetic";
    const folder = isEnergetic ? "RGB" : "Black_White";
    const file = isEnergetic
      ? "KellerWilliams_Realty_GreaterChattanooga_Logo_RGB-rev.png"
      : "KellerWilliams_Realty_GreaterChattanooga_Logo_GRY-rev.png";
    const logoPath = path.join(process.cwd(), "public", "logos", "KW Logos", folder, file);
    return fs.readFileSync(logoPath).toString("base64");
  } catch { return null; }
}

function injectAssets(svg, logoBase64, photoBase64) {
  let injected = svg;

  // Inject photo as very first element (background layer)
  if (photoBase64) {
    const photoEl = `<image href="data:image/jpeg;base64,${photoBase64}" x="0" y="0" width="1080" height="1080" preserveAspectRatio="xMidYMid slice"/>`;
    injected = injected.replace(/(<svg[^>]*>)/, `$1\n${photoEl}`);
  }

  // Inject KW logo top-left at very end (top layer) — larger for legibility
  if (logoBase64) {
    const logoEl = `<image href="data:image/png;base64,${logoBase64}" x="30" y="24" width="540" height="142" preserveAspectRatio="xMinYMin meet"/>`;
    injected = injected.replace("</svg>", `${logoEl}\n</svg>`);
  }

  return injected;
}

export async function POST(req) {
  try {
    const { agent, listing, stage = "justListed", primaryPhoto } = await req.json();
    const config = STAGE_CONFIG[stage] || STAGE_CONFIG.justListed;
    const primary = agent.primaryColor || "#C8102E";
    const accent  = agent.accentColor  || "#ffffff";
    const logoBase64 = getLogoBase64(agent.style);
    const hasPhoto = !!primaryPhoto;

    const priceText = `$${parseInt(listing.price).toLocaleString()}`;

    const prompt = `Design a premium real estate social media graphic as clean SVG code. Style: "${config.headline}" announcement.

PROPERTY:
- Address: ${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}
${config.showPrice ? `- Price: ${priceText}` : ""}
- ${listing.beds} bed · ${listing.baths} bath · ${parseInt(listing.sqft || 0).toLocaleString()} sqft

AGENT: ${agent.name}
Office: ${agent.officePhone}
Mobile: ${agent.mobilePhone}

COLORS (use these exactly — do not substitute):
- Primary / background: ${primary}
- Accent / highlight: ${accent}

DESIGN SPEC — SVG viewBox "0 0 1080 1080", square Instagram format:

${hasPhoto
  ? `PHOTO BACKGROUND MODE: A listing photo will be injected as the first SVG element (background).
- Do NOT include any background rect or solid fill
- DO include a full-size gradient overlay rect immediately after the opening <svg> tag:
  <defs><linearGradient id="ov" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${primary}" stop-opacity="0.05"/><stop offset="40%" stop-color="${primary}" stop-opacity="0.20"/><stop offset="100%" stop-color="${primary}" stop-opacity="0.68"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#ov)"/>
- The photo must remain clearly visible — the overlay is subtle, not heavy
- All text must be white or very light — it sits over the darkened photo`
  : `SOLID BACKGROUND MODE:
- Full background rect fill="${primary}" — use this exact hex color, no substitutions
- Add subtle geometric shapes or depth elements for visual interest using a slightly lighter/darker shade of ${primary}`}

LAYOUT (inspired by premium Canva real estate templates):
1. TOP AREA (y: 0–140) — Leave clear for KW logo (injected separately)
2. MAIN HEADLINE (y: ~180–380) — Large elegant headline: "${config.headline}" — Georgia/serif font, ~110–130px, white, centered
3. SPEC BAR (y: ~410) — Semi-transparent dark rounded pill: "${listing.beds} bed  |  ${listing.baths} bath  |  ${parseInt(listing.sqft || 0).toLocaleString()} sqft" — white text ~26px
4. BOTTOM STRIP (y: ~760–980):
   - Location pin (● symbol) + address text, left-aligned, white ~26px
   ${config.showPrice ? `- Price "${priceText}" right-aligned, color="${accent}", bold ~52px` : ""}
   - Thin horizontal rule line
   - Agent name: bold, white, 34px — must be clearly legible
   - "O: ${agent.officePhone}  M: ${agent.mobilePhone}" — white 85% opacity, 26px — on one line directly below agent name
5. COMPLIANCE FOOTER (y: ~1030–1065) — white 55% opacity, 18px:
   "${agent.name} | ${agent.officePhone} | ${agent.mobilePhone}"
   "Each office is independently owned and operated." on the line below at 16px

STYLE NOTES:
- Use accent color ${accent} for price text and any decorative lines/elements
- Elegant, high-end real estate aesthetic — NOT generic or template-looking
- System fonts only: Georgia, Arial, sans-serif — NO external references, NO xlink, NO <image> tags
- Agent name and both phone numbers MUST be large enough to read on a phone screen

Return ONLY complete SVG starting with <svg and ending with </svg>. No markdown, no explanation.`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 5000,
      messages: [{ role: "user", content: prompt }],
    });

    let svg = message.content[0].text.trim();
    svg = svg.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();

    if (!svg.startsWith("<svg")) {
      const match = svg.match(/<svg[\s\S]*<\/svg>/i);
      if (match) svg = match[0];
      else throw new Error("No valid SVG in response");
    }

    svg = injectAssets(svg, logoBase64, primaryPhoto || null);

    return Response.json({ ok: true, svg });
  } catch (err) {
    console.error("Graphic generation error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
