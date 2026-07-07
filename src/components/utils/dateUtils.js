// Utility: format date distance
export function formatDistanceToNow(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isToday(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export function isWithinHours(dateString, hours = 24) {
  const date = new Date(dateString);
  const now = new Date();
  return (now - date) / 3600000 <= hours;
}

// Returns expiry badge info: { label, colorClass, daysLeft }
export function getExpiryInfo(expiresAt) {
  if (!expiresAt) return null;
  const now = new Date();
  const exp = new Date(expiresAt);
  const diffMs = exp - now;
  if (diffMs <= 0) return { label: "Expired", colorClass: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50", daysLeft: 0 };
  const daysLeft = Math.ceil(diffMs / 86400000);
  if (daysLeft <= 1) return { label: "Expires today", colorClass: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50", daysLeft };
  if (daysLeft <= 3) return { label: `Expires in ${daysLeft}d`, colorClass: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/50", daysLeft };
  return { label: `Expires in ${daysLeft}d`, colorClass: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50", daysLeft };
}

// Returns estimated application time info: { label, colorClass }
export function getApplyTimeInfo(applyLink) {
  if (!applyLink) return null;
  const link = applyLink.toLowerCase();
  
  if (link.includes("docs.google.com/forms") || link.includes("forms.gle") || link.startsWith("mailto:")) {
    return { 
      label: "1-Min Apply", 
      colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50" 
    };
  }
  if (link.includes("greenhouse.io") || link.includes("lever.co")) {
    return { 
      label: "2-Min Apply", 
      colorClass: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50" 
    };
  }
  if (link.includes("workday") || link.includes("myworkdayjobs") || link.includes("smartrecruiters.com")) {
    return { 
      label: "4-Min Apply", 
      colorClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50" 
    };
  }
  return { 
    label: "3-Min Apply", 
    colorClass: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-350 dark:border-slate-700/50" 
  };
}

