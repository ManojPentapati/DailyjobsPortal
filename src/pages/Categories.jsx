import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import CategoryCard from "../components/ui/CategoryCard";
import { buildDynamicCategories } from "../data/jobs";
import { useJobs } from "../context/JobContext";

export default function Categories() {
  const { adminJobs } = useJobs();
  useEffect(() => { document.title = "Job Categories – Daily Jobs Portal"; }, []);

  const categoryStats = buildDynamicCategories(adminJobs);

  return (
    <main id="categories-page">
      <section className="bg-stone-50 dark:bg-[#0f1d32] py-16 border-b border-stone-200 dark:border-slate-800/60" aria-labelledby="cats-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700/50 rounded-full text-amber-700 dark:text-amber-400 text-sm font-medium mb-6">
            <LayoutGrid className="w-4 h-4" /> Explore by Domain
          </div>
          <h1 id="cats-heading" className="text-4xl font-extrabold mb-4 text-stone-900 dark:text-white">All Job Categories</h1>
          <p className="text-stone-500 dark:text-slate-300 text-lg">Find your niche across India's most in-demand tech domains</p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {categoryStats.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>
    </main>
  );
}
