import { ShieldCheck, Info, FileText, CheckCircle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal & Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white tracking-tight mb-3">
            Website <span style={{ color: "#FF9900" }}>Disclaimer</span>
          </h1>
          <p className="text-stone-600 dark:text-slate-400 text-sm sm:text-base">
            Last Updated: July 20, 2026 | Daily Jobs Portal Official Notice
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200 dark:border-stone-800 shadow-sm space-y-8 text-stone-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          
          <section className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-amber-500" />
              <span>Important Notice to Job Seekers</span>
            </h2>
            <p className="text-stone-600 dark:text-slate-300 text-sm">
              Daily Jobs Portal (dailyjobs-portal.vercel.app) is an independent job information aggregator and career resource platform. We <strong>never ask for money</strong> or charge job seekers for applications or recruitment services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">1. General Information & Purpose</h2>
            <p>
              All information provided on <strong>Daily Jobs Portal</strong> is published in good faith and for general informational and career guidance purposes only. While our team makes every effort to verify job listings, qualifications, and deadlines, we make no warranties about the completeness, reliability, or accuracy of third-party company hiring details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">2. No Fee Policy & Fraud Prevention</h2>
            <p>
              Daily Jobs Portal strictly adheres to fair recruitment practices. 
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>We do not collect candidate application fees, deposit fees, or training charges.</li>
              <li>Official hiring processes by genuine companies (such as TCS, Infosys, Amazon, Cognizant, Wipro, etc.) do not require candidates to pay money for job offers.</li>
              <li>If any individual or agency impersonating a recruiter asks for money in exchange for a job offer, treat it as fraudulent and report it immediately.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">3. External Third-Party Links Disclaimer</h2>
            <p>
              Our website contains direct application links and redirects to official corporate career websites, ATS systems (Workday, Greenhouse, Lever, Google Forms), and third-party career portals. When you click on external application links, you leave Daily Jobs Portal.
            </p>
            <p className="mt-2">
              We have no control over the nature, content, privacy policies, or practices of external third-party sites. The inclusion of any link does not necessarily imply a recommendation or endorsement of the views expressed within them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">4. Intellectual Property & Trademarks</h2>
            <p>
              All company logos, brand names, product names, and registered trademarks displayed on Daily Jobs Portal are the property of their respective owners. Their display on this site is strictly for identification and informational purposes and does not imply endorsement or affiliation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3">5. Editorial & Content Accuracy</h2>
            <p>
              Job vacancies, application deadlines, eligibility criteria, and interview schedules are subject to change by the respective hiring organizations at any time without prior notice. We encourage candidates to review official corporate career portals before submitting personal information.
            </p>
          </section>

          <section className="pt-6 border-t border-stone-200 dark:border-stone-800">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-2">Contact Us Regarding Policy Inquiries</h2>
            <p className="text-sm text-stone-600 dark:text-slate-400">
              If you have any questions or require further information regarding our Disclaimer or website policies, please feel free to reach out to us at:
            </p>
            <p className="mt-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
              Email: dailyjobsposting@gmail.com | Location: Hyderabad, Telangana, India
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
