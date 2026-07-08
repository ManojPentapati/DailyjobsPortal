// Utility: resolves logo strings to valid absolute URLs
// Returns null for obviously-bad domains so CompanyLogo renders a letter avatar instead.

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

  // Bail out for obviously-broken domains (e.g. "cisf).com", "eyglobaldeliveryservices(gds).com")
  if (!domain || !domain.includes(".") || domain.length <= 3 || INVALID_DOMAIN_CHARS.test(domain)) {
    return null; // Triggers dynamic letter fallback in UI
  }

  // Use the canonical Google favicons endpoint (most reliable, supports sz parameter)
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}
