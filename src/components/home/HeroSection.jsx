import { Link } from "react-router-dom";
import SearchBar from "../common/SearchBar";
import { useJobs } from "../../context/JobContext";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const TYPING_WORDS = ["Next Role", "Career", "Future", "Dream Job"];

// Fallback roles when no jobs in DB
const FALLBACK_ROLES = [
  { title: "Senior Frontend Dev", company: "Google", location: "Bangalore", initial: "G", gradient: "from-blue-400 to-blue-700", shadow: "shadow-blue-500/30", accent: "text-blue-300", type: "Full-time", mode: "Remote OK", skills: ["React", "TypeScript", "GCP", "Node.js"], salary: "₹35L – ₹55L" },
  { title: "ML Engineer", company: "Microsoft", location: "Hyderabad", initial: "M", gradient: "from-violet-400 to-violet-700", shadow: "shadow-violet-500/30", accent: "text-violet-300", type: "Full-time", mode: "Hybrid", skills: ["Python", "PyTorch", "Azure", "MLOps"], salary: "₹40L – ₹60L" },
  { title: "DevOps Lead", company: "Amazon", location: "Pune", initial: "A", gradient: "from-amber-400 to-orange-600", shadow: "shadow-orange-500/30", accent: "text-amber-300", type: "Full-time", mode: "On-site", skills: ["AWS", "Terraform", "K8s", "Docker"], salary: "₹30L – ₹50L" },
  { title: "Data Scientist", company: "Meta", location: "Remote", initial: "M", gradient: "from-cyan-400 to-blue-600", shadow: "shadow-cyan-500/30", accent: "text-cyan-300", type: "Contract", mode: "Remote", skills: ["Python", "SQL", "Spark", "Tableau"], salary: "₹28L – ₹45L" },
  { title: "iOS Developer", company: "Apple", location: "Chennai", initial: "A", gradient: "from-stone-400 to-stone-700", shadow: "shadow-stone-500/30", accent: "text-stone-300", type: "Full-time", mode: "On-site", skills: ["Swift", "SwiftUI", "Xcode", "CI/CD"], salary: "₹32L – ₹52L" },
];

const GRADIENTS = [
  { gradient: "from-blue-400 to-blue-700", shadow: "shadow-blue-500/30", accent: "text-blue-300" },
  { gradient: "from-violet-400 to-violet-700", shadow: "shadow-violet-500/30", accent: "text-violet-300" },
  { gradient: "from-amber-400 to-orange-600", shadow: "shadow-orange-500/30", accent: "text-amber-300" },
  { gradient: "from-cyan-400 to-blue-600", shadow: "shadow-cyan-500/30", accent: "text-cyan-300" },
  { gradient: "from-emerald-400 to-teal-600", shadow: "shadow-emerald-500/30", accent: "text-emerald-300" },
];

function useTypingEffect(words, typingSpeed = 100, deleteSpeed = 60, pauseDuration = 1800) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    let timeout;

    if (!isDeleting && text === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
    } else if (isDeleting && text === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
      }, isDeleting ? deleteSpeed : typingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [text, wordIndex, isDeleting, words, typingSpeed, deleteSpeed, pauseDuration]);

  return text;
}

