import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { agent, listing } = await req.json();

    const prompt = `You are a real estate marketing expert. Generate complete listing launch content for an agent.

AGENT INFO:
- Name: ${agent.name}
- Brokerage: ${agent.brokerage}
- TN License #: ${agent.license}
- Office Phone: ${agent.officePhone}
- Mobile Phone: ${agent.mobilePhone}
- Posting style: ${agent.style} (professional = polished & elegant, conversational = warm & personable, energetic = bold & exciting)

LISTING INFO:
- Address: ${listing.address}
- City/State/Zip: ${listing.city}, ${listing.state} ${listing.zip}
- Price: $${listing.price}
- Bedrooms: ${listing.beds}
- Bathrooms: ${listing.baths}
- Square Feet: ${listing.sqft}
- Year Built: ${listing.yearBuilt || "N/A"}
- Key Features: ${listing.features || "N/A"}
- Agent's Notes / Selling Points: ${listing.notes || "N/A"}

Generate ALL of the following and return ONLY valid JSON (no markdown, no explanation):

{
  "landingPage": {
    "headline": "A compelling 6-10 word headline for this property",
    "subheadline": "A 1-sentence hook that captures the lifestyle this home offers",
    "description": "A 3-4 sentence property description that paints a picture of living there. Warm and compelling, not just facts.",
    "highlights": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "neighborhood": "2-3 sentences about the neighborhood, local lifestyle, and what makes the area desirable. Use general knowledge about the city/area.",
    "schools": "1-2 sentences about the school district in the area and what families should know.",
    "marketContext": "2 sentences of local market context for ${listing.city} — mention that it's a competitive/desirable area and what that means for buyers.",
    "callToAction": "A short, punchy CTA phrase (5-8 words) to schedule a showing"
  },
  "captions": {
    "justListed": "Instagram/Facebook caption for a Just Listed post. Match the agent's ${agent.style} style. 3-4 sentences + 5 relevant hashtags. Include price and key details naturally. End with a disclosure line: '${agent.name} | ${agent.brokerage} | License #${agent.license} | ${agent.mobilePhone}'",
    "underContract": "Instagram/Facebook caption for an Under Contract post. Celebratory, thank the community. Match ${agent.style} style. 2-3 sentences + 3 hashtags. End with: '${agent.name} | ${agent.brokerage} | License #${agent.license}'",
    "priceReduced": "Instagram/Facebook caption for a Price Reduced post. Urgent but not desperate. Highlight the new opportunity. Match ${agent.style} style. 2-3 sentences + 3 hashtags. End with: '${agent.name} | ${agent.brokerage} | License #${agent.license} | ${agent.mobilePhone}'",
    "sold": "Instagram/Facebook caption for a Sold post. Celebratory, thank the buyers/sellers, reflect on the journey. Match ${agent.style} style. 3-4 sentences + 4 hashtags. End with: '${agent.name} | ${agent.brokerage} | License #${agent.license}'"
  },
  "graphicText": {
    "justListed": { "headline": "JUST LISTED", "price": "$${listing.price}", "tagline": "5-6 word punchy tagline for the graphic" },
    "underContract": { "headline": "UNDER CONTRACT", "tagline": "4-5 word celebratory tagline" },
    "priceReduced": { "headline": "PRICE REDUCED", "price": "$${listing.price}", "tagline": "5-6 word urgency tagline" },
    "sold": { "headline": "SOLD", "tagline": "4-5 word celebration tagline" }
  }
}`;

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");

    const generated = JSON.parse(jsonMatch[0]);
    return Response.json({ ok: true, generated, listing, agent });
  } catch (err) {
    console.error("Listing launch generation error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
