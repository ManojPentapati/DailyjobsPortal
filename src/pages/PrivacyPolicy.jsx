import { useEffect } from "react";
import { ShieldCheck, Mail, ShieldAlert } from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy – Daily Jobs Portal";
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-stone-950/20" id="privacy-policy-page">
      <div className="max-w-4xl mx-auto bg-white dark:bg-stone-900 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-md">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-center text-amber-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-stone-400 dark:text-slate-500 mt-1">Last Updated: July 3, 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm sm:text-base text-stone-600 dark:text-slate-300 leading-relaxed">
          
          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to the **Daily Jobs Portal** (accessible at <a href="https://dailyjobs-portal.vercel.app" className="text-amber-600 hover:underline">https://dailyjobs-portal.vercel.app</a>). We value your privacy and are committed to protecting your personal data. This Privacy Policy document contains information on how we collect, store, and safeguard your details when you use our website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3">
              We collect information to provide a better user experience and communicate job updates effectively:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Email Addresses:</strong> When you subscribe to our dynamic Daily Job Alerts Newsletter, we securely store your email in our database.
              </li>
              <li>
                <strong>Log Files & Analytics:</strong> Like most websites, we collect basic log files automatically (including IP addresses, browser type, referring pages, and timestamp) to analyze site trends and traffic.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">3. Google AdSense & Cookies</h2>
            <p className="mb-4">
              We use third-party advertising companies, specifically <strong>Google AdSense</strong>, to serve advertisements when you visit our website. 
            </p>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-stone-950/40 border border-slate-200/50 dark:border-white/[0.04] mb-4 flex gap-3.5">
              <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
                Google, as a third-party vendor, uses cookies to serve ads based on user visits to our site and other sites on the Internet. Google’s use of advertising cookies enables it and its partners to serve ads to users based on their visit to our sites and/or other sites on the Internet.
              </div>
            </div>
            <p>
              You can choose to disable cookies through your individual browser options. Additionally, visitors can manage or opt-out of personalized advertising cookies by visiting Google's <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline">Ad Settings page</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">4. How We Use Your Information</h2>
            <p className="mb-3">
              Any of the information we collect from you may be used in one of the following ways:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To personalize your browsing experience and display relevant tech job opportunities.</li>
              <li>To send you periodic newsletters with the latest daily job openings (you can unsubscribe at any time).</li>
              <li>To optimize website performance and design layout.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">5. Third-Party Links</h2>
            <p>
              Our website contains direct, official application links pointing to external career portals (such as Google Forms, Greenhouse, Lever, Workday, or corporate website portals). We do not control or take responsibility for the content, privacy policies, or practices of any third-party websites you visit through these links.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">6. Consent</h2>
            <p>
              By using our website, you hereby consent to our Privacy Policy and agree to its terms.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-stone-950 dark:text-white mb-3">7. Contact Us</h2>
            <p className="mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data, feel free to contact us directly:
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
