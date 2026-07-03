import { Link } from "react-router-dom";
import { Briefcase, Mail, Phone, MapPin, Heart, ArrowUpRight } from "lucide-react";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Browse Jobs" },
  { to: "/categories", label: "Categories" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/admin/login", label: "Admin Panel" },
];

const categories = [
  "Software Development", "Data Science", "AI / ML",
  "Testing / QA", "Cloud Computing", "Cyber Security",
  "UI/UX Design", "DevOps",
];



export default function Footer() {
  return (
    <div className="px-2 sm:px-4 pb-2 mt-8">
      <footer
        className="bg-white dark:bg-stone-950/80 text-stone-500 dark:text-slate-400 border border-stone-200 dark:border-white/[0.08] rounded-2xl backdrop-blur-xl"
        style={{ boxShadow: "0 -1px 4px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.05)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 py-10 sm:py-14">

            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #FF9900 0%, #e67700 100%)", boxShadow: "0 4px 14px rgba(255,153,0,0.4)" }}>
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div className="leading-none">
                  <div>
                    <span className="text-sm font-extrabold text-stone-900 dark:text-white">Daily</span>
                    <span className="text-sm font-extrabold" style={{ color: "#FF9900" }}>Jobs</span>
                  </div>
                  <p className="text-[10px] text-stone-400 dark:text-slate-500 font-medium tracking-widest uppercase mt-0.5">Portal</p>
                </div>
              </Link>
              <p className="text-sm leading-relaxed text-stone-500 dark:text-slate-500 mb-6">
                India's fastest-growing job portal connecting top tech talent with world-class companies.
              </p>
              <div className="flex flex-col gap-2.5 text-sm">
                {[
                  { Icon: Mail, text: "srimanoj.pentapati@gmail.com", href: "mailto:srimanoj.pentapati@gmail.com" },
                  { Icon: Phone, text: "+91 9550250484", href: "tel:+919550250484" },
                  { Icon: MapPin, text: "Hyderabad, India", href: "#" },
                ].map(({ Icon, text, href }) => (
                  <a key={text} href={href} className="flex items-center gap-2.5 text-stone-500 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-200">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {text}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-stone-900 dark:text-white text-xs font-bold uppercase tracking-widest mb-5">Quick Links</h3>
              <ul className="flex flex-col gap-2.5">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-stone-500 dark:text-slate-500 hover:text-stone-900 dark:hover:text-slate-200 transition-colors duration-200 flex items-center gap-1.5 group">
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-stone-900 dark:text-white text-xs font-bold uppercase tracking-widest mb-5">Job Categories</h3>
              <ul className="flex flex-col gap-2.5">
                {categories.map((cat) => (
                  <li key={cat}>
                    <Link to={`/jobs?category=${encodeURIComponent(cat)}`}
                      className="text-sm text-stone-500 dark:text-slate-500 hover:text-stone-900 dark:hover:text-slate-200 transition-colors duration-200 flex items-center gap-1.5 group">
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* WhatsApp Channel */}
            <div>
              <h3 className="text-stone-900 dark:text-white text-xs font-bold uppercase tracking-widest mb-5">Get Job Alerts</h3>
              <p className="text-sm text-stone-500 dark:text-slate-500 mb-4 leading-relaxed">Join our WhatsApp Channel for instant daily job updates. No spam, just fresh opportunities.</p>
              <a
                href="https://whatsapp.com/channel/0029VbCRYZN0Qeaep5uwNY3f"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-lg"
                style={{ background: "#25D366", boxShadow: "0 4px 14px rgba(37, 211, 102, 0.35)" }}
                id="footer-whatsapp-channel"
              >
                <svg viewBox="0 0 32 32" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path d="M16.004 2.667A13.28 13.28 0 0 0 2.667 15.89a13.18 13.18 0 0 0 1.78 6.633L2.667 29.333l7.04-1.845A13.28 13.28 0 0 0 16.004 29.2 13.28 13.28 0 0 0 29.333 15.89 13.28 13.28 0 0 0 16.004 2.667Zm0 24.266a11.01 11.01 0 0 1-5.613-1.534l-.403-.24-4.176 1.095 1.115-4.072-.263-.418a10.94 10.94 0 0 1-1.68-5.874A11.02 11.02 0 0 1 16.004 4.93 11.02 11.02 0 0 1 27.07 15.89a11.02 11.02 0 0 1-11.066 11.043Zm6.064-8.275c-.332-.167-1.968-.97-2.273-1.082-.305-.112-.527-.167-.75.167-.221.333-.86 1.082-1.054 1.304-.194.222-.389.25-.721.083-.333-.167-1.404-.517-2.674-1.65-.988-.88-1.656-1.968-1.85-2.3-.194-.333-.02-.513.146-.679.15-.149.333-.389.5-.583.166-.194.221-.333.333-.555.111-.222.055-.417-.028-.583-.083-.167-.75-1.806-1.027-2.472-.271-.65-.546-.561-.75-.572l-.638-.011a1.225 1.225 0 0 0-.888.417c-.305.333-1.166 1.138-1.166 2.775 0 1.638 1.194 3.22 1.36 3.443.166.222 2.35 3.588 5.695 5.032.796.344 1.417.55 1.902.703.799.254 1.527.218 2.102.132.641-.095 1.968-.804 2.246-1.581.277-.778.277-1.444.194-1.583-.083-.14-.305-.222-.638-.389Z" />
                </svg>
                Join WhatsApp Channel
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-stone-200 dark:border-white/[0.08] py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-stone-400 dark:text-slate-500 flex items-center gap-1.5">
              © {new Date().getFullYear()} DailyJobs Portal · Made with
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              in India
            </p>

            <div className="flex items-center gap-1.5">
              <a
                href="https://whatsapp.com/channel/0029VbCRYZN0Qeaep5uwNY3f"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Channel"
                title="Join our WhatsApp Channel"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "#25D366" }}
                id="footer-social-whatsapp"
              >
                <svg viewBox="0 0 32 32" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path d="M16.004 2.667A13.28 13.28 0 0 0 2.667 15.89a13.18 13.18 0 0 0 1.78 6.633L2.667 29.333l7.04-1.845A13.28 13.28 0 0 0 16.004 29.2 13.28 13.28 0 0 0 29.333 15.89 13.28 13.28 0 0 0 16.004 2.667Zm0 24.266a11.01 11.01 0 0 1-5.613-1.534l-.403-.24-4.176 1.095 1.115-4.072-.263-.418a10.94 10.94 0 0 1-1.68-5.874A11.02 11.02 0 0 1 16.004 4.93 11.02 11.02 0 0 1 27.07 15.89a11.02 11.02 0 0 1-11.066 11.043Zm6.064-8.275c-.332-.167-1.968-.97-2.273-1.082-.305-.112-.527-.167-.75.167-.221.333-.86 1.082-1.054 1.304-.194.222-.389.25-.721.083-.333-.167-1.404-.517-2.674-1.65-.988-.88-1.656-1.968-1.85-2.3-.194-.333-.02-.513.146-.679.15-.149.333-.389.5-.583.166-.194.221-.333.333-.555.111-.222.055-.417-.028-.583-.083-.167-.75-1.806-1.027-2.472-.271-.65-.546-.561-.75-.572l-.638-.011a1.225 1.225 0 0 0-.888.417c-.305.333-1.166 1.138-1.166 2.775 0 1.638 1.194 3.22 1.36 3.443.166.222 2.35 3.588 5.695 5.032.796.344 1.417.55 1.902.703.799.254 1.527.218 2.102.132.641-.095 1.968-.804 2.246-1.581.277-.778.277-1.444.194-1.583-.083-.14-.305-.222-.638-.389Z" />
                </svg>
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-slate-500">
              <Link to="/privacy" className="hover:text-stone-700 dark:hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <span className="text-stone-300 dark:text-slate-700">·</span>
              <Link to="/terms" className="hover:text-stone-700 dark:hover:text-slate-300 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
