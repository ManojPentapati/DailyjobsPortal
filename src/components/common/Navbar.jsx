import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Briefcase, Search, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useJobs } from "../../context/JobContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Find Jobs" },
  { to: "/categories", label: "Categories" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();
  const { dispatch } = useJobs();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    dispatch({ type: "SET_SEARCH", payload: query.trim() });
    navigate("/jobs");
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <div className="sticky top-0 z-50 px-2 sm:px-4 pt-2">
      <header
        className={`transition-all duration-300 rounded-2xl ${scrolled
            ? "bg-white/85 dark:bg-stone-950/85 backdrop-blur-2xl border border-amber-100/60 dark:border-stone-800/40"
            : "bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800"
          }`}
        style={{ boxShadow: scrolled ? "0 4px 24px rgba(255,153,0,0.1), 0 1px 8px rgba(0,0,0,0.06)" : "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0" id="nav-logo">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #FF9900 0%, #e67700 100%)", boxShadow: "0 4px 14px rgba(255,153,0,0.4)" }}>
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="leading-none">
                <div>
                  <span className="text-[13px] sm:text-[15px] font-extrabold tracking-tight text-stone-900 dark:text-white">Daily</span>
                  <span className="text-[13px] sm:text-[15px] font-extrabold tracking-tight" style={{ color: "#FF9900" }}>Jobs</span>
                </div>
                <div className="text-[8px] sm:text-[9px] text-stone-400 dark:text-slate-400 font-semibold tracking-widest uppercase mt-0.5">Portal</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === "/"}
                  className={({ isActive }) => isActive ? "nav-link-active" : "nav-link"}
                  id={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}>
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5">
              {/* Desktop search */}
              <form onSubmit={handleSearch}
                className="hidden md:flex items-center gap-2 rounded-xl px-3.5 py-2 w-48 lg:w-60 transition-all duration-200 group"
                style={{ background: "rgba(255,153,0,0.07)", border: "1px solid rgba(255,153,0,0.18)" }}
                onFocus={(e) => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,153,0,0.15)"}
                onBlur={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                <Search className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search jobs..."
                  className="bg-transparent text-sm text-stone-700 dark:text-slate-200 placeholder-stone-400 dark:placeholder-slate-500 outline-none w-full"
                  id="nav-search-input" />
              </form>

              {/* Mobile search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 rounded-xl text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-all" aria-label="Search" id="nav-search-toggle">
                <Search className="w-5 h-5" />
              </button>



              {/* Admin CTA */}
              <Link to="/admin/login" className="hidden sm:flex btn-primary text-xs py-2 px-4" id="nav-admin-btn">
                Admin Panel
              </Link>

              {/* Hamburger */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-xl text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition-all" aria-label="Toggle menu" id="nav-hamburger">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {searchOpen && (
            <div className="md:hidden pb-3 animate-slide-up">
              <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl px-3.5 py-2.5"
                style={{ background: "rgba(255,153,0,0.08)", border: "1px solid rgba(255,153,0,0.2)" }}>
                <Search className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <input ref={searchRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search jobs, companies, skills..." id="nav-search-mobile"
                  className="bg-transparent text-sm text-stone-700 dark:text-slate-200 placeholder-stone-400 dark:placeholder-slate-500 outline-none flex-1" />
                {query && <button type="submit" className="btn-primary py-1 px-3 text-xs">Go</button>}
              </form>
            </div>
          )}

          {/* Mobile menu */}
          {menuOpen && (
            <nav className="lg:hidden pb-4 border-t border-stone-100 dark:border-white/10 pt-3 animate-slide-up" aria-label="Mobile navigation">
              <div className="flex flex-col gap-0.5">
                {navLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} end={link.to === "/"}
                    className={({ isActive }) => isActive ? "nav-link-active block" : "nav-link block"}
                    onClick={() => setMenuOpen(false)}>{link.label}</NavLink>
                ))}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 mt-1">
                  <Link to="/admin/login" className="btn-primary w-full justify-center text-sm"
                    onClick={() => setMenuOpen(false)} id="nav-admin-mobile">Admin Panel</Link>
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>
    </div>
  );
}
