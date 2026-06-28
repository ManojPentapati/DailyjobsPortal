import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import JobCard from "../jobs/JobCard";
import { supabase } from "../../lib/supabase";

export default function LatestJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      // First try featured jobs
      let { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .order("posted_date", { ascending: false })
        .limit(6);

      // If no featured, get latest active jobs instead
      if (!error && (!data || data.length === 0)) {
        const result = await supabase
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .order("posted_date", { ascending: false })
          .limit(6);
        data = result.data;
        error = result.error;
      }

      if (!error && data) {
        setJobs(data);
      }
      setLoading(false);
    }
    fetchJobs();
  }, []);

  // Don't render section if no jobs at all
  if (!loading && jobs.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 bg-stone-50 dark:bg-[#0d1526]" aria-labelledby="latest-heading" id="latest-jobs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700/50">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">Latest Openings</span>
              </div>
            </div>
            <h2 id="latest-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">
              Fresh Opportunities
            </h2>
            <p className="mt-2 text-stone-500 dark:text-slate-400 text-base leading-relaxed">
              Recently posted roles from top companies
            </p>
          </div>
          <Link to="/jobs" className="hidden sm:flex items-center gap-2 flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-px bg-stone-100 dark:bg-white/[0.08] border border-stone-200 dark:border-white/[0.15] text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white" id="latest-view-all">
            View All Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <span className="w-7 h-7 border-2 border-stone-200 dark:border-slate-600 border-t-amber-500 rounded-full animate-spin"></span>
            </div>
          ) : jobs.map((job, i) => (
            <div key={job.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <JobCard job={job} />
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="sm:hidden mt-8 text-center">
          <Link to="/jobs" className="btn-primary inline-flex items-center gap-2">
            View All Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
