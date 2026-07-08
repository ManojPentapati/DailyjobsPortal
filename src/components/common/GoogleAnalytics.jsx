import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function GoogleAnalytics() {
  const location = useLocation();
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!gaId) return;

    // Check if script is already added
    let scriptTag = document.getElementById("ga-gtag");
    if (!scriptTag) {
      // Add global tag script
      scriptTag = document.createElement("script");
      scriptTag.id = "ga-gtag";
      scriptTag.async = true;
      scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(scriptTag);

      // Add dataLayer helper
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
    }
  }, [gaId]);

  // Track pageviews on location (route) changes
  useEffect(() => {
    if (!gaId || !window.gtag) return;
    
    window.gtag("config", gaId, {
      page_path: location.pathname + location.search,
    });
  }, [location, gaId]);

  return null;
}
