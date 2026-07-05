import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid } from "lucide-react";
import CategoryCard from "../ui/CategoryCard";
import { buildDynamicCategories } from "../../data/jobs";
import { useJobs } from "../../context/JobContext";

export default function CategoriesSection() {
  const { adminJobs } = useJobs();

  const categoryStats = buildDynamicCategories(adminJobs).filter(c => c.count > 0);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-stone-50 dark:bg-[#0f1d32]" aria-labelledby="categories-heading" id="categories-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-transparent border border-violet-300 dark:border-violet-500/30">
                <LayoutGrid className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-bold text-violet-600 dark:text-violet-300 uppercase tracking-wider">Browse by Domain</span>
              </div>
            </div>
            <h2 id="categories-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Explore Categories</h2>
            <p className="mt-2 text-stone-500 dark:text-slate-400 text-base leading-relaxed">Find your perfect role by area of expertise</p>
          </div>
          <Link to="/categories" className="hidden sm:flex items-center gap-2 flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-px bg-stone-100 dark:bg-white/[0.08] border border-stone-200 dark:border-white/[0.15] text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white" id="categories-view-all">
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {categoryStats.map((cat, i) => (
            <div key={cat.id} className="animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <CategoryCard category={cat} />
            </div>
          ))}
        </div>

        {/* Mobile "View All" link */}
        <div className="sm:hidden mt-6 text-center">
          <Link to="/categories" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-stone-100 dark:bg-white/[0.08] border border-stone-200 dark:border-white/[0.15] text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white" id="categories-view-all-mobile">
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
