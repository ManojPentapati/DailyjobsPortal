import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

const JobContext = createContext();

export function JobProvider({ children }) {
  const [state, setState] = useState({
    filters: {
      location: [],
      experience: [],
      type: [],
      category: [],
      company: [],
      salary: [],
      qualification: [],
      passout_year: [],
    },
    searchQuery: "",
    sortBy: "latest",
    currentPage: 1,
    jobsPerPage: 9,
  });

  const [adminJobs, setAdminJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [paginatedJobs, setPaginatedJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper to construct Supabase query based on current filters
  const buildQuery = (isCount = false) => {
    let q = supabase.from("jobs").select("*", isCount ? { count: "exact", head: true } : {});

    // Only active & non-expired jobs for public viewing (RLS handles some of this, but good to be explicit if needed)
    q = q.eq("is_active", true).gt("expires_at", new Date().toISOString());

    // Search query (ilike on title or company)
    if (state.searchQuery) {
      q = q.or(`title.ilike.%${state.searchQuery}%,company.ilike.%${state.searchQuery}%,category.ilike.%${state.searchQuery}%`);
    }

    // Filters
    if (state.filters.location.length) q = q.in("location", state.filters.location);
    if (state.filters.experience.length) q = q.in("experience", state.filters.experience);
    if (state.filters.type.length) q = q.in("job_type", state.filters.type);
    if (state.filters.category.length) q = q.in("category", state.filters.category);
    if (state.filters.company.length) q = q.in("company", state.filters.company);
    if (state.filters.qualification?.length) q = q.in("qualification", state.filters.qualification);
    // Salary filter: match ranges like "0-5 LPA", "5-10 LPA", etc. using ilike on the salary text field
    if (state.filters.salary?.length) {
      const salaryFilters = state.filters.salary.map(range => {
        if (range === "0-5 LPA") return `salary.ilike.%LPA%`;
        return `salary.ilike.%${range.replace(" LPA", "")}%`;
      }).join(",");
      q = q.or(salaryFilters);
    }
    if (state.filters.passout_year?.length) {
      const yearFilters = state.filters.passout_year.map(y => `passout_year.ilike.%${y}%`).join(",");
      q = q.or(yearFilters);
    }

    return q;
  };

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Get total count for pagination
      const countQuery = buildQuery(true);
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalJobs(count || 0);

      // 2. Get paginated data
      let dataQuery = buildQuery();

      // Sorting
      if (state.sortBy === "latest") dataQuery = dataQuery.order("posted_date", { ascending: false });
      else if (state.sortBy === "oldest") dataQuery = dataQuery.order("posted_date", { ascending: true });
      // "relevant" is hard to do without a dedicated column, fallback to latest
      else dataQuery = dataQuery.order("posted_date", { ascending: false });

      // Pagination
      const from = (state.currentPage - 1) * state.jobsPerPage;
      const to = from + state.jobsPerPage - 1;
      dataQuery = dataQuery.range(from, to);

      const { data, error } = await dataQuery;
      if (error) throw error;

      setPaginatedJobs(data || []);
      setFilteredJobs(data || []);
      
      // Fetch ALL jobs for admin dashboard (no active filter, no pagination)
      const { data: allJobs, error: adminError } = await supabase
        .from("jobs")
        .select("*")
        .order("posted_date", { ascending: false });
      if (!adminError) {
        setAdminJobs(allJobs || []);
        setTotalJobs(count || 0);
      }

    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [state]);

  // Refetch when dependencies change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const totalPages = Math.max(1, Math.ceil(totalJobs / state.jobsPerPage));

  // Actions
  const dispatch = async (action) => {
    switch (action.type) {
      case "SET_SEARCH":
        setState((p) => ({ ...p, searchQuery: action.payload, currentPage: 1 }));
        break;
      case "SET_FILTER": {
        const { key, value, checked } = action.payload;
        setState((p) => {
          const current = p.filters[key];
          const updated = checked
            ? current.includes(value) ? current : [...current, value]
            : current.filter((v) => v !== value);
          return { ...p, filters: { ...p.filters, [key]: updated }, currentPage: 1 };
        });
        break;
      }
      case "CLEAR_FILTERS":
        setState((p) => ({
          ...p,
          filters: { location: [], experience: [], type: [], category: [], company: [], qualification: [], passout_year: [] },
          searchQuery: "",
          currentPage: 1,
        }));
        break;
      case "SET_SORT":
        setState((p) => ({ ...p, sortBy: action.payload, currentPage: 1 }));
        break;
      case "SET_PAGE":
        setState((p) => ({ ...p, currentPage: action.payload }));
        break;
      case "ADD_JOB": {
        const { data, error } = await supabase.from("jobs").insert([action.payload]).select();
        if (error) throw error;
        fetchJobs();
        return data;
      }
      case "UPDATE_JOB": {
        const { data, error } = await supabase.from("jobs").update(action.payload).eq("id", action.payload.id).select();
        if (error) throw error;
        fetchJobs();
        return data;
      }
      case "DELETE_JOB": {
        const { error } = await supabase.from("jobs").delete().eq("id", action.payload);
        if (error) throw error;
        fetchJobs();
        break;
      }
      case "TOGGLE_JOB_STATUS": {
        // Fetch current status
        const job = adminJobs.find(j => j.id === action.payload);
        if (job) {
          const { error } = await supabase.from("jobs").update({ is_active: !job.is_active }).eq("id", action.payload);
          if (error) throw error;
          fetchJobs();
        }
        break;
      }
      default:
        break;
    }
  };

  const getJobById = async (idOrSlug) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    let query = supabase.from("jobs").select("*");
    if (isUuid) {
      query = query.eq("id", idOrSlug);
    } else {
      query = query.eq("slug", idOrSlug);
    }
    const { data, error } = await query.single();
    if (error) {
      console.error("Error fetching job:", error);
      return null;
    }
    return data;
  };

  const getSimilarJobs = async (job, limit = 3) => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("category", job.category)
      .neq("id", job.id)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .limit(limit);
    if (error) {
      console.error("Error fetching similar jobs:", error);
      return [];
    }
    return data;
  };

  return (
    <JobContext.Provider
      value={{
        state,
        dispatch,
        filteredJobs,
        paginatedJobs,
        totalPages,
        getJobById,
        getSimilarJobs,
        adminJobs,
        loading,
        totalJobs,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export const useJobs = () => {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error("useJobs must be used within JobProvider");
  return ctx;
};