export default function HeroSection() {
  const { allActiveCount, uniqueCompaniesCount } = useJobs();
  const [topCategories, setTopCategories] = useState([]);
  const [activeRole, setActiveRole] = useState(0);
  const [isLeaving, setIsLeaving] = useState(false);
  const [roles, setRoles] = useState(FALLBACK_ROLES);
  const typedText = useTypingEffect(TYPING_WORDS);

  // Fetch real jobs from Supabase for the card
  useEffect(() => {
    async function fetchHeroData() {
      try {
        const { data } = await supabase
          .from("jobs")
          .select("title, company, location, category, job_type, salary, skills")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          // Build trending categories
          const catCounts = {};
          data.forEach((j) => {
            if (j.category) catCounts[j.category] = (catCounts[j.category] || 0) + 1;
          });
          const sorted = Object.entries(catCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name]) => name);
          setTopCategories(sorted);

          // Build card roles from real data
          const cards = data.slice(0, 5).map((job, i) => {
            const g = GRADIENTS[i % GRADIENTS.length];
            const skillsList = Array.isArray(job.skills)
              ? job.skills.slice(0, 4)
              : (job.skills || "").split(",").map(s => s.trim()).filter(Boolean).slice(0, 4);
            return {
              title: job.title,
              company: job.company,
              location: job.location || "India",
              initial: (job.company || "D")[0].toUpperCase(),
              ...g,
              type: job.job_type || "Full-time",
              mode: "Active",
              skills: skillsList.length > 0 ? skillsList : ["Tech"],
              salary: job.salary || "Competitive",
            };
          });
          setRoles(cards);
        }
      } catch (err) {
        console.error("Failed to load hero data:", err);
      }
    }
    fetchHeroData();
  }, []);

  // Rotate the card: show 2.5s, then exit animation 0.5s, then switch
  useEffect(() => {
    const timer = setInterval(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setActiveRole((prev) => (prev + 1) % roles.length);
        setIsLeaving(false);
      }, 500);
    }, 3000);
    return () => clearInterval(timer);
  }, [roles.length]);

  const trending = topCategories.length > 0
    ? topCategories.slice(0, 4)
    : ["Software Dev", "Data Science", "AI / ML", "UI/UX Design"];

  const role = roles[activeRole];

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        background: "radial-gradient(ellipse 90% 70% at 50% -5%, rgba(56,116,255,0.28) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 85% 85%, rgba(139,92,246,0.18) 0%, transparent 60%), linear-gradient(175deg, #0d1526 0%, #060c1a 100%)"
      }}
      aria-labelledby="hero-heading"
      id="hero-section"
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-dots-dark opacity-60" />

      {/* Glowing orbs */}
      <div className="absolute top-20 left-1/3 w-96 h-96 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-[0.1] blur-3xl"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">

          {/* Left */}
          <div className="animate-slide-up text-center lg:text-left">
            {/* Pill badge */}
            <div className="amber-pill mb-5 sm:mb-7">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              {allActiveCount > 0 ? `${allActiveCount} active jobs available` : "New jobs posted daily"}
            </div>

            {/* Heading with typing effect */}
            <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight mb-4 sm:mb-5">
              <span className="whitespace-nowrap">
                Find Your{" "}
                <span className="text-gradient inline-block min-w-[150px] sm:min-w-[230px] text-left">
                  {typedText}
                  <span className="animate-blink text-amber-400 ml-0.5">|</span>
                </span>
              </span>
              <br className="hidden sm:block" />
              {" "}in Tech
            </h1>
            <p className="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              Discover top opportunities at India's leading tech companies. Your next career move starts here.
            </p>

            {/* Search */}
            <div className="mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
              <SearchBar large placeholder="Job title, company, or skill..." />
            </div>

            {/* Trending */}
            <div className="flex items-center gap-2 justify-center lg:justify-start overflow-x-auto no-scrollbar mb-8">
              <span className="text-slate-500 text-xs mt-1.5 flex-shrink-0 font-medium">Trending:</span>
              {trending.map((t) => (
                <Link key={t} to={`/jobs?category=${encodeURIComponent(t)}`}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "#e2e8f0"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#94a3b8"; }}
                >
                  {t}
                </Link>
              ))}
            </div>

            {/* Trust Stats Bar */}
            <div className="flex items-center gap-6 sm:gap-8 justify-center lg:justify-start pt-6 border-t border-white/[0.08]">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{allActiveCount > 0 ? allActiveCount : "120+"}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Active Jobs</p>
              </div>
              <div className="w-px h-8 bg-white/[0.08]" />
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-white">{uniqueCompaniesCount > 0 ? `${uniqueCompaniesCount}+` : "50+"}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Top Companies</p>
              </div>
              <div className="w-px h-8 bg-white/[0.08]" />
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-amber-400">100%</p>
                <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-widest mt-0.5">Free to Apply</p>
              </div>
            </div>
          </div>

          {/* Right – Single card, clean transitions (desktop only) */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative animate-float">
              {/* Glow behind the card */}
              <div className="absolute -inset-4 rounded-3xl opacity-50 blur-2xl animate-glow-pulse"
                style={{ background: "radial-gradient(circle, rgba(255,153,0,0.2), rgba(59,130,246,0.12), transparent)" }} />

              {/* Single card with fade transition */}
              <div className="relative w-80">
                <div
                  key={activeRole}
                  className="rounded-2xl p-6 w-80 shadow-2xl border border-white/[0.08]"
                  style={{
                    background: "rgba(15, 23, 42, 0.85)",
                    animation: isLeaving
                      ? "cardRotateOut 0.5s ease-in both"
                      : "cardRotateIn 0.5s ease-out both",
                  }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 bg-gradient-to-br ${role.gradient} rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${role.shadow}`}>
                        {role.initial}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm leading-tight">{role.title}</p>
                        <p className={`${role.accent} text-xs mt-0.5`}>{role.company} · {role.location}</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-emerald-400/30"></div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                      {role.type}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(96,165,250,0.15)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}>
                      {role.mode}
                    </span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-5">
                    {role.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ background: "rgba(255,255,255,0.08)", color: "#cbd5e1" }}>{s}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-400 font-bold text-sm">{role.salary}</p>
                      <p className="text-slate-500 text-xs">per annum</p>
                    </div>
                    <Link to="/jobs" className="btn-primary text-xs py-2 px-4 rounded-xl">
                      View Jobs →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
          <path d="M0 56L60 46C120 36 240 16 360 12C480 8 600 18 720 24C840 30 960 30 1080 24C1200 18 1320 8 1380 4L1440 0V56H0Z" className="fill-stone-50 dark:fill-[#0f1d32]" />
        </svg>
      </div>
    </section>
  );
}
