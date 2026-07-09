// Utility: resolves logo strings to valid absolute URLs.
// Uses our own /api/favicon proxy which NEVER returns 404.

const INVALID_DOMAIN_CHARS = /[()[\]{}<>!@#$%^&*+=|\\;:'"`,~\s]/;

function extractDomain(raw) {
  if (!raw || !raw.trim()) return null;
  const cleaned = raw.trim();

  let domain = "";

  if (cleaned.includes("url=http")) {
    const match = cleaned.match(/url=https?:\/\/([^&/?#]+)/);
    if (match && match[1]) domain = match[1];
  } else if (cleaned.includes("domain=")) {
    const match = cleaned.match(/domain=([^&/?#]+)/);
    if (match && match[1]) domain = match[1];
  } else if (cleaned.includes("logo.clearbit.com/")) {
    const parts = cleaned.split("logo.clearbit.com/");
    if (parts[1]) domain = parts[1].split("/")[0];
  } else if (cleaned.includes("icons.duckduckgo.com/ip3/")) {
    const parts = cleaned.split("icons.duckduckgo.com/ip3/");
    if (parts[1]) domain = parts[1].split("/")[0].replace(".ico", "");
  } else {
    const cleanUrl = cleaned.replace(/^(https?:)?\/\//, "");
    domain = cleanUrl.split("/")[0].split("?")[0].replace(/\.ico$/, "");
  }

  domain = domain.trim().toLowerCase();
  domain = domain.replace(/\.ico$/, "").replace(/\.com\.com$/, ".com");

  return domain;
}

export function resolveLogo(logo) {
  if (!logo || !logo.trim()) return null;

  const domain = extractDomain(logo);

  // Bail out for obviously-broken domains
  if (!domain || !domain.includes(".") || domain.length <= 3 || INVALID_DOMAIN_CHARS.test(domain)) {
    return null; // Letter avatar fallback
  }

  // Route through our own proxy — it NEVER returns 404,
  // so <img> tags won't log "Failed to load resource" errors.
  return `/api/favicon?domain=${encodeURIComponent(domain)}`;
}
