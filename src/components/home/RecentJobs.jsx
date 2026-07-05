import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import JobCard from "../jobs/JobCard";

export default function RecentJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      const { data } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("posted_date", { ascending: false })
        .limit(6);
      setJobs(data || []);
      setLoading(false);
    }
    fetchRecent();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center py-16">
          <span className="w-10 h-10 border-4 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16" id="recent-jobs">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-white">Recently Posted</h2>
          </div>
          <p className="text-sm text-stone-500 dark:text-slate-400">Fresh opportunities added today</p>
        </div>
        <Link
          to="/jobs"
          className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
        >
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
