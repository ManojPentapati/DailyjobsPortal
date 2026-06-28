import { useEffect, useRef, useState } from "react";

function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const raf = useRef(null);

  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

export default function StatisticsCard({ value, label, icon: Icon, color = "amber", suffix = "+" }) {
  const numericValue = typeof value === "string" ? parseInt(value.replace(/,/g, "")) : value;
  const animated = useCountUp(numericValue);

  const colorMap = {
    blue:   { bg: "bg-blue-600", light: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600 dark:text-blue-400" },
    emerald:{ bg: "bg-emerald-600", light: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600 dark:text-emerald-400" },
    violet: { bg: "bg-violet-600", light: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
    amber:  { bg: "bg-amber-500", light: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600 dark:text-amber-400" },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className={`card-flat p-6 flex items-center gap-4`} id={`stats-card-${label.replace(/\s/g, "-").toLowerCase()}`}>
      <div className={`w-14 h-14 ${colors.light} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-7 h-7 ${colors.text}`} />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
          {animated.toLocaleString("en-IN")}
          <span className={`text-xl ${colors.text}`}>{suffix}</span>
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
}
