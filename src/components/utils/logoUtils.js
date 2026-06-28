// Utility: resolves logo strings to valid absolute URLs
export function resolveLogo(logo) {
  if (!logo || !logo.trim()) return null;
  const cleaned = logo.trim();
  
  if (cleaned.includes("logo.clearbit.com/")) {
    const domain = cleaned.split("logo.clearbit.com/")[1];
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  }
  
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://") || cleaned.startsWith("data:")) {
    return cleaned;
  }
  
  if (cleaned.includes(".")) {
    return `https://www.google.com/s2/favicons?sz=64&domain=${cleaned}`;
  }
  return cleaned;
}

