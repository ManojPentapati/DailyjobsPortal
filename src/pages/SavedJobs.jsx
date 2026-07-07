import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Trash2, ArrowLeft } from "lucide-react";
import { useJobs } from "../context/JobContext";
import JobCard from "../components/jobs/JobCard";
import EmptyState from "../components/common/EmptyState";

export default function SavedJobs() {
  const { getJobById, savedJobs, clearAllSavedJobs } = useJobs();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSavedJobs = useCallback(async () => {
    setLoading(true);
    try {
      if (savedJobs.length === 0) {
        setJobs([]);
        setLoading(false);
        return;
      }
      const results = await Promise.all(savedJobs.map((id) => getJobById(id)));
      setJobs(results.filter(Boolean));
    } catch {
      setJobs([]);
    }
    setLoading(false);
  }, [getJobById, savedJobs]);

  useEffect(() => {
    loadSavedJobs();

    // SEO
    document.title = "Saved Jobs – Daily Jobs Portal";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = "View your saved and bookmarked job listings on Daily Jobs Portal.";

    return () => {
      document.title = "Daily Jobs Portal – Find Your Next Tech Opportunity";
      const m = document.querySelector('meta[name="description"]');
      if (m) m.content = "Daily Jobs Portal – Find your next tech opportunity in India.";
    };
  }, [loadSavedJobs]);

  const clearAll = () => {
    clearAllSavedJobs();
    setJobs([]);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="saved-jobs-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            to="/jobs"
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">Saved Jobs</h1>
              <p className="text-xs text-stone-400 dark:text-slate-500">{jobs.length} saved</p>
            </div>
          </div>
        </div>
        {jobs.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            id="clear-saved-jobs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="w-10 h-10 border-4 border-slate-300 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          variant="empty"
          title="No Saved Jobs"
          description="You haven't bookmarked any jobs yet. Browse jobs and tap the bookmark icon to save them here."
          action={
            <Link to="/jobs" className="btn-primary">
              Browse Jobs
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </main>
  );
}
