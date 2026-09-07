import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
  // Place logo top-left, 340px wide × 90px tall — sized so "Greater Chattanooga" is legible
  const logoEl = `<image href="data:image/png;base64,${logoBase64}" x="36" y="30" width="340" height="90" preserveAspectRatio="xMinYMin meet"/>`;
  return svg.replace("</svg>", `${logoEl}\n</svg>`);
}

export async function POST(req) {
  try {
    const { agent, listing } = await req.json();

    const logoBase64 = getLogoBase64(agent.style);

    const prompt = `Design a professional real estate "Just Listed" social media graphic as clean SVG code.

PROPERTY:
- Address: ${listing.address}
- City, State ZIP: ${listing.city}, ${listing.state} ${listing.zip}
- Price: $${parseInt(listing.price).toLocaleString()}
- Beds: ${listing.beds}  Baths: ${listing.baths}  Sqft: ${parseInt(listing.sqft || 0).toLocaleString()}

AGENT (must appear on the graphic):
- Agent Name: ${agent.name}
- TN License #: ${agent.license}
- Office Phone: ${agent.officePhone}
- Mobile Phone: ${agent.mobilePhone}

DESIGN REQUIREMENTS:
- SVG viewBox: "0 0 1080 1080" — square format for Instagram
- Primary background: deep navy #1C1C2E
- Accent color: coral #E8825A
- Text: white (#FFFFFF) and white/70 opacity variations
- Only use system fonts: Arial, Georgia, serif, sans-serif — NO external font references
- NO <image> tags, NO external references, NO xlink
- IMPORTANT: Leave the top-left area (x: 0–420, y: 0–130) completely clear — the KW office logo will be placed there
- Large bold "JUST LISTED" text as the hero element (centered, below y: 140)
- Property address clearly displayed
- Price in coral and large
- Beds / Baths / Sqft as a clean spec line
- Agent name displayed near bottom — font size must NOT exceed 26px (must stay smaller than the KW logo text)
- Compliance footer at the very bottom (small, ~18px, white, 60% opacity):
  "${agent.name} | License #${agent.license} | ${agent.mobilePhone}"
- Below the compliance line, on its own line at ~16px: "Each office is independently owned and operated."
- Decorative geometric shapes or abstract elements — rectangles, circles, lines, polygons with opacity to add visual interest
- A subtle coral accent bar or border element
- Premium, scroll-stopping design for Instagram

Return ONLY the complete SVG code. Start directly with <svg and end with </svg>. No explanation, no markdown, no code fences.`;

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
