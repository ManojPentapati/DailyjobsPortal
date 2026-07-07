import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, X } from "lucide-react";
import { useJobs } from "../../context/JobContext";

export default function SearchBar({ large = false, placeholder = "Job title, company, or skill..." }) {
  const { dispatch } = useJobs();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch({ type: "SET_SEARCH", payload: query.trim() });
    navigate("/jobs");
  };

  const clearQuery = () => {
    setQuery("");
    dispatch({ type: "SET_SEARCH", payload: "" });
  };

  if (large) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-2 shadow-2xl border border-slate-100 dark:border-slate-700/60 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all duration-200 w-full max-w-2xl"
        role="search"
        aria-label="Job search"
        id="hero-search-form"
      >
        <div className="flex items-center gap-3 flex-1 px-2 sm:px-3">
          <Search className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="bg-transparent outline-none w-full text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base py-2"
            id="hero-search-input"
            aria-label="Search query"
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={clearQuery} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 border-l border-slate-200 dark:border-slate-600">
          <MapPin className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            id="location-search-input"
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="bg-transparent outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 text-sm w-28"
            aria-label="Location filter"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="btn-primary rounded-lg sm:rounded-xl px-6 justify-center"
          id="hero-search-btn"
        >
          <Search className="w-4 h-4" />
          Search Jobs
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-amber-500/80 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all duration-200 rounded-xl px-3 py-2.5 w-full"
      role="search"
      aria-label="Search jobs"
    >
      <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <input
        type="text"
        id="inline-search-input"
        name="query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none flex-1"
        aria-label="Search"
        autoComplete="off"
      />
      {query && (
        <button type="button" onClick={clearQuery}>
          <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
        </button>
      )}
    </form>
  );
}
