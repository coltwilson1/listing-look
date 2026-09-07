import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STAGE_CONFIG = {
  justListed: {
    headline: "JUST LISTED",
    accent: "#E8825A",
    vibe: "exciting new listing announcement",
  },
  underContract: {
    headline: "UNDER CONTRACT",
    accent: "#3b82f6",
    vibe: "celebratory under contract announcement",
  },
  priceReduced: {
    headline: "PRICE REDUCED",
    accent: "#f59e0b",
    vibe: "urgent price reduction opportunity",
  },
  sold: {
    headline: "SOLD",
    accent: "#10b981",
    vibe: "celebratory sold announcement",
  },
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
  } catch {
    return null;
  }
}

function injectLogo(svg, logoBase64) {
  if (!logoBase64) return svg;
  const logoEl = `<image href="data:image/png;base64,${logoBase64}" x="36" y="30" width="340" height="90" preserveAspectRatio="xMinYMin meet"/>`;
  return svg.replace("</svg>", `${logoEl}\n</svg>`);
}

export async function POST(req) {
  try {
    const { agent, listing, stage = "justListed" } = await req.json();
    const config = STAGE_CONFIG[stage] || STAGE_CONFIG.justListed;
    const logoBase64 = getLogoBase64(agent.style);

    const showPrice = stage === "justListed" || stage === "priceReduced";
    const priceNote = showPrice ? `- Price: $${parseInt(listing.price).toLocaleString()}` : "";

    const prompt = `Design a professional real estate "${config.headline}" social media graphic as clean SVG code. The mood is ${config.vibe}.

PROPERTY:
- Address: ${listing.address}
- City, State ZIP: ${listing.city}, ${listing.state} ${listing.zip}
${priceNote}
- Beds: ${listing.beds}  Baths: ${listing.baths}  Sqft: ${parseInt(listing.sqft || 0).toLocaleString()}

AGENT:
- Agent Name: ${agent.name}
- TN License #: ${agent.license}
- Mobile Phone: ${agent.mobilePhone}

DESIGN REQUIREMENTS:
- SVG viewBox: "0 0 1080 1080" — square Instagram format
- Primary background: deep navy #1C1C2E
- Hero accent color: ${config.accent}
- Text: white (#FFFFFF) with opacity variations
- System fonts only: Arial, Georgia, serif, sans-serif — NO external fonts
- NO <image> tags, NO external references, NO xlink
- IMPORTANT: Leave the top-left area (x: 0–420, y: 0–130) completely clear — the KW logo will be placed there
- Large bold "${config.headline}" text as the hero element (centered, below y: 150)
- Property address clearly displayed
${showPrice ? `- Price in ${config.accent} color and large` : ""}
- Beds / Baths / Sqft spec line
- Agent name near bottom — font size must NOT exceed 26px
- Compliance footer at very bottom (~18px, white 60% opacity):
  "${agent.name} | License #${agent.license} | ${agent.mobilePhone}"
- Below compliance: "Each office is independently owned and operated." (~16px, white 50% opacity)
- Decorative geometric shapes — rectangles, circles, lines, polygons with opacity for visual depth
- A subtle ${config.accent} accent bar or border element
- Premium, scroll-stopping Instagram design

Return ONLY the complete SVG code starting with <svg and ending with </svg>. No explanation, no markdown.`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    let svg = message.content[0].text.trim();
    svg = svg.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();

    if (!svg.startsWith("<svg")) {
      const match = svg.match(/<svg[\s\S]*<\/svg>/i);
      if (match) svg = match[0];
      else throw new Error("No valid SVG in response");
    }

    svg = injectLogo(svg, logoBase64);

    return Response.json({ ok: true, svg });
  } catch (err) {
    console.error("Graphic generation error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
