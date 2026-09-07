// Trusted real-estate photo CDN domain fragments
const ALLOWED_FRAGMENTS = [
  "photos.zillowstatic.com",
  "ap.rdcpix.com",
  "rdcpix.com",
  "media.realtor.com",
  "photos.mlslistings.com",
  "kwcdn.com",          // Keller Williams CDN
  "kw.com",            // KW agent sites
  "kwrealty.com",
  "mlsimages.net",
  "mlsphoto.com",
];

// Also allow any URL that clearly looks like a listing photo (image extension + photo/listing CDN pattern)
function isPhotoUrlAllowed(url) {
  if (ALLOWED_FRAGMENTS.some((f) => url.includes(f))) return true;
  // Allow image URLs from domains that contain real-estate-adjacent keywords
  try {
    const hostname = new URL(url).hostname;
    const isImageExt = /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url);
    const looksLikeCdn = /\b(cdn|photo|image|media|listing|property|static|assets)\b/i.test(hostname);
    return isImageExt && looksLikeCdn;
  } catch { return false; }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const photoUrl = searchParams.get("url");
    if (!photoUrl) return new Response("Missing url", { status: 400 });

    if (!isPhotoUrlAllowed(photoUrl)) return new Response("Domain not allowed", { status: 403 });

    const res = await fetch(photoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://www.zillow.com/",
      },
    });

    if (!res.ok) return new Response("Photo fetch failed", { status: res.status });

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response("Proxy error: " + err.message, { status: 500 });
  }
}
