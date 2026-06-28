import { SearchX, FolderOpen, Inbox } from "lucide-react";

const variants = {
  search: {
    Icon: SearchX,
    title: "No jobs found",
    desc: "Try adjusting your search or filters to find more results.",
    color: "text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
  },
  empty: {
    Icon: FolderOpen,
    title: "Nothing here yet",
    desc: "There are no items to display right now.",
    color: "text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
  },
  inbox: {
    Icon: Inbox,
    title: "All caught up!",
    desc: "No new items waiting for you.",
    color: "text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
};

export default function EmptyState({
  variant = "search",
  title,
  description,
  action,
}) {
  const { Icon, title: defaultTitle, desc, color, bg } = variants[variant];

  return (
    <div
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
      id="empty-state"
      role="status"
      aria-live="polite"
    >
      <div className={`w-20 h-20 ${bg} rounded-2xl flex items-center justify-center mb-5`}>
        <Icon className={`w-10 h-10 ${color}`} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6">
        {description || desc}
      </p>
      {action && action}
    </div>
  );
}
