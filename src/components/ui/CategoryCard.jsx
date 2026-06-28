import {
  Code2, BarChart3, Brain, TestTube2, Cloud,
  Shield, Palette, GitBranch, ArrowUpRight, Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";

const iconMap = { Code2, BarChart3, Brain, TestTube2, Cloud, Shield, Palette, GitBranch, Briefcase };

const colorMap = {
  blue:   { icon: "text-blue-600 dark:text-blue-400",   bg: "bg-blue-100 dark:bg-blue-900/30",    ring: "ring-blue-200 dark:ring-blue-800",   hover: "hover:border-blue-300 dark:hover:border-blue-600", badge: "bg-blue-600" },
  amber:  { icon: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-900/30",    ring: "ring-amber-200 dark:ring-amber-800",   hover: "hover:border-amber-300 dark:hover:border-amber-600", badge: "bg-amber-600" },
  purple: { icon: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-900/30", ring: "ring-violet-200 dark:ring-violet-800", hover: "hover:border-violet-300 dark:hover:border-violet-600", badge: "bg-violet-600" },
  pink:   { icon: "text-pink-600 dark:text-pink-400",   bg: "bg-pink-100 dark:bg-pink-900/30",    ring: "ring-pink-200 dark:ring-pink-800",   hover: "hover:border-pink-300 dark:hover:border-pink-600", badge: "bg-pink-600" },
  green:  { icon: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30", ring: "ring-emerald-200 dark:ring-emerald-800", hover: "hover:border-emerald-300 dark:hover:border-emerald-600", badge: "bg-emerald-600" },
  cyan:   { icon: "text-cyan-600 dark:text-cyan-400",   bg: "bg-cyan-100 dark:bg-cyan-900/30",    ring: "ring-cyan-200 dark:ring-cyan-800",   hover: "hover:border-cyan-300 dark:hover:border-cyan-600", badge: "bg-cyan-600" },
  red:    { icon: "text-red-600 dark:text-red-400",     bg: "bg-red-100 dark:bg-red-900/30",      ring: "ring-red-200 dark:ring-red-800",     hover: "hover:border-red-300 dark:hover:border-red-600", badge: "bg-red-600" },
  orange: { icon: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30", ring: "ring-orange-200 dark:ring-orange-800", hover: "hover:border-orange-300 dark:hover:border-orange-600", badge: "bg-orange-600" },
  teal:   { icon: "text-teal-600 dark:text-teal-400",   bg: "bg-teal-100 dark:bg-teal-900/30",    ring: "ring-teal-200 dark:ring-teal-800",   hover: "hover:border-teal-300 dark:hover:border-teal-600", badge: "bg-teal-600" },
  indigo: { icon: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/30", ring: "ring-indigo-200 dark:ring-indigo-800", hover: "hover:border-indigo-300 dark:hover:border-indigo-600", badge: "bg-indigo-600" },
  yellow: { icon: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30", ring: "ring-yellow-200 dark:ring-yellow-800", hover: "hover:border-yellow-300 dark:hover:border-yellow-600", badge: "bg-yellow-600" },
};

export default function CategoryCard({ category }) {
  const Icon = iconMap[category.icon] || Code2;
  const colors = colorMap[category.color] || colorMap.amber;

  return (
    <Link
      to={`/jobs?category=${encodeURIComponent(category.name)}`}
      className={`group border-2 border-stone-200 dark:border-white/[0.06] ${colors.hover} p-3 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 hover:shadow-lg active:scale-[0.97] sm:hover:-translate-y-1.5 transition-all duration-300 rounded-2xl bg-white dark:bg-white/[0.04]`}
      aria-label={`Browse ${category.name} jobs`}
      id={`category-card-${category.id}`}
    >
      <div className={`w-10 h-10 sm:w-14 sm:h-14 ${colors.bg} rounded-xl sm:rounded-2xl flex items-center justify-center ring-1 ${colors.ring} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${colors.icon}`} />
      </div>
      <div>
        <h3 className="font-semibold text-stone-800 dark:text-slate-100 text-xs sm:text-sm leading-tight mb-1 sm:mb-1.5 group-hover:text-stone-900 dark:group-hover:text-white transition-colors line-clamp-2">
          {category.name}
        </h3>
        <div className="flex items-center justify-center gap-1">
          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold text-white ${colors.badge}`}>
            {category.count} Jobs
          </span>
          <ArrowUpRight className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${colors.icon} opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
      </div>
    </Link>
  );
}
