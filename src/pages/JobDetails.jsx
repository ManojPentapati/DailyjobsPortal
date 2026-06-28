import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin, Briefcase, Banknote, Clock, Share2, Bookmark,
  BookmarkCheck, ArrowLeft, CheckCircle2, Building2,
  ExternalLink, GraduationCap, Calendar
} from "lucide-react";
import { useJobs } from "../context/JobContext";
import JobCard from "../components/jobs/JobCard";
import EmptyState from "../components/common/EmptyState";
import { formatDate, formatDistanceToNow, isWithinHours } from "../components/utils/dateUtils";
import { resolveLogo } from "../components/utils/logoUtils";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJobById, getSimilarJobs } = useJobs();
  const [saved, setSaved] = useState(false);

  const [job, setJob] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      const data = await getJobById(id);
      if (data) {
        setJob(data);
        const sim = await getSimilarJobs(data);
        setSimilar(sim);
      }
      setLoading(false);
    }
    fetchJob();
  }, [id, getJobById, getSimilarJobs]);

  // Sync saved state with localStorage when job loads
  useEffect(() => {
    if (job) {
      try {
        const ids = JSON.parse(localStorage.getItem("savedJobs") || "[]");
        setSaved(ids.includes(job.id));
      } catch { /* ignore */ }
    }
  }, [job]);

  useEffect(() => {
    if (job) {
      const title = `${job.title} at ${job.company} – Daily Jobs Portal`;
      const desc = `Apply for ${job.title} at ${job.company} in ${job.location}. ${job.experience} experience. ${job.salary || "Competitive salary"}.`;
      document.title = title;

      // Meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) { metaDesc = document.createElement("meta"); metaDesc.name = "description"; document.head.appendChild(metaDesc); }
      metaDesc.content = desc;

      // Open Graph
      const ogTags = { "og:title": title, "og:description": desc, "og:url": window.location.href, "og:type": "website" };
      Object.entries(ogTags).forEach(([prop, content]) => {
        let tag = document.querySelector(`meta[property="${prop}"]`);
        if (!tag) { tag = document.createElement("meta"); tag.setAttribute("property", prop); document.head.appendChild(tag); }
        tag.content = content;
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [job]);

  if (loading) {
    return <main className="max-w-4xl mx-auto px-4 py-20 flex justify-center"><span className="w-10 h-10 border-4 border-slate-300 border-t-amber-500 rounded-full animate-spin"></span></main>;
  }

  if (!job) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20" id="job-not-found">
        <EmptyState
          variant="search"
          title="Job Not Found"
          description="This job listing may have been removed or the link is incorrect."
          action={
            <Link to="/jobs" className="btn-primary">
              Browse All Jobs
            </Link>
          }
        />
      </main>
    );
  }

  const isNew = job.posted_date ? isWithinHours(job.posted_date, 24) : false;

  const shareUrl = window.location.href;
  const shareText = `${job.title} at ${job.company} – Check it out!`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + shareUrl)}`, "_blank");
    setShowShareMenu(false);
  };
  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
    setShowShareMenu(false);
  };
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowShareMenu(false);
  };

  const handleApplyRedirect = () => {
    if (job?.apply_link) {
      window.open(job.apply_link, "_blank", "noopener,noreferrer");
    } else {
      alert("Official application link is not available for this job.");
    }
  };

  return (
    <main id="job-details-page">
      {/* Header */}
      <div className="bg-stone-50 dark:bg-[#0f1d32] py-8 sm:py-10 border-b border-stone-200 dark:border-slate-800/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-4 sm:mb-6 text-sm min-h-[44px]"
            id="back-btn"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </button>

          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden bg-white border-2 border-white/20 flex-shrink-0 flex items-center justify-center">
              <img
                src={resolveLogo(job.company_logo || job.logo)}
                alt={job.company}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  e.currentTarget.parentElement.innerHTML = `<span class="text-slate-800 font-bold text-xl sm:text-2xl">${job.company[0]}</span>`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                {isNew && <span className="badge-new">✦ New</span>}
                {job.is_featured && <span className="badge-featured">★ Featured</span>}
                <span className="badge-type">{job.category || job.type}</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-2 sm:mb-1 break-words text-stone-900 dark:text-white">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-stone-500 dark:text-slate-300 text-xs sm:text-sm">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{job.company}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{job.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{formatDistanceToNow(job.posted_date || job.postedDate)}</span>
              </div>
            </div>
          </div>

          {/* Action buttons - full width on mobile */}
          <div className="flex items-center gap-2 mt-4 sm:mt-5">
            <button
              onClick={() => {
                const ids = JSON.parse(localStorage.getItem("savedJobs") || "[]");
                const updated = saved ? ids.filter((i) => i !== job.id) : [...ids, job.id];
                localStorage.setItem("savedJobs", JSON.stringify(updated));
                setSaved(!saved);
              }}
              className="p-2.5 rounded-xl bg-stone-200/50 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 border border-stone-300 dark:border-white/20 transition-all text-stone-700 dark:text-white"
              aria-label={saved ? "Unsave" : "Save job"}
              id="save-job-detail-btn"
            >
              {saved ? <BookmarkCheck className="w-5 h-5 text-amber-500" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu((p) => !p)}
                className="p-2.5 rounded-xl bg-stone-200/50 hover:bg-stone-200 dark:bg-white/10 dark:hover:bg-white/20 border border-stone-300 dark:border-white/20 transition-all text-stone-700 dark:text-white"
                aria-label="Share job"
                id="share-job-btn"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {showShareMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                  <div className="absolute left-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5 min-w-[180px] animate-slide-up">
                    <button onClick={shareWhatsApp} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" id="share-whatsapp">
                      <span className="text-green-500 text-base">💬</span> WhatsApp
                    </button>
                    <button onClick={shareLinkedIn} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" id="share-linkedin">
                      <span className="text-blue-600 text-base">🔗</span> LinkedIn
                    </button>
                    <button onClick={copyLink} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" id="share-copy">
                      <span className="text-base">{copied ? "✅" : "📋"}</span> {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={handleApplyRedirect}
              className="btn-primary px-6 flex-1 sm:flex-none justify-center"
              id="apply-now-btn"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="card-flat p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About the Role</h2>
              <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="card-flat p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Responsibilities</h2>
              <ul className="flex flex-col gap-3">
                {job.responsibilities?.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div className="card-flat p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card-flat p-5 space-y-4">
              <h2 className="font-bold text-slate-900 dark:text-white">Job Overview</h2>
              {[
                { icon: Briefcase, label: "Experience", value: job.experience },
                { icon: MapPin, label: "Location", value: job.location },
                { icon: Banknote, label: "Salary", value: job.salary || "Not disclosed" },
                { icon: Clock, label: "Job Type", value: job.category || job.type },
                ...(job.qualification ? [{ icon: GraduationCap, label: "Qualification", value: job.qualification }] : []),
                ...(job.passout_year && job.passout_year !== "Any" ? [{ icon: Calendar, label: "Passout Year", value: (() => {
                  const yrs = job.passout_year.split(", ").filter(Boolean).sort();
                  return yrs.length > 2 ? `${yrs[0]}-${yrs[yrs.length - 1]} Batch` : `${yrs.join(", ")} Batch`;
                })() }] : []),
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/25 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="card-flat p-5">
              <h2 className="font-bold text-slate-900 dark:text-white mb-3">About {job.company}</h2>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  <img src={resolveLogo(job.company_logo || job.logo)} alt={job.company} className="w-full h-full object-contain p-1"
                    onError={(e) => { e.currentTarget.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center font-bold text-amber-600 dark:text-amber-400">${job.company[0]}</div>`; }} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{job.company}</p>
                  <p className="text-xs text-slate-400">{job.category}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {job.company} is a leading technology company known for innovation and excellence. Join their team to work on world-class products and services.
              </p>
            </div>

            <button
              onClick={handleApplyRedirect}
              className="btn-primary w-full justify-center text-base py-3"
              id="apply-sidebar-btn"
            >
              Apply for This Position
            </button>
          </div>
        </div>

        {/* Similar Jobs */}
        {similar.length > 0 && (
          <div className="mt-12" id="similar-jobs-section">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Similar Jobs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((j) => (
                <JobCard key={j.id} job={j} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
