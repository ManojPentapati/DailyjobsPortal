import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin, Clock, Briefcase, Banknote,
  Bookmark, BookmarkCheck, Building2, ArrowUpRight, Share2
} from "lucide-react";
import { formatDistanceToNow, isWithinHours, getExpiryInfo, getApplyTimeInfo } from "../utils/dateUtils";
import CompanyLogo from "../common/CompanyLogo";

import { useJobs } from "../../context/JobContext";

export default function JobCard({ job, compact = false }) {
  const { savedJobs, toggleSaveJob } = useJobs();
  const navigate = useNavigate();
  const isNew = job.posted_date ? isWithinHours(job.posted_date, 24) : false;
  const expiry = getExpiryInfo(job.expires_at);
  const applyTimeInfo = getApplyTimeInfo(job.apply_link);

  const saved = savedJobs.includes(job.id);

  const toggleSave = (e) => {
    e.stopPropagation();
    toggleSaveJob(job.id);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/jobs/${job.id}`;
    const shareText = `\ud83d\ude80 *${job.title}* at *${job.company}*\n\ud83d\udccd ${job.location || "India"}\n\ud83d\udcbc ${job.experience || "Freshers"}\n${job.salary ? `\ud83d\udcb0 ${job.salary}\n` : ""}\ud83d\udd17 Apply: ${shareUrl}\n\n\u2014 via Daily Jobs Portal`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <article
      className="card group p-5 flex flex-col gap-4 cursor-pointer"
      aria-label={`${job.title} at ${job.company}`}
      id={`job-card-${job.id}`}
      onClick={() => navigate(`/jobs/${job.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Logo */}
          <CompanyLogo
            logo={job.company_logo || job.logo}
            company={job.company}
            className="w-11 h-11"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200 line-clamp-1">
              {job.title}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
              <Building2 className="w-3 h-3 inline" />
              {job.company}
            </p>
          </div>
        </div>

        {/* Actions (Save & Share) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleShare}
            aria-label="Share to WhatsApp"
            title="Share to WhatsApp"
            className="p-1.5 rounded-lg text-slate-350 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-450 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all"
            id={`share-job-${job.id}`}
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSave}
            aria-label={saved ? "Unsave" : "Save job"}
            className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all"
            id={`save-job-${job.id}`}
          >
            {saved ? (
              <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {isNew && <span className="badge-new">● New</span>}
        {job.is_featured && <span className="badge-featured">★ Featured</span>}
        {expiry && <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${expiry.colorClass}`}>⏳ {expiry.label}</span>}
        {applyTimeInfo && <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${applyTimeInfo.colorClass}`}>⏱️ {applyTimeInfo.label}</span>}
        <span className="badge-type">{job.category || job.type}</span>
        {job.job_type && (
          <span className="badge-type bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50">
            {job.job_type}
          </span>
        )}
        {job.qualification && (
          <span className="badge-type bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-905/50">
            {job.qualification}
          </span>
        )}
        {job.passout_year && job.passout_year !== "Any" && (() => {
          const years = job.passout_year.split(", ").filter(Boolean).sort();
          const label = years.length > 2
            ? `${years[0]}-${years[years.length - 1]} Batch`
            : `${years.join(", ")} Batch`;
          return (
            <span className="badge-type bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-905/50">
              {label}
            </span>
          );
        })()}
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
          <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{job.experience}</span>
        </div>
        {job.salary && (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold col-span-2">
            <Banknote className="w-3.5 h-3.5 flex-shrink-0" />
            {job.salary}
          </div>
        )}
      </div>

      {/* Skills */}
      {!compact && job.skills && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-medium">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700/80 text-slate-400 rounded-md text-[11px]">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(job.posted_date || job.postedDate)}
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/jobs/${job.id}`}
            onClick={(e) => e.stopPropagation()}
            className="btn-secondary text-xs py-1.5 px-3 rounded-lg"
            id={`view-details-${job.id}`}
          >
            Details
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (job.apply_link) {
                window.open(job.apply_link, "_blank", "noopener,noreferrer");
              } else {
                navigate(`/jobs/${job.id}`);
              }
            }}
            className="btn-primary text-xs py-1.5 px-3 rounded-lg"
            id={`apply-job-${job.id}`}
          >
            Apply <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
}
