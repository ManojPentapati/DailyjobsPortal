import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { resolveLogo } from "../utils/logoUtils";

export default function CompanyLogo({ logo, company, className = "w-12 h-12" }) {
  const [error, setError] = useState(false);
  const resolved = resolveLogo(logo);

  useEffect(() => {
    setError(false);
  }, [logo]);

  if (error || !resolved) {
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
      <div className={`${className} bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center font-bold shrink-0 border border-slate-200/20 dark:border-white/10 select-none`} style={{ fontSize: '1.25rem' }}>
        {firstLetter || <Building2 className="w-1/2 h-1/2" />}
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={company}
      className={`${className} object-contain p-1 bg-white rounded-lg border border-slate-100 dark:border-slate-800 shrink-0`}
      onError={() => setError(true)}
    />
  );
}
