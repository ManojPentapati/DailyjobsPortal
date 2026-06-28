import { Briefcase, Building2, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

function CountUp({ target, suffix = "+" }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const duration = 1800;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(eased * target));
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return (
    <span>{count.toLocaleString("en-IN")}<span className="text-amber-500 dark:text-amber-400">{suffix}</span></span>
  );
}

export default function StatisticsSection() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    companiesHiring: 0,
    newJobsToday: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      // Total Jobs
      const { count: totalJobs } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Companies Hiring
      const { data: companies } = await supabase
        .from("jobs")
        .select("company")
        .eq("is_active", true);
      const companiesHiring = new Set(companies?.map((c) => c.company)).size;

      // New Today
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      const { count: newJobsToday } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .gte("posted_date", yesterday.toISOString())
        .eq("is_active", true);

      setStats({
        totalJobs: totalJobs || 0,
        companiesHiring,
        newJobsToday: newJobsToday || 0,
      });
    }
    fetchStats();
  }, []);

  const statItems = [
    {
      value: stats.totalJobs, label: "Total Jobs", sublabel: "Across all categories",
      icon: Briefcase, suffix: "+",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-600 dark:text-amber-400",
    },
    {
      value: stats.companiesHiring, label: "Companies Hiring", sublabel: "Actively recruiting",
      icon: Building2, suffix: "+",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    {
      value: stats.newJobsToday, label: "New Today", sublabel: "Posted in last 24h",
      icon: Sparkles, suffix: "+",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      text: "text-amber-600 dark:text-amber-400",
    },
    {
      value: 98, label: "Placement Rate", sublabel: "Successful hires",
      icon: TrendingUp, suffix: "%",
      bg: "bg-violet-50 dark:bg-violet-950/40",
      text: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <section className="py-16 bg-white dark:bg-[#060c1a] border-y border-slate-100 dark:border-slate-800/50" id="stats-section" aria-labelledby="stats-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="stats-heading" className="section-heading">Trusted by Thousands of Professionals</h2>
          <p className="section-subheading">India's fastest-growing job platform for tech talent</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="card-flat p-6 flex items-center gap-4 hover:border-amber-200 dark:hover:border-slate-600 transition-colors duration-300" id={`stats-card-${item.label.replace(/\s/g,"-").toLowerCase()}`}>
                <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${item.text}`} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                    <CountUp target={item.value} suffix={item.suffix} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{item.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{item.sublabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
