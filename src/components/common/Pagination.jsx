import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav
      className="flex items-center justify-center gap-1.5 mt-8"
      aria-label="Pagination"
      id="pagination-nav"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                   text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
                   disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Previous page"
        id="pagination-prev"
      >
        <ChevronLeft className="w-4 h-4" />
        Prev
      </button>

      {getPages().map((page, idx) =>
        page === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
              currentPage === page
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
            id={`pagination-page-${page}`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                   text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
                   disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Next page"
        id="pagination-next"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
