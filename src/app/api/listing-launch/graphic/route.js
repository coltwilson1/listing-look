import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STAGE_CONFIG = {
  justListed:     { headline: "Just Listed",     badge: "NEW PROPERTY",   showPrice: true  },
  underContract:  { headline: "Under Contract",  badge: "UNDER CONTRACT", showPrice: false },
  priceReduced:   { headline: "Price Reduced",   badge: "NEW PRICE",      showPrice: true  },
  sold:           { headline: "Just Sold!",      badge: "SOLD",           showPrice: false },
};

const SCHEME_MAP = {
  forest:   { bg: "#1a3d35", accent: "#c9a84c", overlay: "rgba(15,40,32,0.72)"  },
  navy:     { bg: "#1C1C2E", accent: "#E8825A", overlay: "rgba(15,15,35,0.72)"  },
  midnight: { bg: "#0f0f0f", accent: "#e2e8f0", overlay: "rgba(0,0,0,0.75)"     },
  warm:     { bg: "#2a1810", accent: "#d4835a", overlay: "rgba(30,12,5,0.72)"   },
  slate:    { bg: "#1a2233", accent: "#60a5fa", overlay: "rgba(10,15,30,0.72)"  },
  burgundy: { bg: "#2d0f14", accent: "#c9a84c", overlay: "rgba(35,5,10,0.75)"  },
  sage:     { bg: "#2a3d2a", accent: "#e8d5b0", overlay: "rgba(20,38,20,0.72)" },
  ocean:    { bg: "#0d2233", accent: "#48cae4", overlay: "rgba(5,18,35,0.74)"  },
  plum:     { bg: "#2a1a33", accent: "#c084fc", overlay: "rgba(25,10,38,0.74)" },
  charcoal: { bg: "#2a2a2a", accent: "#fbbf24", overlay: "rgba(15,15,15,0.76)" },
  rose:     { bg: "#2d1a1f", accent: "#f9a8c9", overlay: "rgba(35,10,18,0.74)" },
  emerald:  { bg: "#0f2d1f", accent: "#34d399", overlay: "rgba(5,28,15,0.74)"  },
  desert:   { bg: "#3d2a1a", accent: "#e8c06a", overlay: "rgba(40,22,8,0.73)"  },
  kwred:    { bg: "#1a0305", accent: "#C8102E", overlay: "rgba(20,2,5,0.76)"   },
  crimson:  { bg: "#2a0000", accent: "#ffffff", overlay: "rgba(30,0,0,0.76)"   },
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

  // Inject KW logo top-left at very end (top layer)
  if (logoBase64) {
    const logoEl = `<image href="data:image/png;base64,${logoBase64}" x="36" y="30" width="300" height="80" preserveAspectRatio="xMinYMin meet"/>`;
    injected = injected.replace("</svg>", `${logoEl}\n</svg>`);
  }

  return injected;
}

export async function POST(req) {
  try {
    const { agent, listing, stage = "justListed", primaryPhoto } = await req.json();
    const config = STAGE_CONFIG[stage] || STAGE_CONFIG.justListed;
    const scheme = SCHEME_MAP[agent.colorScheme] || SCHEME_MAP.forest;
    const logoBase64 = getLogoBase64(agent.style);
    const hasPhoto = !!primaryPhoto;

    const priceText = `$${parseInt(listing.price).toLocaleString()}`;

    const prompt = `Design a premium real estate social media graphic as clean SVG code. Style: "${config.headline}" announcement.

PROPERTY:
- Address: ${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}
${config.showPrice ? `- Price: ${priceText}` : ""}
- ${listing.beds} bed · ${listing.baths} bath · ${parseInt(listing.sqft || 0).toLocaleString()} sqft

AGENT: ${agent.name} | License #${agent.license} | ${agent.mobilePhone}

DESIGN SPEC — SVG viewBox "0 0 1080 1080", square Instagram format:

${hasPhoto
  ? `PHOTO BACKGROUND MODE: A listing photo will be injected as the first SVG element (background).
- Do NOT include any background rect or solid fill
- DO include a full-size gradient overlay rect immediately after the opening <svg> tag:
  <defs><linearGradient id="ov" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${scheme.bg}" stop-opacity="0.45"/><stop offset="55%" stop-color="${scheme.bg}" stop-opacity="0.65"/><stop offset="100%" stop-color="${scheme.bg}" stop-opacity="0.92"/></linearGradient></defs><rect width="1080" height="1080" fill="url(#ov)"/>
- All text must be white or light — it sits over a darkened photo`
  : `SOLID BACKGROUND MODE:
- Full background rect: fill="${scheme.bg}"
- Add subtle geometric shapes and depth elements for visual interest`}

LAYOUT (inspired by premium Canva real estate templates):
1. TOP AREA (y: 0–140) — Leave clear for KW logo (injected separately)
2. BADGE (y: ~160) — Small pill badge centered: "${config.badge}" — rounded rect with ${scheme.accent} stroke, white text, ~22px font
3. MAIN HEADLINE (y: ~230–400) — Large elegant headline: "${config.headline}" — Georgia/serif font, ~110–130px, white, centered
4. SPEC BAR (y: ~430) — Semi-transparent dark rounded pill: "${listing.beds} bed  |  ${listing.baths} bath  |  ${parseInt(listing.sqft || 0).toLocaleString()} sqft" — white text ~26px
5. BOTTOM STRIP (y: ~820–1000):
   - Location pin (▼ or ● symbol) + address text, left-aligned, white ~28px
   ${config.showPrice ? `- Price "${priceText}" right-aligned, ${scheme.accent} color, bold ~52px` : ""}
   - Thin horizontal rule line above the bottom strip
6. COMPLIANCE FOOTER (y: ~1030–1055) — white 55% opacity ~16px:
   "${agent.name} | License #${agent.license} | ${agent.mobilePhone}"
   "Each office is independently owned and operated." on the line below at ~14px

STYLE NOTES:
- Accent color: ${scheme.accent}
- Elegant, high-end real estate aesthetic — NOT generic
- System fonts only: Georgia, Arial, sans-serif — NO external references, NO xlink, NO <image> tags
- Agent name near bottom must NOT exceed 24px

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
