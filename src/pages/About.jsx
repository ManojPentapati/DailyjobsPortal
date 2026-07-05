import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Users, Shield, Globe, Heart, Target, Mail } from "lucide-react";

const values = [
  { icon: Shield, title: "100% Free & Transparent", desc: "We never charge job seekers any fees. Every listing is verified and free to apply." },
  { icon: Target, title: "Curated Opportunities", desc: "We handpick jobs from top companies so you only see relevant, high-quality listings." },
  { icon: Globe, title: "Pan-India Coverage", desc: "From Bangalore to Delhi, Hyderabad to remote — we cover opportunities across India." },
  { icon: Heart, title: "Built for Freshers", desc: "We focus on entry-level and early-career roles to help freshers land their first job." },
];

export default function About() {
  useEffect(() => {
    document.title = "About Us – Daily Jobs Portal";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = "Learn about Daily Jobs Portal — India's fastest-growing free job portal connecting freshers and tech talent with top companies.";

    return () => {
      document.title = "Daily Jobs Portal – Find Your Next Tech Opportunity";
      const m = document.querySelector('meta[name="description"]');
      if (m) m.content = "Daily Jobs Portal – Find your next tech opportunity in India.";
    };
  }, []);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16" id="about-page">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-5">
          <Briefcase className="w-3.5 h-3.5" /> About Us
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white mb-4 leading-tight">
          Connecting India's <span style={{ color: "#FF9900" }}>Top Talent</span> with Great Companies
        </h1>
        <p className="text-base sm:text-lg text-stone-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Daily Jobs Portal is a free job discovery platform built for freshers, students, and early-career professionals looking for their next opportunity in tech.
        </p>
      </div>

      {/* Mission */}
      <div className="card-flat p-6 sm:p-8 mb-10">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-500" /> Our Mission
        </h2>
        <p className="text-stone-600 dark:text-slate-300 text-sm leading-relaxed">
          We believe that finding a job shouldn't cost you money. Our mission is to eliminate the noise from job searching by
          curating only verified, high-quality listings from trusted companies. Every day, we aggregate job postings from across
          the web and social media, verify them, and present them in a clean, searchable portal — completely free for job seekers.
        </p>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-6 text-center">What We Stand For</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {values.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-flat p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900 dark:text-white text-sm mb-1">{title}</h3>
                <p className="text-xs text-stone-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="card-flat p-6 sm:p-8 mb-10">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" /> How It Works
        </h2>
        <div className="space-y-4 text-sm text-stone-600 dark:text-slate-300 leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
            <p><strong>We source jobs daily</strong> — our team and automated tools scan hundreds of sources including company career pages, social media channels, and recruitment platforms.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
            <p><strong>We verify and organize</strong> — each job is categorized by role, location, experience level, and skills so you can find exactly what you're looking for.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
            <p><strong>You apply directly</strong> — we redirect you to the company's official application page. No middlemen, no fees, no scams.</p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="text-center">
        <p className="text-stone-500 dark:text-slate-400 text-sm mb-4">Have questions or want to partner with us?</p>
        <Link to="/contact" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
          <Mail className="w-4 h-4" /> Get in Touch
        </Link>
      </div>
    </main>
  );
}
