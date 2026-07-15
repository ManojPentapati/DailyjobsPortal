import { useEffect, useState, Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { useJobs } from "../context/JobContext";
import JobCard from "../components/jobs/JobCard";
import FilterSidebar from "../components/jobs/FilterSidebar";
import Pagination from "../components/common/Pagination";
import EmptyState from "../components/common/EmptyState";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import SearchBar from "../components/common/SearchBar";
import AdSlot from "../components/common/AdSlot";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "relevant", label: "Most Applied" },
];

export default function JobListings() {
  const { state, dispatch, paginatedJobs, totalPages, totalJobs, loading } = useJobs();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    const comp = searchParams.get("company");
    const jobType = searchParams.get("type");
    if (cat) {
      dispatch({ type: "CLEAR_FILTERS" }).then(() => {
        dispatch({ type: "SET_FILTER", payload: { key: "category", value: cat, checked: true } });
      });
    } else if (comp) {
      dispatch({ type: "CLEAR_FILTERS" }).then(() => {
        dispatch({ type: "SET_FILTER", payload: { key: "company", value: comp, checked: true } });
      });
    } else if (jobType) {
      dispatch({ type: "CLEAR_FILTERS" }).then(() => {
        dispatch({ type: "SET_FILTER", payload: { key: "type", value: jobType, checked: true } });
      });
    }
  }, [searchParams]);

  // Dynamic SEO Title and Meta Description
  useEffect(() => {
    let title = "Browse Jobs – Daily Jobs Portal";
    let desc = "Browse thousands of curated tech job listings on Daily Jobs Portal. Find your next opportunity in Bangalore, Hyderabad, remote, and more.";

    const activeCategories = state.filters.category || [];
    const activeLocations = state.filters.location || [];
    const search = state.searchQuery;

    if (activeCategories.length && activeLocations.length) {
      title = `${activeCategories[0]} Jobs in ${activeLocations[0]} – Daily Jobs Portal`;
      desc = `Find the best ${activeCategories[0]} jobs in ${activeLocations[0]}. Apply for fresh opportunities now on Daily Jobs Portal!`;
    } else if (activeCategories.length) {
      title = `${activeCategories[0]} Jobs – Daily Jobs Portal`;
      desc = `Find the latest ${activeCategories[0]} jobs. Apply for fresh opportunities now on Daily Jobs Portal!`;
    } else if (activeLocations.length) {
      title = `Tech Jobs in ${activeLocations[0]} – Daily Jobs Portal`;
      desc = `Find the latest tech and software jobs in ${activeLocations[0]}. Apply for verified opportunities now on Daily Jobs Portal!`;
    } else if (search) {
      title = `Search results for "${search}" – Daily Jobs Portal`;
      desc = `Browse job openings matching "${search}". Apply for fresh opportunities now on Daily Jobs Portal!`;
    }

    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = desc;

    // Update OpenGraph
    const ogTags = { "og:title": title, "og:description": desc };
    Object.entries(ogTags).forEach(([prop, content]) => {
      const tag = document.querySelector(`meta[property="${prop}"]`);
      if (tag) tag.content = content;
    });

    // Cleanup to restore defaults on unmount
    return () => {
      const defaultTitle = "Daily Jobs Portal – Find Your Next Tech Opportunity";
      const defaultDesc = "Daily Jobs Portal – Find your next tech opportunity in India. Browse thousands of curated jobs in software development, AI/ML, data science, cloud computing, DevOps, and more.";
      document.title = defaultTitle;

      const mDesc = document.querySelector('meta[name="description"]');
      if (mDesc) mDesc.content = defaultDesc;

      const defaultOg = { 
        "og:title": "Daily Jobs Portal – Find Your Next Opportunity", 
        "og:description": "Connecting India's top tech talent with the best companies."
      };
      Object.entries(defaultOg).forEach(([prop, content]) => {
        const t = document.querySelector(`meta[property="${prop}"]`);
        if (t) t.content = content;
      });
    };
  }, [state.filters.category, state.filters.location, state.searchQuery]);

  const handleSort = (e) => dispatch({ type: "SET_SORT", payload: e.target.value });
  const handlePage = (page) => {
    dispatch({ type: "SET_PAGE", payload: page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main id="job-listings-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar – Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden btn-secondary text-sm py-2 px-3"
                  id="mobile-filter-btn"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {Object.values(state.filters).flat().length > 0 && (
                    <span className="ml-1 w-5 h-5 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center">
                      {Object.values(state.filters).flat().length}
                    </span>
                  )}
                </button>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {state.searchQuery || Object.values(state.filters).flat().length > 0 ? (
                    <>
                      <span className="font-semibold text-slate-900 dark:text-white">{totalJobs}</span> results
                      {state.searchQuery && <> for "<span className="font-medium">{state.searchQuery}</span>"</>}
                    </>
                  ) : totalJobs === 0 ? (
                    "No jobs uploaded"
                  ) : (
                    <>
                      <span className="font-semibold text-slate-900 dark:text-white">{totalJobs}</span> {totalJobs === 1 ? "job" : "jobs"} available
                    </>
                  )}
                </p>
              </div>

              {/* Middle Search Bar */}
              <div className="flex-1 max-w-xs sm:max-w-md w-full my-1 sm:my-0">
                <SearchBar placeholder="Search jobs, skills, companies..." />
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                <select
                  value={state.sortBy}
                  onChange={handleSort}
                  className="input-field py-2 text-xs w-full sm:w-40"
                  id="sort-select"
                  aria-label="Sort jobs"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filters chips */}
            {Object.values(state.filters).flat().length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5" id="active-filters">
                {Object.entries(state.filters).flatMap(([key, values]) =>
                  values.map((val) => (
                    <span
                      key={`${key}-${val}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-700/50"
                    >
                      {val}
                      <button
                        onClick={() => dispatch({ type: "SET_FILTER", payload: { key, value: val, checked: false } })}
                        aria-label={`Remove filter: ${val}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))
                )}
                <button
                  onClick={() => dispatch({ type: "CLEAR_FILTERS" })}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-2"
                  id="clear-all-filters"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Job Grid */}
            {loading ? (
              <LoadingSkeleton count={9} />
            ) : paginatedJobs.length === 0 ? (
              <EmptyState
                variant={Object.values(state.filters).flat().length > 0 || state.searchQuery ? "search" : "empty"}
                title={Object.values(state.filters).flat().length > 0 || state.searchQuery ? "No jobs found" : "No Jobs Uploaded Yet"}
                description={Object.values(state.filters).flat().length > 0 || state.searchQuery ? "Try adjusting your search or filters to find more results." : "We are working to upload new opportunities soon. Please check back later!"}
                action={
                  (Object.values(state.filters).flat().length > 0 || state.searchQuery) ? (
                    <button
                      onClick={() => dispatch({ type: "CLEAR_FILTERS" })}
                      className="btn-primary"
                      id="clear-filters-empty"
                    >
                      Clear All Filters
                    </button>
                  ) : null
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginatedJobs.map((job, idx) => (
                  <Fragment key={job.id}>
                    <JobCard job={job} />
                    {(idx + 1) % 6 === 0 && (
                      <AdSlot slot="feed-native" className="col-span-1" style={{ minHeight: "160px" }} />
                    )}
                  </Fragment>
                ))}
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={state.currentPage}
              totalPages={totalPages}
              onPageChange={handlePage}
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-filter-drawer">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div
            className="absolute left-0 right-0 bottom-0 bg-white dark:bg-slate-900 rounded-t-3xl overflow-y-auto shadow-2xl"
            style={{ maxHeight: "85vh", animation: "slideUpSheet 0.3s ease-out" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
            <div className="p-4">
              <FilterSidebar onClose={() => setShowFilters(false)} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
