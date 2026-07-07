import { useState, useRef, useEffect } from "react";
import { Share2, MessageSquare, Send, X } from "lucide-react";

export default function JobShareFloat({ job }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!job) return null;

  const shareUrl = window.location.href;
  const shareText = `🚀 *${job.title}* at *${job.company}*\n📍 ${job.location || "India"}\n💼 ${job.experience || "Freshers"}\n${job.salary ? `💵 ${job.salary}\n` : ""}🔗 Apply: ${shareUrl}\n\n— via Daily Jobs Portal`;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    setIsOpen(false);
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-[5.5rem] right-6 z-40 flex flex-col items-end" ref={menuRef} id="job-share-float">
      {/* Share Options Menu */}
      {isOpen && (
        <div className="mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 animate-slide-up min-w-[200px] backdrop-blur-md bg-white/95 dark:bg-slate-900/95">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800/80 mb-1">
            Share Job Opportunity
          </div>
          
          {/* WhatsApp Option */}
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold text-xs transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
              <MessageSquare className="w-4 h-4 fill-current" />
            </div>
            Share on WhatsApp
          </button>

          {/* Telegram Option */}
          <button
            onClick={shareTelegram}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/20 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 font-semibold text-xs transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center">
              <Send className="w-4 h-4 fill-current" />
            </div>
            Share on Telegram
          </button>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen 
            ? "bg-slate-800 dark:bg-slate-700 rotate-90" 
            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        }`}
        style={{
          boxShadow: isOpen 
            ? "0 4px 12px rgba(0,0,0,0.15)" 
            : "0 4px 14px rgba(245,158,11,0.45)"
        }}
        aria-label="Share options"
        title="Share this job"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
      </button>
    </div>
  );
}
