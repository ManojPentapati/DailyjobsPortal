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
import { formatDate, formatDistanceToNow, isWithinHours, getExpiryInfo, getApplyTimeInfo } from "../components/utils/dateUtils";
import CompanyLogo from "../components/common/CompanyLogo";
import AdSlot from "../components/common/AdSlot";
import SearchBar from "../components/common/SearchBar";
import JobShareFloat from "../components/jobs/JobShareFloat";
import { parseWalkinData, cleanDescription } from "../components/utils/walkinUtils";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getJobById, getSimilarJobs, savedJobs, toggleSaveJob } = useJobs();

  const [job, setJob] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [redirectInterval, setRedirectInterval] = useState(null);

  const saved = job ? savedJobs.includes(job.id) : false;

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

  useEffect(() => {
    if (job) {
      const title = `${job.title} at ${job.company} – Daily Jobs Portal`;
      const desc = `Apply for ${job.title} at ${job.company} in ${job.location || 'India'}. ${job.experience || 'Freshers / Experienced'} experience. ${job.salary || "Competitive salary"}.`;
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

      // JSON-LD Structured Data for Google for Jobs
      const jsonLd = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": job.title,
        "description": cleanDescription(job.description) || `Apply for ${job.title} at ${job.company}.`,
        "datePosted": job.posted_date || new Date().toISOString(),
        "validThrough": job.expires_at || new Date(Date.now() + 7 * 86400000).toISOString(),
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.company,
          ...(job.company_logo && { "logo": job.company_logo }),
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": job.location || "India",
            "addressCountry": "IN",
          },
        },
        ...(job.salary && {
          "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": "INR",
            "value": { "@type": "QuantitativeValue", "value": job.salary, "unitText": "YEAR" },
          },
        }),
        "employmentType": job.job_type === "Full-time" ? "FULL_TIME" : job.job_type === "Part-time" ? "PART_TIME" : job.job_type === "Contract" ? "CONTRACTOR" : job.job_type === "Internship" ? "INTERN" : "FULL_TIME",
        "qualifications": job.qualification || undefined,
        "experienceRequirements": job.experience || undefined,
      };

      let ldScript = document.getElementById("job-jsonld");
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.id = "job-jsonld";
        ldScript.type = "application/ld+json";
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);

      window.scrollTo({ top: 0, behavior: "smooth" });

      // Cleanup to restore default home page SEO values on unmount
      return () => {
        const defaultTitle = "Daily Jobs Portal – Find Your Next Tech Opportunity";
        const defaultDesc = "Daily Jobs Portal – Find your next tech opportunity in India. Browse thousands of curated jobs in software development, AI/ML, data science, cloud computing, DevOps, and more.";
        document.title = defaultTitle;

        const mDesc = document.querySelector('meta[name="description"]');
        if (mDesc) mDesc.content = defaultDesc;

        const defaultOg = { 
          "og:title": "Daily Jobs Portal – Find Your Next Opportunity", 
          "og:description": "Connecting India's top tech talent with the best companies.",
          "og:url": window.location.origin
        };
        Object.entries(defaultOg).forEach(([prop, content]) => {
          const t = document.querySelector(`meta[property="${prop}"]`);
          if (t) t.content = content;
        });

        // Remove JSON-LD
        const ld = document.getElementById("job-jsonld");
        if (ld) ld.remove();
      };
    }
  }, [job]);

  if (loading) {
    return <main className="max-w-4xl mx-auto px-4 py-20 flex justify-center"><span className="w-10 h-10 border-4 border-slate-300 border-t-amber-500 rounded-full animate-spin"></span></main>;
  }

  if (!job) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center" id="job-expired-page">
        <div className="card p-6 sm:p-10 border border-slate-200 dark:border-stone-800 bg-white dark:bg-[#0f1d32] rounded-2xl shadow-xl max-w-xl mx-auto">
          {/* Expired Badge */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-550/10 text-red-500 mb-6">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mb-3">
            This Job Opportunity Has Expired
          </h1>
          <p className="text-sm sm:text-base text-stone-500 dark:text-slate-400 leading-relaxed mb-8">
            To ensure data quality, expired and inactive job applications are automatically cleared. Don't worry—new jobs are added daily!
          </p>

          {/* Dynamic Search Bar */}
          <div className="w-full mb-8" id="expired-job-search">
            <p className="text-xs font-semibold text-stone-600 dark:text-slate-350 text-left mb-2 uppercase tracking-wider">Search for alternative jobs:</p>
            <SearchBar placeholder="Try searching 'Google', 'Python', 'Freshers'..." />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              to="/jobs"
              className="btn-primary w-full sm:w-auto text-sm py-2.5 px-6 rounded-xl flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Jobs
            </Link>
            <a
              href="https://whatsapp.com/channel/0029VbCRYZN0Qeaep5uwNY3f"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary w-full sm:w-auto text-sm py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5"
            >
              🚀 Join WhatsApp Channel
            </a>
          </div>
        </div>
      </main>
    );
  }

  const isNew = job.posted_date ? isWithinHours(job.posted_date, 24) : false;
  const expiry = getExpiryInfo(job.expires_at);
  const applyTimeInfo = getApplyTimeInfo(job.apply_link);

  const shareUrl = window.location.href;
  const shareText = `\ud83d\ude80 *${job.title}* at *${job.company}*\n\ud83d\udccd ${job.location || "India"}\n\ud83d\udcbc ${job.experience || "Freshers"}\n${job.salary ? `\ud83d\udcb0 ${job.salary}\n` : ""}\ud83d\udd17 Apply: ${shareUrl}\n\n\u2014 via Daily Jobs Portal`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
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
    if (!job?.apply_link) {
      alert("Official application link is not available for this job.");
      return;
    }

    // Clear any existing interval
    if (redirectInterval) {
      clearInterval(redirectInterval);
    }

    setCountdown(3);
    setShowRedirectModal(true);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setShowRedirectModal(false);
        setRedirectInterval(null);
        window.open(job.apply_link, "_blank", "noopener,noreferrer");
      }
    }, 1000);

    setRedirectInterval(interval);
  };

  const skipRedirect = () => {
    if (redirectInterval) {
      clearInterval(redirectInterval);
      setRedirectInterval(null);
    }
    setShowRedirectModal(false);
    if (job?.apply_link) {
      window.open(job.apply_link, "_blank", "noopener,noreferrer");
    }
  };

  const cancelRedirect = () => {
    if (redirectInterval) {
      clearInterval(redirectInterval);
      setRedirectInterval(null);
    }
    setShowRedirectModal(false);
  };

  const walkinData = job ? parseWalkinData(job.description) : null;
  const displayDescription = job ? cleanDescription(job.description) : "";

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
            <CompanyLogo
              logo={job.company_logo || job.logo}
              company={job.company}
              className="w-14 h-14 sm:w-16 sm:h-16"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                {isNew && <span className="badge-new">✦ New</span>}
                {job.is_featured && <span className="badge-featured">★ Featured</span>}
                {expiry && <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${expiry.colorClass}`}>⏳ {expiry.label}</span>}
                {applyTimeInfo && <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${applyTimeInfo.colorClass}`}>⏱️ {applyTimeInfo.label}</span>}
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
              onClick={() => toggleSaveJob(job.id)}
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
            {/* Walk-in details block */}
            {job.job_type === "Walk-in" && walkinData && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-200/60 dark:border-amber-900/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 dark:opacity-10 pointer-events-none select-none">
                  <span className="text-7xl font-bold">🚶‍♂️</span>
                </div>
                <h3 className="text-md font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-4">
                  <span className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">🚶‍♂️</span>
                  Walk-in Interview Details
                </h3>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date & Time</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{walkinData.dateTime}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Interview Venue</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 break-words">{walkinData.venue}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(walkinData.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Navigate on Maps
                  </a>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="card-flat p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About the Role</h2>
              <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {displayDescription}
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
                <CompanyLogo
                  logo={job.company_logo || job.logo}
                  company={job.company}
                  className="w-10 h-10"
                />
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

            <AdSlot slot="details-sidebar" className="mt-4" />
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

      {/* Safe Apply Redirection Modal */}
      {showRedirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" id="safe-apply-modal">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl animate-scale-up">
            {/* Logo area */}
            <div className="flex items-center gap-3 mb-6">
              <CompanyLogo
                logo={job.company_logo || job.logo}
                company={job.company}
                className="w-10 h-10"
              />
              <div>
                <h3 className="font-extrabold text-stone-900 dark:text-white text-base">Applying for {job.company}</h3>
                <p className="text-xs text-stone-400 dark:text-slate-500">Redirecting to official application</p>
              </div>
            </div>

            {/* Countdown animation */}
            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-16 h-16 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">{countdown}</span>
              </div>
              <p className="text-xs text-stone-400 dark:text-slate-500 mt-3">Establishing secure redirect...</p>
            </div>

            {/* Safety Alert card */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl mb-6">
              <div className="flex gap-2.5">
                <span className="text-base flex-shrink-0">⚠️</span>
                <div className="text-xs leading-relaxed text-amber-800 dark:text-amber-400">
                  <strong>Important Notice:</strong> Daily Jobs Portal never charges candidates any fees. If this application or anyone asks you to pay money to get a job offer, it is a scam.
                </div>
              </div>
            </div>

            {/* Button Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={cancelRedirect}
                className="flex-1 py-3 px-4 rounded-xl border border-stone-200 dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-800 text-stone-500 dark:text-slate-400 font-semibold text-sm transition-colors"
                id="cancel-redirect-btn"
              >
                Cancel
              </button>
              <button
                onClick={skipRedirect}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                id="skip-redirect-btn"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Share Button */}
      <JobShareFloat job={job} />
    </main>
  );
}
