import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Mail, Info, ArrowLeft } from "lucide-react";

export default function TermsConditions() {
  useEffect(() => {
    document.title = "Terms of Service – Daily Jobs Portal";
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-stone-950/20" id="terms-conditions-page">
      <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-md">
        
        {/* Back Button */}
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-6 text-sm min-h-[44px]"
          id="terms-back-btn"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </Link>
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-center text-amber-500">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">Terms of Service</h1>
            <p className="text-xs text-stone-400 dark:text-slate-500 mt-1">Last Updated: July 3, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm sm:text-base text-stone-600 dark:text-slate-300 leading-relaxed">
          
          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing and using **Daily Jobs Portal** (accessible at <a href="https://dailyjobs-portal.vercel.app" className="text-amber-600 hover:underline">https://dailyjobs-portal.vercel.app</a>), you agree to be bound by these Terms of Service. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">2. Use License & Restrictions</h2>
            <p className="mb-3">
              Daily Jobs Portal provides curated tech job listings. You are granted permission to temporarily view the listings for personal, non-commercial use.
            </p>
            <p className="mb-3">Under this license, you may not:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use automatic scrapers, spiders, or bots to harvest data or copy job posts from our platform.</li>
              <li>Modify or copy the materials for commercial gain.</li>
              <li>Attempt to decompile, reverse engineer, or exploit any software contained on the portal.</li>
              <li>Use our brand name or logo without prior written consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">3. Disclaimer of Warranties</h2>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-stone-950/40 border border-slate-200/50 dark:border-white/[0.04] mb-4 flex gap-3.5">
              <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
                Daily Jobs Portal acts strictly as a **curator** of job listings. We compile official job links posted by employers online. We do not represent any employer, manage hiring decisions, or guarantee job placement. All job listings are provided "as is" without warranties of accuracy.
              </div>
            </div>
            <p>
              We do not verify individual recruiter background profiles. Users are strongly advised to perform due diligence before sharing personal details, resumes, or certificates during interviews.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">4. Limitation of Liability</h2>
            <p>
              In no event shall Daily Jobs Portal, its owners, or developers be held liable for any damages (including, without limitation, damages for loss of data, loss of job opportunities, or business interruption) arising out of the use or inability to use the listings, even if notified of such possibilities.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">5. Zero Fee Policy (Anti-Scam)</h2>
            <p>
              Daily Jobs Portal is **100% free** for job seekers. We never charge money, request registration payments, or ask for payment processing details to apply for roles. If you receive any email, message, or phone call claiming to represent us and asking for payments, it is fraudulent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">6. Modifications to Service</h2>
            <p>
              We reserve the right to revise or discontinue any part of the service, database, or listings without notice. By using the site, you agree to be bound by the current version of these Terms of Service.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">7. Contact Us</h2>
            <p className="mb-4">
              If you have any questions or reports regarding compliance with these Terms, feel free to reach out to us:
            </p>
            <a 
              href="mailto:srimanoj.pentapati@gmail.com" 
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-stone-50 dark:bg-stone-950/40 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition-colors text-amber-600 dark:text-amber-400 font-semibold"
            >
              <Mail className="w-4 h-4" />
              srimanoj.pentapati@gmail.com
            </a>
          </section>

        </div>
      </div>
    </main>
  );
}
