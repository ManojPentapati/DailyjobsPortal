import { useState, useEffect, useRef } from "react";
import { Building2 } from "lucide-react";
import { resolveLogo } from "../utils/logoUtils";

// In-memory cache shared across all CompanyLogo instances for the page session.
// Stores domain → "ok" | "fail" to avoid re-fetching the same favicon URL.
const validatedCache = new Map();

function LetterAvatar({ company, className }) {
  const firstLetter = company ? company.trim().charAt(0).toUpperCase() : "";
  const colors = [
    "from-rose-450 to-red-550 text-white",
    "from-amber-500 to-orange-600 text-white",
    "from-emerald-550 to-teal-650 text-white",
    "from-blue-500 to-indigo-600 text-white",
    "from-violet-550 to-purple-650 text-white",
    "from-pink-500 to-rose-600 text-white"
  ];
  const charSum = company ? company.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) : 0;
  const gradient = colors[charSum % colors.length];

  return (
    <div
      className={`${className} bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center font-bold shrink-0 border border-slate-200/20 dark:border-white/10 select-none`}
      style={{ fontSize: "1.25rem" }}
    >
      {firstLetter || <Building2 className="w-1/2 h-1/2" />}
    </div>
  );
}

export default function CompanyLogo({ logo, company, className = "w-12 h-12" }) {
  // "pending" = checking URL, "ok" = image is valid, "fail" = show letter avatar
  const [status, setStatus] = useState("pending");
  const resolved = resolveLogo(logo);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!resolved) {
      setStatus("fail");
      return;
    }

    // Check the in-memory cache first
    const cached = validatedCache.get(resolved);
    if (cached) {
      setStatus(cached);
      return;
    }

    // Pre-validate with fetch() — a fetch 404 does NOT log to the browser console,
    // whereas an <img> 404 always does.
    setStatus("pending");
    fetch(resolved, { mode: "no-cors", cache: "force-cache" })
      .then((res) => {
        // With no-cors, response is opaque (status 0) but if we get a response at all, the resource exists.
        // For same-origin or CORS-allowed, we can check res.ok directly.
        if (res.type === "opaque" || res.ok) {
          validatedCache.set(resolved, "ok");
          if (mountedRef.current) setStatus("ok");
        } else {
          validatedCache.set(resolved, "fail");
          if (mountedRef.current) setStatus("fail");
        }
      })
      .catch(() => {
        validatedCache.set(resolved, "fail");
        if (mountedRef.current) setStatus("fail");
      });
  }, [resolved]);

  if (status !== "ok" || !resolved) {
    return <LetterAvatar company={company} className={className} />;
  }

  return (
    <img
      src={resolved}
      alt={company}
      className={`${className} object-contain p-1 bg-white rounded-lg border border-slate-100 dark:border-slate-800 shrink-0`}
      onError={() => {
        validatedCache.set(resolved, "fail");
        setStatus("fail");
      }}
    />
  );
}
