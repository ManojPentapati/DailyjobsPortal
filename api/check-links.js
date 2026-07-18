import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper: check if a link is dead or closed
const checkLinkStatus = async (url) => {
  try {
    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 3500,
      validateStatus: (status) => true, // Don't throw error on non-200, we handle it
    });

    if (res.status === 404) {
      return { dead: true, reason: "404 Not Found" };
    }

    if (res.status === 200 && typeof res.data === "string") {
      const html = res.data.toLowerCase();
      const closedIndicators = [
        "no longer accepting responses",
        "no longer accepting applications",
        "job is closed",
        "this position is no longer",
        "is no longer active",
        "form is closed",
        "responses are no longer",
        "this form has been deactivated",
        "form_closed_error"
      ];

      for (const indicator of closedIndicators) {
        if (html.includes(indicator)) {
          return { dead: true, reason: `Closed indicator: "${indicator}"` };
        }
      }
    }

    return { dead: false };
  } catch (err) {
    // If it timed out or blocked (e.g. 403), we assume it's still active for users to be safe
    return { dead: false };
  }
};

export default async function handler(req, res) {
  try {
    const now = new Date().toISOString();
    console.log(`[Link Checker] Initiating check for active job links...`);

    // Fetch all remaining active jobs to check links
    const { data: activeJobs, error: fetchError } = await supabase
      .from("jobs")
      .select("id, apply_link, title, company")
      .eq("is_active", true);

    if (fetchError) {
      console.error("[Link Checker] Error fetching active jobs:", fetchError.message);
      return res.status(500).json({ error: fetchError.message });
    }

    console.log(`[Link Checker] Fetching status for ${activeJobs?.length || 0} active job links...`);

    let deactivatedCount = 0;
    const deactivatedJobs = [];

    if (activeJobs && activeJobs.length > 0) {
      // Check links in parallel (capped at 3.5s per link timeout)
      const checks = activeJobs.map(async (job) => {
        if (!job.apply_link) return;
        const status = await checkLinkStatus(job.apply_link);
        if (status.dead) {
          console.log(`[Link Checker] Deactivating job "${job.title}" at "${job.company}". Reason: ${status.reason}`);
          deactivatedCount++;
          deactivatedJobs.push({ id: job.id, title: job.title, company: job.company, reason: status.reason });
          await supabase
            .from("jobs")
            .update({ is_active: false })
            .eq("id", job.id);
        }
      });
      await Promise.all(checks);
    }

    return res.status(200).json({
      success: true,
      message: "Dead and closed links verified and deactivated successfully.",
      deactivatedCount,
      deactivatedJobs,
      time: now,
    });
  } catch (err) {
    console.error("[Link Checker] Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
