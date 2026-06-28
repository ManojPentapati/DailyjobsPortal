import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, Clock, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { formatDistanceToNow } from "../utils/dateUtils";
import { resolveLogo } from "../utils/logoUtils";

export default function TodaysJobs() {
  const [todaysJobs, setTodaysJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodaysJobs() {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .gte("posted_date", yesterday.toISOString())
        .eq("is_active", true)
        .order("posted_date", { ascending: false })
        .limit(8);

      if (!error && data) {
        setTodaysJobs(data);
      }
      setLoading(false);
    }
    fetchTodaysJobs();
  }, []);

  return (
    <section className="py-20 bg-white dark:bg-[#060c1a]" aria-labelledby="todays-jobs-heading" id="todays-jobs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-full">
                <Zap className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Live Now</span>
              </div>
            </div>
            <h2 id="todays-jobs-heading" className="section-heading">Today's Openings</h2>
            <p className="section-subheading">Fresh listings — posted in the last 24 hours</p>
          </div>
          <Link to="/jobs" className="hidden sm:flex btn-secondary items-center gap-2 flex-shrink-0" id="todays-view-all">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-2.5">
          {loading ? (
            <div className="flex justify-center py-10"><span className="w-6 h-6 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin"></span></div>
          ) : todaysJobs.map((job, idx) => (
            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="group flex items-center gap-4 p-4 sm:p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/50 hover:border-amber-300 dark:hover:border-amber-700/40 hover:shadow-md transition-all duration-200 animate-slide-up"
              id={`todays-job-${job.id}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Logo */}
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-600">
                <img src={resolveLogo(job.company_logo || job.logo)} alt={job.company} className="w-full h-full object-contain p-1.5"
                  onError={(e) => {
                    e.currentTarget.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px" class="text-amber-600 dark:text-amber-400">${job.company[0]}</div>`;
                  }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
                      {job.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{job.company}</span>
                      <span className="text-xs text-slate-300 dark:text-slate-600">·</span>
                      <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                        <MapPin className="w-3 h-3" />{job.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="badge-new hidden sm:inline-flex">New</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />{formatDistanceToNow(job.postedDate)}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 mt-2 flex-wrap">
                  <span className="badge-type">{job.type}</span>
                  {job.salary && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{job.salary}</span>}
                  {job.skills.slice(0, 3).map(s => (
                    <span key={s} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded text-[11px] font-medium">{s}</span>
                  ))}
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          ))}
        </div>

        {!loading && todaysJobs.length === 0 && (
          <div className="text-center py-16 text-slate-400 dark:text-slate-600">No new jobs posted today. Check back soon!</div>
        )}
      </div>
    </section>
  );
}
