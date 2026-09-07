const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
};

// ── Zillow parser ─────────────────────────────────────────────────────────────
function parseZillow(html) {
  const photos = [];
  const listing = {};

  const ndMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!ndMatch) return { photos, listing };

  const raw = ndMatch[1];
  // Normalize unicode escapes so regexes work uniformly
  const norm = raw.replace(/\\u002F/g, "/").replace(/\\u0026/g, "&");

  // ── Photos ──
  // Match zillowstatic.com/fp/ URLs and keep the highest-quality version of each
  const baseToUrl = new Map();
  const photoRe = /https?:\/\/photos\.zillowstatic\.com\/fp\/([a-zA-Z0-9_\-]+)(\.[a-z]{3,4})?/g;
  for (const [fullUrl, hash] of norm.matchAll(photoRe)) {
    if (fullUrl.includes("_cc_ft") || fullUrl.includes("-t.")) continue;
    // Prefer .jpg over .webp for Canvas compatibility; prefer uncropped/large variants
    const existing = baseToUrl.get(hash);
    const isJpg = fullUrl.endsWith(".jpg");
    const isLarge = fullUrl.includes("uncropped") || fullUrl.includes("_p_f") || fullUrl.includes("_p_g");
    if (!existing || (!baseToUrl.get(hash + "_best") && isLarge) || isJpg) {
      baseToUrl.set(hash, fullUrl);
      if (isLarge) baseToUrl.set(hash + "_best", true);
    }
  }
  for (const [key, url] of baseToUrl) {
    if (!key.endsWith("_best")) photos.push(url);
  }

  // ── Listing data — regex on the JSON string ──
  const g = (re) => { const m = norm.match(re); return m ? m[1] : ""; };
  listing.address  = g(/"streetAddress"\s*:\s*"([^"]+)"/);
  listing.city     = g(/"city"\s*:\s*"([^"]+)"/);
  listing.state    = g(/"state"\s*:\s*"([A-Z]{2})"/);
  listing.zip      = g(/"zipcode"\s*:\s*"([^"]+)"/);
  listing.price    = g(/"price"\s*:\s*(\d+)/);
  listing.beds     = g(/"bedrooms"\s*:\s*(\d+)/);
  listing.baths    = g(/"bathrooms"\s*:\s*([\d.]+)/);
  listing.sqft     = g(/"livingArea"\s*:\s*(\d+)/);
  listing.yearBuilt = g(/"yearBuilt"\s*:\s*(\d{4})/);
  listing.features = g(/"description"\s*:\s*"([^"]{20,300})"/);

  return { photos: photos.slice(0, 15), listing };
}

// ── Realtor.com parser ────────────────────────────────────────────────────────
function parseRealtor(html) {
  const photos = [];
  const listing = {};

  const ndMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!ndMatch) return { photos, listing };

  const norm = ndMatch[1].replace(/\\u002F/g, "/");

  // ap.rdcpix.com photo URLs
  const seen = new Set();
  const photoRe = /https?:\/\/ap\.rdcpix\.com\/[a-zA-Z0-9\/\-_]+\.jpg/g;
  for (const [url] of norm.matchAll(photoRe)) {
    if (url.includes("-t.jpg") || url.includes("thumbnail")) continue;
    if (!seen.has(url)) { seen.add(url); photos.push(url); }
  }

  const g = (re) => { const m = norm.match(re); return m ? m[1] : ""; };
  listing.address  = g(/"line"\s*:\s*"([^"]+)"/);
  listing.city     = g(/"city"\s*:\s*"([^"]+)"/);
  listing.state    = g(/"state_code"\s*:\s*"([A-Z]{2})"/);
  listing.zip      = g(/"postal_code"\s*:\s*"([^"]+)"/);
  listing.price    = g(/"list_price"\s*:\s*(\d+)/);
  listing.beds     = g(/"beds"\s*:\s*(\d+)/);
  listing.baths    = g(/"baths_consolidated"\s*:\s*"([\d.]+)"/);
  listing.sqft     = g(/"sqft"\s*:\s*(\d+)/);
  listing.yearBuilt = g(/"year_built"\s*:\s*(\d{4})/);

  return { photos: photos.slice(0, 15), listing };
}

// ── og:image fallback ─────────────────────────────────────────────────────────
function extractOgImages(html) {
  const photos = [];
  const re = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/gi;
  for (const [, url] of html.matchAll(re)) if (url.startsWith("http")) photos.push(url);
  return photos.slice(0, 1);
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url || !url.startsWith("http")) {
      return Response.json({ ok: false, error: "Invalid URL" }, { status: 400 });
    }

    const res = await fetch(url, { headers: FETCH_HEADERS, redirect: "follow" });
    if (!res.ok) {
      return Response.json({ ok: false, error: `Listing page returned ${res.status}` }, { status: 400 });
    }

    const html = await res.text();

    let photos = [];
    let listing = {};

    if (url.includes("zillow.com")) {
      ({ photos, listing } = parseZillow(html));
    } else if (url.includes("realtor.com")) {
      ({ photos, listing } = parseRealtor(html));
    } else {
      photos = extractOgImages(html);
    }

    return Response.json({ ok: true, photos, listing });
  } catch (err) {
    console.error("import-listing error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
