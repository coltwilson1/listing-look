import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STAGE_INSTRUCTIONS = {
  forSale:       "For Sale — inviting, paint the lifestyle this home offers. Include price and key details. 3-4 sentences + 5 relevant hashtags.",
  justListed:    "Just Listed — include price and key details naturally. 3-4 sentences + 5 relevant hashtags.",
  underContract: "Under Contract — celebratory, thank the community for support. 2-3 sentences + 3 hashtags.",
  priceRefresh:  "Price Refresh — fresh excitement about a new price, not desperate. New opportunity for buyers. 2-3 sentences + 3 hashtags.",
  sold:          "Sold — celebratory, thank buyers/sellers, reflect on the journey. 3-4 sentences + 4 hashtags.",
};

export async function POST(req) {
  try {
    const { agent, listing, stage } = await req.json();

    const instructions = STAGE_INSTRUCTIONS[stage] || STAGE_INSTRUCTIONS.justListed;
    const priceText = listing.price ? `$${parseInt(listing.price).toLocaleString()}` : "";

    const prompt = `Write a single Instagram/Facebook real estate caption.

STAGE: ${instructions}

AGENT:
- Name: ${agent.name}
- Brokerage: ${agent.brokerage}
- Style: ${agent.style} (professional = polished & elegant, conversational = warm & personable, energetic = bold & exciting)
- License: ${agent.license}
- Mobile: ${agent.mobilePhone}

PROPERTY:
- Address: ${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}
${priceText ? `- Price: ${priceText}` : ""}
- ${listing.beds} bed · ${listing.baths} bath · ${parseInt(listing.sqft || 0).toLocaleString()} sqft
- Features: ${listing.features || "N/A"}
- Notes: ${listing.notes || "N/A"}

End the caption with this disclosure line (exact format):
${agent.name} | ${agent.brokerage} | License #${agent.license} | ${agent.mobilePhone}

Return ONLY the caption text. No markdown, no labels, no commentary.`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    });

    return Response.json({ ok: true, caption: message.content[0].text.trim() });
  } catch (err) {
    console.error("Caption regeneration error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
