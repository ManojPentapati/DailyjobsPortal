// Utility: format date distance
export function formatDistanceToNow(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function isToday(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export function isWithinHours(dateString, hours = 24) {
  const date = new Date(dateString);
  const now = new Date();
  return (now - date) / 3600000 <= hours;
}
