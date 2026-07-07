import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Building2, ArrowUpRight } from "lucide-react";
import CategoryCard from "../components/ui/CategoryCard";
import CompanyLogo from "../components/common/CompanyLogo";
import { buildDynamicCategories } from "../data/jobs";
import { useJobs } from "../context/JobContext";

export default function Categories() {
  const { adminJobs } = useJobs();
  useEffect(() => { document.title = "Explore Jobs – Daily Jobs Portal"; }, []);

  const categoryStats = buildDynamicCategories(adminJobs).filter(c => c.count > 0);

  // Group active jobs by company dynamically
  const companyStats = Object.entries(
    adminJobs.reduce((acc, job) => {
      if (job.is_active) {
        acc[job.company] = (acc[job.company] || 0) + 1;
      }
      return acc;
    }, {})
  )
    .map(([name, count]) => {
      const match = adminJobs.find(j => j.company === name && j.is_active);
      return {
        name,
        count,
        logo: match?.company_logo || match?.logo,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 12); // Show top 12 hiring companies

  return (
    <main id="categories-page">
      {/* Hero Section */}
      <section className="bg-stone-50 dark:bg-[#0f1d32] py-16 border-b border-stone-200 dark:border-slate-800/60" aria-labelledby="cats-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700/50 rounded-full text-amber-700 dark:text-amber-400 text-sm font-medium mb-6">
            <LayoutGrid className="w-4 h-4" /> Explore Opportunities
          </div>
          <h1 id="cats-heading" className="text-4xl font-extrabold mb-4 text-stone-900 dark:text-white">Explore Jobs</h1>
          <p className="text-stone-500 dark:text-slate-300 text-lg">Search roles by functional domain or discover jobs at top hiring companies</p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-100 dark:border-slate-800/40">
        <div className="flex items-center gap-2 mb-8">
          <LayoutGrid className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">Browse by Domain</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {categoryStats.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Building2 className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">Explore Top Companies</h2>
        </div>
        
        {companyStats.length === 0 ? (
          <div className="text-center py-10 text-stone-400">No active companies found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {companyStats.map((company) => (
              <Link
                key={company.name}
                to={`/jobs?company=${encodeURIComponent(company.name)}`}
                className="group border border-stone-250 dark:border-white/[0.06] hover:border-amber-300 dark:hover:border-amber-600 p-4 sm:p-5 flex flex-col items-center text-center gap-3 hover:shadow-lg active:scale-[0.97] hover:-translate-y-1 transition-all duration-300 rounded-2xl bg-white dark:bg-white/[0.04]"
                aria-label={`View jobs at ${company.name}`}
              >
                <CompanyLogo
                  logo={company.logo}
                  company={company.name}
                  className="w-12 h-12 sm:w-14 sm:h-14 p-1 rounded-xl bg-white border border-stone-100 dark:border-stone-800 shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
                <div className="w-full">
                  <h3 className="font-semibold text-stone-800 dark:text-slate-100 text-xs sm:text-sm leading-tight mb-1 truncate group-hover:text-amber-500 transition-colors">
                    {company.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500">
                      {company.count} Active {company.count === 1 ? 'Job' : 'Jobs'}
                    </span>
                    <ArrowUpRight className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
