import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { agent, listing } = await req.json();

    const prompt = `Design a professional real estate "Just Listed" social media graphic as clean SVG code.

PROPERTY:
- Address: ${listing.address}
- City, State ZIP: ${listing.city}, ${listing.state} ${listing.zip}
- Price: $${parseInt(listing.price).toLocaleString()}
- Beds: ${listing.beds}  Baths: ${listing.baths}  Sqft: ${parseInt(listing.sqft || 0).toLocaleString()}

AGENT (all 4 items MUST appear on the graphic — TREC Rule 1260-02):
- Agent Name: ${agent.name}
- Brokerage: ${agent.brokerage}
- TN License #: ${agent.license}
- Contact (phone/website): ${agent.phone}
- Responsible Broker: ${agent.brokerName}

DESIGN REQUIREMENTS:
- SVG viewBox: "0 0 1080 1080" — square format for Instagram
- Primary background: deep navy #1C1C2E
- Accent color: coral #E8825A
- Text: white (#FFFFFF) and white/70 opacity variations
- Only use system fonts: Arial, Georgia, serif, sans-serif — NO external font references
- NO <image> tags, NO external references, NO xlink
- Large bold "JUST LISTED" text as the hero element
- Property address clearly displayed
- Price in coral and large
- Beds / Baths / Sqft as a clean spec line
- Agent name and brokerage prominently at bottom
- REQUIRED COMPLIANCE BLOCK (mandatory per TREC Rule 1260-02 — must be visible on the graphic):
  * Agent's TN License number: "${agent.license}"
  * Brokerage name: "${agent.brokerage}"
  * Contact info: "${agent.phone}"
  * Responsible Broker: "${agent.brokerName}"
  Place these in a small but legible compliance footer at the very bottom of the graphic, all on one or two lines, smaller text (around 18-22px in SVG units)
- Decorative geometric shapes or abstract elements that feel modern and premium — use rectangles, circles, lines, polygons with opacity/transparency to add visual interest
- A subtle coral accent bar or border element
- The design should feel like a premium real estate brand, not generic
- Make it visually striking and scroll-stopping on Instagram

Return ONLY the complete SVG code. Start directly with <svg and end with </svg>. No explanation, no markdown, no code fences.`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    let svg = message.content[0].text.trim();

    // Strip any markdown fences if present
    svg = svg.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();

    if (!svg.startsWith("<svg")) {
      const match = svg.match(/<svg[\s\S]*<\/svg>/i);
      if (match) svg = match[0];
      else throw new Error("No valid SVG in response");
    }

    return Response.json({ ok: true, svg });
  } catch (err) {
    console.error("Graphic generation error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
