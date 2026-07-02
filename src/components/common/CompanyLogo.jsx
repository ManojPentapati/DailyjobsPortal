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
    return (
      <div className={`${className} bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/60 shrink-0`}>
        <Building2 className="w-1/2 h-1/2" />
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
