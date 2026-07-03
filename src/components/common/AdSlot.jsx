import { useEffect } from "react";

export default function AdSlot({ slot, format = "auto", className = "", style = {} }) {
  // Read AdSense Client ID from Vite environment variables
  const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT;

  useEffect(() => {
    // If client ID is configured, load the Google AdSense script and push the ad
    if (adsenseClient) {
      try {
        // Check if script is already injected
        const scriptId = "adsbygoogle-script";
        if (!document.getElementById(scriptId)) {
          const script = document.createElement("script");
          script.id = scriptId;
          script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`;
          script.async = true;
          script.crossOrigin = "anonymous";
          document.head.appendChild(script);
        }

        // Push ad unit init to window
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense initialization failed:", err);
      }
    }
  }, [adsenseClient]);

  // If no AdSense client is configured, show a beautiful premium placeholder
  if (!adsenseClient) {
    return (
      <div 
        className={`w-full py-8 px-6 border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/10 rounded-2xl flex flex-col items-center justify-center text-center select-none ${className}`}
        style={{ minHeight: "100px", ...style }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-slate-500 mb-1">
          Sponsored Advertisement
        </span>
        <span className="text-xs text-stone-400/80 dark:text-slate-600">
          Placeholder Slot (Configured via VITE_ADSENSE_CLIENT)
        </span>
      </div>
    );
  }

  // Render the official Google AdSense code structure
  return (
    <div className={`adsense-wrapper overflow-hidden w-full ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={adsenseClient}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
