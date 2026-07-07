// Utility: resolves logo strings to valid absolute URLs
export function resolveLogo(logo) {
  if (!logo || !logo.trim()) return null;
  const cleaned = logo.trim();

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

  if (domain && domain.includes(".") && domain.length > 3) {
    return `https://t2.gstatic.com/faviconV2?client=gcom&size=64&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent("https://" + domain)}`;
  }
  return null; // Triggers dynamic letter fallback in UI
}

