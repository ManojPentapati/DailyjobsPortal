// Vercel serverless function that proxies Google's favicon API.
// Returns the real favicon (200) or a transparent 1x1 PNG (200) if Google 404s.
// This ensures the <img> tag in CompanyLogo NEVER gets a 404 response.

// 1x1 transparent PNG (68 bytes)
const TRANSPARENT_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==",
  "base64"
);

export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain || typeof domain !== "string" || !domain.includes(".")) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    return res.status(200).send(TRANSPARENT_PNG);
  }

  const sanitized = domain.toLowerCase().trim().replace(/[^a-z0-9.\-]/g, "");

  try {
    const upstream = await fetch(
      `https://www.google.com/s2/favicons?sz=64&domain=${sanitized}`,
      { redirect: "follow", signal: AbortSignal.timeout(4000) }
    );

    if (upstream.ok) {
      const buffer = Buffer.from(await upstream.arrayBuffer());
      // Only return if the response has actual content (not an error page)
      if (buffer.length > 100) {
        const contentType = upstream.headers.get("content-type") || "image/png";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
        return res.status(200).send(buffer);
      }
    }
  } catch (e) {
    // Network error, timeout, etc. — fall through to transparent pixel
  }

  // Fallback: return transparent 1x1 PNG with 200 status
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  return res.status(200).send(TRANSPARENT_PNG);
}
