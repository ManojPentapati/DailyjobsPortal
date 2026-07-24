import { createClient } from "@supabase/supabase-js";

const {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(VITE_SUPABASE_URL || "", supabaseKey);

// Helper: Fuzzy title key generator (strips parentheticals, punctuation, and filler words)
function getFuzzyKey(company, title) {
  const normCompany = (company || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normTitle = (title || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // Strip city/regional parentheticals
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(fresher|freshers|trainee|intern|internship|associate|junior|sr|senior)\b/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join("");
  return `${normCompany}-${normTitle}`;
}

// Helper: Normalize apply URL by stripping tracking queries and trailing slashes
function getCleanLink(url) {
  if (!url) return "";
  return url.toLowerCase().split("?")[0].replace(/\/$/, "");
}

export default async function handler(req, res) {
  try {
    const now = new Date().toISOString();
    console.log(`[Dedupe-Jobs Bot] Starting automated fuzzy duplicate scan at ${now}...`);

    // Fetch all jobs ordered by posted_date descending (newest first)
    const { data: jobs, error: fetchError } = await supabase
      .from("jobs")
      .select("id, title, company, location, apply_link, posted_date, is_active")
      .order("posted_date", { ascending: false });

    if (fetchError) {
      console.error("[Dedupe-Jobs Bot] Error fetching jobs:", fetchError.message);
      return res.status(500).json({ error: fetchError.message });
    }

    console.log(`[Dedupe-Jobs Bot] Scanning ${jobs?.length || 0} total jobs...`);

    const seenFuzzyKeys = new Map();
    const seenLinks = new Map();
    const duplicateIds = [];
    const duplicateRecords = [];

    if (jobs && jobs.length > 0) {
      for (const job of jobs) {
        const fuzzyKey = getFuzzyKey(job.company, job.title);
        const cleanLink = getCleanLink(job.apply_link);

        let isDuplicate = false;
        let matchedReason = "";

        if (seenFuzzyKeys.has(fuzzyKey)) {
          isDuplicate = true;
          matchedReason = `Fuzzy Title Match with "${seenFuzzyKeys.get(fuzzyKey).title}"`;
        } else if (cleanLink && seenLinks.has(cleanLink)) {
          isDuplicate = true;
          matchedReason = `URL Match with "${seenLinks.get(cleanLink).title}"`;
        }

        if (isDuplicate) {
          duplicateIds.push(job.id);
          duplicateRecords.push({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            posted_date: job.posted_date,
            reason: matchedReason
          });
        } else {
          seenFuzzyKeys.set(fuzzyKey, job);
          if (cleanLink) seenLinks.set(cleanLink, job);
        }
      }
    }

    let deletedCount = 0;
    if (duplicateIds.length > 0) {
      console.log(`[Dedupe-Jobs Bot] Deleting ${duplicateIds.length} duplicate job records from database...`);
      
      const { error: deleteError } = await supabase
        .from("jobs")
        .delete()
        .in("id", duplicateIds);

      if (deleteError) {
        console.error("[Dedupe-Jobs Bot] Error deleting duplicates:", deleteError.message);
        return res.status(500).json({ error: deleteError.message });
      }

      deletedCount = duplicateIds.length;
      console.log(`[Dedupe-Jobs Bot] Successfully deleted ${deletedCount} duplicate jobs.`);
    }

    return res.status(200).json({
      success: true,
      message: "Automated duplicate scan and cleanup completed successfully.",
      totalScanned: jobs?.length || 0,
      deletedCount,
      deletedJobs: duplicateRecords,
      time: now,
    });
  } catch (err) {
    console.error("[Dedupe-Jobs Bot] Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
