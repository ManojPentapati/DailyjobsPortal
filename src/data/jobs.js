// Known category metadata (icon name + color theme)
export const CATEGORY_META = {
  "Software Development": { icon: "Code2", color: "blue" },
  "Data Science":         { icon: "BarChart3", color: "purple" },
  "AI / ML":              { icon: "Brain", color: "pink" },
  "Testing / QA":         { icon: "TestTube2", color: "green" },
  "Cloud Computing":      { icon: "Cloud", color: "cyan" },
  "Cyber Security":       { icon: "Shield", color: "red" },
  "UI/UX Design":         { icon: "Palette", color: "orange" },
  "DevOps & Cloud":       { icon: "GitBranch", color: "teal" },
  "Product Management":   { icon: "Briefcase", color: "indigo" },
  "Design":               { icon: "Palette", color: "yellow" },
};

// Color rotation for unknown categories
const FALLBACK_COLORS = ["blue", "purple", "pink", "green", "cyan", "red", "orange", "teal", "indigo", "yellow"];

/**
 * Build dynamic categories list from job data.
 * Merges known metadata with any new categories found in jobs.
 * @param {Array} jobs - Array of job objects with a `category` field
 * @returns {Array} Category objects with { id, name, icon, color, count }
 */
export function buildDynamicCategories(jobs = []) {
  // Count jobs per category
  const countMap = {};
  jobs.forEach((j) => {
    if (j.category) {
      countMap[j.category] = (countMap[j.category] || 0) + 1;
    }
  });

  // Start with known categories (in order)
  const knownNames = Object.keys(CATEGORY_META);
  const result = knownNames.map((name, i) => ({
    id: i + 1,
    name,
    icon: CATEGORY_META[name].icon,
    color: CATEGORY_META[name].color,
    count: countMap[name] || 0,
  }));

  // Add any new categories from jobs that aren't in the known list
  let nextId = result.length + 1;
  Object.keys(countMap).forEach((name) => {
    if (!CATEGORY_META[name]) {
      result.push({
        id: nextId++,
        name,
        icon: "Briefcase", // default icon
        color: FALLBACK_COLORS[(nextId - 2) % FALLBACK_COLORS.length],
        count: countMap[name],
      });
    }
  });

  return result;
}

// Static categories (backward compatibility for admin form dropdown)
export const categories = Object.keys(CATEGORY_META).map((name, i) => ({
  id: i + 1,
  name,
  icon: CATEGORY_META[name].icon,
  color: CATEGORY_META[name].color,
  count: 0,
}));

export const companies = [];

export const jobs = [];

export const stats = {
  totalJobs: 0,
  companiesHiring: 0,
  newJobsToday: 0,
};

