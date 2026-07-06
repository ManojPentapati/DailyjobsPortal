import { useJobs } from "../../context/JobContext";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

// Static options that don't change based on data
const STATIC_JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const STATIC_SALARY_RANGES = ["0-5 LPA", "5-10 LPA", "10-20 LPA", "20+ LPA"];

function FilterSection({ section, selected, onToggle, loading, initialOpen = false }) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between w-full mb-3 text-left"
        aria-expanded={open}
        id={`filter-section-${section.key}`}
      >
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {section.label}
          {selected.length > 0 && (
            <span className="ml-2 badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
              {selected.length}
            </span>
          )}
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="flex flex-col gap-2 max-h-44 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col gap-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
              ))}
            </div>
          ) : section.options.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No options available</p>
          ) : (
            section.options.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2.5 cursor-pointer group"
                id={`filter-${section.key}-${opt.replace(/\s/g, "-")}`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={(e) => onToggle(section.key, opt, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-amber-500 focus:ring-amber-500"
                  aria-label={`Filter by ${section.label}: ${opt}`}
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors leading-tight">
                  {opt}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function FilterSidebar({ onClose }) {
  const { state, dispatch } = useJobs();
  const { filters } = state;
  const [loading, setLoading] = useState(true);
  const [dynamicOptions, setDynamicOptions] = useState({
    location: [],
    experience: [],
    category: [],
    company: [],
    qualification: [],
    passout_year: [],
  });

  useEffect(() => {
    async function fetchFilterOptions() {
      setLoading(true);
      try {
        // Fetch all distinct values from the jobs table in one query
        const { data, error } = await supabase
          .from("jobs")
          .select("location, experience, category, company, qualification, passout_year")
          .eq("is_active", true);

        if (error) throw error;

        if (data) {
          // Extract unique sorted values for each filter
          const unique = (arr) => [...new Set(arr.filter(Boolean))].sort();

          setDynamicOptions({
            location: unique(data.map((j) => j.location)),
            experience: unique(data.map((j) => j.experience)),
            category: unique(data.map((j) => j.category)),
            company: unique(data.map((j) => j.company)),
            qualification: unique(data.map((j) => j.qualification)),
            passout_year: unique(data.flatMap((j) => j.passout_year ? j.passout_year.split(", ").filter(Boolean) : [])),
          });
        }
      } catch (err) {
        console.error("Failed to load filter options:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchFilterOptions();
  }, []);

  const FILTER_SECTIONS = [
    { key: "location",   label: "Location",   options: dynamicOptions.location },
    { key: "experience", label: "Experience", options: dynamicOptions.experience },
    { key: "type",       label: "Job Type",   options: STATIC_JOB_TYPES },
    { key: "category",   label: "Category",   options: dynamicOptions.category },
    { key: "company",    label: "Company",    options: dynamicOptions.company },
    { key: "salary",     label: "Salary Range", options: STATIC_SALARY_RANGES },
    { key: "qualification", label: "Qualification", options: dynamicOptions.qualification },
    { key: "passout_year", label: "Passout Year", options: dynamicOptions.passout_year },
  ];

  const handleToggle = (key, value, checked) => {
    dispatch({ type: "SET_FILTER", payload: { key, value, checked } });
  };

  const totalActive = Object.values(filters).flat().length;

  return (
    <aside
      className="card-flat p-5"
      aria-label="Job filters"
      id="filter-sidebar"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <h2 className="font-bold text-slate-900 dark:text-white text-sm">Filters</h2>
          {totalActive > 0 && (
            <span className="badge bg-amber-500 text-white">{totalActive}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {totalActive > 0 && (
            <button
              onClick={() => dispatch({ type: "CLEAR_FILTERS" })}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
              id="filter-clear-all"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg lg:hidden" aria-label="Close filters">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {FILTER_SECTIONS.map((section) => (
        <FilterSection
          key={section.key}
          section={section}
          selected={filters[section.key] || []}
          onToggle={handleToggle}
          loading={loading && section.key !== "type" && section.key !== "salary"}
          initialOpen={false}
        />
      ))}
    </aside>
  );
}
