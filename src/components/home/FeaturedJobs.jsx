import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import JobCard from "../jobs/JobCard";
import { supabase } from "../../lib/supabase";

export default function FeaturedJobs() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_featured", true)
        .eq("is_active", true)
        .order("posted_date", { ascending: false })
        .limit(6);

      if (!error && data) {
        setFeatured(data);
      }
      setLoading(false);
    }
    fetchFeatured();
  }, []);

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-950" aria-labelledby="featured-heading" id="featured-jobs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 rounded-full">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Featured</span>
              </div>
            </div>
            <h2 id="featured-heading" className="section-heading">Top Opportunities</h2>
            <p className="section-subheading max-w-md">Hand-picked roles from India's most sought-after companies</p>
          </div>
          <Link to="/jobs" className="hidden sm:flex btn-secondary items-center gap-2 flex-shrink-0" id="featured-view-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
             <div className="col-span-full flex justify-center py-10"><span className="w-6 h-6 border-2 border-slate-300 border-t-amber-500 rounded-full animate-spin"></span></div>
          ) : featured.map((job, i) => (
            <div key={job.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
              <JobCard job={job} />
            </div>
          ))}
        </div>

        <div className="sm:hidden mt-8 text-center">
          <Link to="/jobs" className="btn-primary">View All Jobs <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </section>
  );
}
