import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STAGE_CONFIG = {
  forSale:       { headline: "For Sale",       showPrice: true  },
  justListed:    { headline: "Just Listed",    showPrice: true  },
  underContract: { headline: "Under Contract", showPrice: false },
  priceRefresh:  { headline: "Price Refresh",  showPrice: true  },
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

function pickLayout(hasPhoto, secondaryCount) {
  if (!hasPhoto) return "noPhoto";
  if (secondaryCount >= 2) {
    const opts = ["fullBleed", "topHero", "collageSplit"];
    return opts[Math.floor(Math.random() * opts.length)];
  }
  if (secondaryCount === 1) {
    const opts = ["fullBleed", "topHero", "collageSplit"];
    return opts[Math.floor(Math.random() * opts.length)];
  }
  const opts = ["fullBleed", "topHero"];
  return opts[Math.floor(Math.random() * opts.length)];
}

function injectAssets(svg, logoBase64, primaryPhoto, teamLogoDataUri, layout, secondaryPhotos, primaryColor) {
  let injected = svg;

  // fullBleed: primary photo behind Claude's gradient+text (injected first)
  if (primaryPhoto && (layout === "fullBleed" || layout === "collageSplit")) {
    const w = layout === "collageSplit" ? "560" : "1080";
    const x = layout === "collageSplit" ? "520" : "0";
    const photoEl = `<image href="data:image/jpeg;base64,${primaryPhoto}" x="${x}" y="0" width="${w}" height="1350" preserveAspectRatio="xMidYMid slice"/>`;
    injected = injected.replace(/(<svg[^>]*>)/, `$1\n${photoEl}`);
  }

  // Late elements: rendered on top of Claude's SVG content
  const late = [];

  // topHero: photo on top ~55%, injected over Claude's solid background
  if (primaryPhoto && layout === "topHero") {
    late.push(`<image href="data:image/jpeg;base64,${primaryPhoto}" x="0" y="0" width="1080" height="740" preserveAspectRatio="xMidYMid slice"/>`);
    late.push(`<defs><linearGradient id="phgt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${primaryColor}" stop-opacity="0"/><stop offset="100%" stop-color="${primaryColor}" stop-opacity="1"/></linearGradient></defs><rect x="0" y="560" width="1080" height="185" fill="url(#phgt)"/>`);
  }

  // collageSplit secondary photos stacked on right panel
  if (layout === "collageSplit") {
    const s1 = secondaryPhotos?.[0];
    const s2 = secondaryPhotos?.[1];
    if (s1 && s2) {
      late.push(`<image href="data:image/jpeg;base64,${s1}" x="520" y="0" width="560" height="671" preserveAspectRatio="xMidYMid slice"/>`);
      late.push(`<line x1="520" y1="675" x2="1080" y2="675" stroke="${primaryColor}" stroke-width="8"/>`);
      late.push(`<image href="data:image/jpeg;base64,${s2}" x="520" y="679" width="560" height="671" preserveAspectRatio="xMidYMid slice"/>`);
    } else if (s1) {
      late.push(`<image href="data:image/jpeg;base64,${primaryPhoto}" x="520" y="679" width="560" height="671" preserveAspectRatio="xMidYMid slice"/>`);
      late.push(`<image href="data:image/jpeg;base64,${s1}" x="520" y="0" width="560" height="671" preserveAspectRatio="xMidYMid slice"/>`);
    }
    late.push(`<line x1="516" y1="0" x2="516" y2="1350" stroke="${primaryColor}" stroke-width="8"/>`);
  }

  // fullBleed collage: secondary photos as inset cards in the right zone
  if (layout === "fullBleed" && secondaryPhotos?.length > 0) {
    const positions = [
      { x: 590, y: 330, w: 460, h: 300 },
      { x: 590, y: 660, w: 460, h: 300 },
    ];
    secondaryPhotos.slice(0, 2).forEach((photo, i) => {
      if (!photo) return;
      const { x, y, w, h } = positions[i];
      late.push(`<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="14" fill="white" opacity="0.2"/>`);
      late.push(`<image href="data:image/jpeg;base64,${photo}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`);
      late.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>`);
    });
  }

  // KW logo — always top-left, on top of everything
  if (logoBase64) {
    late.push(`<image href="data:image/png;base64,${logoBase64}" x="30" y="24" width="540" height="142" preserveAspectRatio="xMinYMin meet"/>`);
  }

  // Team logo — top-right (or within left panel for collageSplit)
  if (teamLogoDataUri) {
    const tx = layout === "collageSplit" ? 30 : 810;
    const ty = layout === "collageSplit" ? 176 : 30;
    late.push(`<image href="${teamLogoDataUri}" x="${tx}" y="${ty}" width="220" height="120" preserveAspectRatio="xMinYMin meet"/>`);
  }

  if (late.length > 0) {
    injected = injected.replace("</svg>", late.join("\n") + "\n</svg>");
  }

  return injected;
}

export async function POST(req) {
  try {
    const { agent, listing, stage = "justListed", primaryPhoto, secondaryPhotos = [], team } = await req.json();
    const config   = STAGE_CONFIG[stage] || STAGE_CONFIG.justListed;
    const primary  = agent.primaryColor || "#C8102E";
    const accent   = agent.accentColor  || "#ffffff";
    const logoBase64 = getLogoBase64(agent.style);
    const hasPhoto = !!primaryPhoto;
    const layout   = pickLayout(hasPhoto, secondaryPhotos.length);

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

DESIGN SPEC — SVG viewBox "0 0 1080 1350", portrait 4:5 format (1080×1350px):

${layout === "fullBleed" || layout === "collageSplit"
  ? `PHOTO BACKGROUND MODE — layout: "${layout}"
${layout === "fullBleed"
    ? `- Full 1080×1350 primary listing photo is the background (injected separately — DO NOT add any background rect)
- DO include a gradient overlay as the FIRST child after <svg>:
  <defs><linearGradient id="ov" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${primary}" stop-opacity="0.05"/><stop offset="40%" stop-color="${primary}" stop-opacity="0.20"/><stop offset="100%" stop-color="${primary}" stop-opacity="0.72"/></linearGradient></defs><rect width="1080" height="1350" fill="url(#ov)"/>
- Text is centered over the full canvas
${secondaryPhotos.length > 0 ? `- Secondary listing photos will be injected as inset cards on the RIGHT side (x: 590–1050, y: 330–630 and y: 660–960) — keep all major text on the LEFT half (x: 0–560) and left-align it` : ""}`
    : `- Left panel (x: 0–515): solid brand color background — ALL text and design goes here only
- Right panel (x: 520–1080): listing photos will be injected — NO elements on the right side at all
- Background for left panel: <rect x="0" y="0" width="515" height="1350" fill="${primary}"/>
- DO include a subtle right-edge gradient blending the left panel into the right:
  <defs><linearGradient id="blg" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${primary}" stop-opacity="1"/><stop offset="100%" stop-color="${primary}" stop-opacity="0"/></linearGradient></defs><rect x="480" y="0" width="80" height="1350" fill="url(#blg)"/>
- Left-align all text starting at x: 50, keep within x: 0–500`}`
  : layout === "topHero"
  ? `TOP HERO MODE:
- A listing photo will cover the TOP 55% (y: 0–740) — injected on top of your design
- Use solid brand color for the FULL background: <rect width="1080" height="1350" fill="${primary}"/>
- Place ALL text elements in the BOTTOM section only (y: 780–1310) — nothing in the top 55%
- KW logo will be injected at (30, 24) on top of the photo — do not add logo placeholder`
  : `SOLID BACKGROUND MODE:
- Full background rect fill="${primary}" — use this exact hex color, height="1350"
- Add subtle geometric shapes for visual interest`}

LAYOUT (inspired by premium Canva real estate templates):
${layout === "collageSplit" ? `
ALL elements must stay within the LEFT PANEL (x: 0–510):
1. KW logo injected at (30, 24) — leave top-left clear
2. MAIN HEADLINE (y: ~200–420) — "${config.headline}" — Georgia/serif, ~90px, white, left-aligned at x: 50
3. SPEC BAR (y: ~450) — rounded pill, left-aligned: "${listing.beds} bd | ${listing.baths} ba | ${parseInt(listing.sqft || 0).toLocaleString()} sqft" — white text ~22px
4. BOTTOM STRIP (y: ~950–1200, x: 0–510):
   - Address, white ~24px, left-aligned
   ${config.showPrice ? `- Price "${priceText}", color="${accent}", bold ~44px, left-aligned` : ""}
   - Thin horizontal rule, full left-panel width
   - Agent name bold white 30px, "O: ${agent.officePhone}  M: ${agent.mobilePhone}" white 24px below
5. COMPLIANCE FOOTER (y: ~1295–1335) white 55% opacity, 16px, left-aligned:
   "${agent.name} | ${agent.officePhone} | ${agent.mobilePhone}" / "Each office is independently owned and operated."
` : layout === "topHero" ? `
ALL text elements must be in the BOTTOM section (y: 780–1310). Top 55% is covered by photo — leave empty:
1. KW logo injected at top-left on photo — do not add a logo area in bottom
2. MAIN HEADLINE (y: ~800–960) — "${config.headline}" — Georgia/serif, ~100px, white, centered
3. SPEC BAR (y: ~990) — rounded pill centered: "${listing.beds} bd | ${listing.baths} ba | ${parseInt(listing.sqft || 0).toLocaleString()} sqft" — white text ~24px
4. BOTTOM STRIP (y: ~1050–1230):
   - Address left-aligned, white ~24px
   ${config.showPrice ? `- Price "${priceText}" right-aligned, color="${accent}", bold ~44px` : ""}
   - Thin rule line
   - Agent name bold white 30px, "O: ${agent.officePhone}  M: ${agent.mobilePhone}" white 24px
5. COMPLIANCE FOOTER (y: ~1295–1335) white 55% opacity, 16px:
   "${agent.name} | ${agent.officePhone} | ${agent.mobilePhone}" / "Each office is independently owned and operated."
` : `
1. TOP AREA (y: 0–140) — KW logo injected top-left — leave clear
2. MAIN HEADLINE (y: ~200–460) — "${config.headline}" — Georgia/serif, ~120–140px, white, ${secondaryPhotos.length > 0 ? "left-aligned at x: 50" : "centered"}
3. SPEC BAR (y: ~500) — rounded pill: "${listing.beds} bed  |  ${listing.baths} bath  |  ${parseInt(listing.sqft || 0).toLocaleString()} sqft" — white ~26px
4. BOTTOM STRIP (y: ~950–1200):
   - Address white ~26px
   ${config.showPrice ? `- Price "${priceText}", color="${accent}", bold ~52px` : ""}
   - Thin rule line
   - Agent name bold white 34px, "O: ${agent.officePhone}  M: ${agent.mobilePhone}" white 26px below
5. COMPLIANCE FOOTER (y: ~1295–1335) white 55% opacity, 18px:
   "${agent.name} | ${agent.officePhone} | ${agent.mobilePhone}" / "Each office is independently owned and operated."
`}

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

    svg = injectAssets(svg, logoBase64, primaryPhoto || null, team?.logo || null, layout, secondaryPhotos, primary);

    return Response.json({ ok: true, svg });
  } catch (err) {
    console.error("Graphic generation error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
