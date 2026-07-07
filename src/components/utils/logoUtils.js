// Utility: resolves logo strings to valid absolute URLs
export function resolveLogo(logo) {
  if (!logo || !logo.trim()) return null;
  let cleaned = logo.trim();
  
  if (cleaned.includes("logo.clearbit.com/")) {
    cleaned = cleaned.split("logo.clearbit.com/")[1];
  } else if (cleaned.includes("icons.duckduckgo.com/ip3/")) {
    cleaned = cleaned.split("icons.duckduckgo.com/ip3/")[1].replace(".ico", "");
  } else if (cleaned.includes("favicons?sz=64&domain=")) {
    cleaned = cleaned.split("favicons?sz=64&domain=")[1].split("&")[0];
  } else if (cleaned.includes("faviconV2?")) {
    const urlParam = cleaned.split("url=")[1];
    if (urlParam) {
      cleaned = decodeURIComponent(urlParam);
    }
  }
  
  // Clean protocols, paths, query params
  cleaned = cleaned
    .replace(/^(https?:)?\/\//, "")
    .split("/")[0]
    .split("?")[0]
    .replace(/\.ico$/, "")
    .trim();

  if (cleaned.includes(".")) {
    return `https://t2.gstatic.com/faviconV2?client=gcom&size=64&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${cleaned}`;
  }
  return null; // Triggers dynamic letter fallback in UI
}

