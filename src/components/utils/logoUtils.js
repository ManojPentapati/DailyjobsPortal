// Utility: resolves logo strings to valid absolute URLs
export function resolveLogo(logo) {
  if (!logo || !logo.trim()) return null;
  const cleaned = logo.trim();
  
  if (cleaned.includes("logo.clearbit.com/")) {
    const domain = cleaned.split("logo.clearbit.com/")[1].replace(/^(https?:)?\/\//, "");
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}&fallback=sitemap`;
  }
  
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://") || cleaned.startsWith("data:")) {
    if (cleaned.includes("favicons?sz=64&domain=")) {
      const parts = cleaned.split("favicons?sz=64&domain=");
      const domainPart = parts[1].split("&")[0].replace(/^(https?:)?\/\//, "");
      return `https://www.google.com/s2/favicons?sz=64&domain=${domainPart}&fallback=sitemap`;
    }
    return cleaned;
  }
  
  if (cleaned.includes(".")) {
    const domain = cleaned.replace(/^(https?:)?\/\//, "");
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}&fallback=sitemap`;
  }
  return cleaned;
}

