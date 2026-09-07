const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "max-age=0",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"macOS"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
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

// ── JSON-LD parser (schema.org — works for KW and many IDX sites) ─────────────
function parseJsonLD(html) {
  const photos = [];
  const listing = {};

  const blocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, raw] of blocks) {
    let data;
    try { data = JSON.parse(raw.trim()); } catch { continue; }

    // Walk arrays (some sites emit @graph)
    const items = Array.isArray(data) ? data : data["@graph"] ? data["@graph"] : [data];
    for (const item of items) {
      const type = (item["@type"] || "").toLowerCase();
      if (!/(residence|house|home|property|realestate|singlefamily|apartment|condo)/i.test(type)) continue;

      // Address
      const addr = item.address || {};
      if (addr.streetAddress) listing.address = addr.streetAddress;
      if (addr.addressLocality) listing.city = addr.addressLocality;
      if (addr.addressRegion)   listing.state = addr.addressRegion;
      if (addr.postalCode)      listing.zip   = addr.postalCode;

      // Details
      if (item.numberOfBedrooms)     listing.beds  = String(item.numberOfBedrooms);
      if (item.numberOfBathroomsTotal) listing.baths = String(item.numberOfBathroomsTotal);
      if (item.floorSize?.value)     listing.sqft  = String(Math.round(item.floorSize.value));
      if (item.yearBuilt)            listing.yearBuilt = String(item.yearBuilt);
      if (item.description)          listing.features  = item.description.slice(0, 300);

      // Price
      const price = item.offers?.price || item.price;
      if (price) listing.price = String(price).replace(/\D/g, "");

      // Photos
      const imgs = Array.isArray(item.image) ? item.image : item.image ? [item.image] : [];
      for (const img of imgs) {
        const src = typeof img === "string" ? img : img.url || img.contentUrl || "";
        if (src.startsWith("http")) photos.push(src);
      }
    }
  }
  return { photos: photos.slice(0, 15), listing };
}

// ── Broad image URL extractor — works on any page ────────────────────────────
function extractAllImageUrls(html) {
  const norm = html
    .replace(/\\u002F/g, "/")
    .replace(/\\u0022/g, '"')
    .replace(/\\"/g, '"');

  const seen = new Set();
  const photos = [];

  // 1. <img src="..."> tags
  const imgRe = /<img[^>]+src=["'](https?:\/\/[^"'>\s]+\.(?:jpe?g|png|webp))["']/gi;
  for (const [, url] of norm.matchAll(imgRe)) {
    if (!seen.has(url)) { seen.add(url); photos.push(url); }
  }

  // 2. Any quoted https URL ending in an image extension
  const urlRe = /["'`](https?:\/\/[^"'`\s<>\\]{10,}\.(?:jpe?g|png|webp))["'`]/gi;
  for (const [, url] of norm.matchAll(urlRe)) {
    if (!seen.has(url)) { seen.add(url); photos.push(url); }
  }

  // Filter out obvious non-listing images
  const skip = /\b(logo|icon|avatar|thumb(?:nail)?|sprite|banner|badge|map|pin|marker|headshot|profile|brand|favicon|placeholder|default|fallback|loader|spinner)\b/i;
  const filtered = photos.filter(u => {
    if (skip.test(u)) return false;
    // Skip very short URLs — likely placeholders
    if (u.length < 30) return false;
    return true;
  });

  return [...new Set(filtered)].slice(0, 20);
}

// ── KW.com parser ─────────────────────────────────────────────────────────────
function parseKW(html) {
  // Try JSON-LD first (KW platform uses schema.org)
  const { photos: ldPhotos, listing: ldListing } = parseJsonLD(html);

  // Also try __NEXT_DATA__ for listing fields
  const ndMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (ndMatch && !ldListing.address) {
    const nd = ndMatch[1].replace(/\\u002F/g, "/");
    const g = (re) => { const m = nd.match(re); return m ? m[1] : ""; };
    ldListing.address   = ldListing.address   || g(/"streetAddress"\s*:\s*"([^"]+)"/);
    ldListing.city      = ldListing.city       || g(/"city"\s*:\s*"([^"]+)"/);
    ldListing.state     = ldListing.state      || g(/"state(?:Code)?"\s*:\s*"([A-Z]{2})"/);
    ldListing.zip       = ldListing.zip        || g(/"zip(?:code|Code)?"\s*:\s*"([^"]+)"/);
    ldListing.price     = ldListing.price      || g(/"(?:listPrice|list_price|price)"\s*:\s*(\d+)/);
    ldListing.beds      = ldListing.beds       || g(/"(?:beds|bedrooms)"\s*:\s*(\d+)/);
    ldListing.baths     = ldListing.baths      || g(/"(?:baths|bathrooms)"\s*:\s*([\d.]+)/);
    ldListing.sqft      = ldListing.sqft       || g(/"(?:sqft|squareFeet|livingArea)"\s*:\s*(\d+)/);
    ldListing.yearBuilt = ldListing.yearBuilt  || g(/"yearBuilt"\s*:\s*(\d{4})/);
  }

  // Use broad extractor for photos — KW CDN domain varies by agent/market
  const broadPhotos = extractAllImageUrls(html);

  // Merge: JSON-LD photos first (highest confidence), then broad scan
  const allPhotos = [...new Set([...ldPhotos, ...broadPhotos])].slice(0, 15);
  return { photos: allPhotos, listing: ldListing };
}

// ── og:image + JSON-LD generic fallback ───────────────────────────────────────
function parseGeneric(html) {
  const { photos: ldPhotos, listing: ldListing } = parseJsonLD(html);
  const broadPhotos = extractAllImageUrls(html);
  const allPhotos = [...new Set([...ldPhotos, ...broadPhotos])].slice(0, 15);
  return { photos: allPhotos, listing: ldListing };
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const { url } = await req.json();
    if (!url || !url.startsWith("http")) {
      return Response.json({ ok: false, error: "Invalid URL" }, { status: 400 });
    }

    const scraperKey = process.env.SCRAPER_API_KEY;
    // render=true uses headless Chrome so JS-rendered photos (KW, etc.) are included
    const fetchUrl = scraperKey
      ? `http://api.scraperapi.com?api_key=${scraperKey}&url=${encodeURIComponent(url)}&render=true&wait=3000`
      : url;
    const fetchOpts = scraperKey
      ? {}
      : { headers: FETCH_HEADERS, redirect: "follow" };

    const res = await fetch(fetchUrl, fetchOpts);
    if (!res.ok) {
      const msg =
        res.status === 429 || res.status === 403
          ? "This listing site is blocking automated access. Try your KW listing link, or upload photos manually below."
          : res.status === 500
          ? "The listing site returned an error. Try a different listing link, or upload photos manually below."
          : `Listing page returned ${res.status}`;
      return Response.json({ ok: false, error: msg }, { status: 400 });
    }

    const html = await res.text();

    let photos = [];
    let listing = {};

    if (url.includes("zillow.com")) {
      ({ photos, listing } = parseZillow(html));
    } else if (url.includes("realtor.com")) {
      ({ photos, listing } = parseRealtor(html));
    } else if (url.includes("kw.com")) {
      ({ photos, listing } = parseKW(html));
    } else {
      ({ photos, listing } = parseGeneric(html));
    }

    return Response.json({ ok: true, photos, listing });
  } catch (err) {
    console.error("import-listing error:", err);
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
