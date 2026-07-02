// Helper to generate a clean, URL-friendly slug from company and job title
export function generateSlug(company, title) {
  const normalizedCompany = company
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  
  const normalizedTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
    
  const baseSlug = `${normalizedCompany}-${normalizedTitle}`.replace(/-+/g, "-");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseSlug}-${randomSuffix}`.substring(0, 100);
}
