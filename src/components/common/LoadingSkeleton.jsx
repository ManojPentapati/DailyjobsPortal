export function JobCardSkeleton() {
  return (
    <div className="card-flat p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <div className="skeleton h-4 w-3/4 mb-2" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-5/6 mb-4" />
      <div className="flex gap-2 flex-wrap mb-4">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-6 w-12 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-9 flex-1 rounded-xl" />
        <div className="skeleton h-9 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded" />
        </td>
      ))}
    </tr>
  );
}

export function StatsSkeleton() {
  return (
    <div className="card-flat p-6 animate-pulse">
      <div className="skeleton h-10 w-10 rounded-xl mb-3" />
      <div className="skeleton h-8 w-20 mb-2" />
      <div className="skeleton h-4 w-28" />
    </div>
  );
}

export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}
