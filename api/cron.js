import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  try {
    const now = new Date().toISOString();
    console.log(`[Cron] Initiating cleanup for jobs expiring before: ${now}`);

    const { error } = await supabase
      .from("jobs")
      .delete()
      .lt("expires_at", now);

    if (error) {
      console.error("[Cron] Error running database cleanup query:", error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log("[Cron] Successfully cleaned up expired jobs from database.");
    return res.status(200).json({
      success: true,
      message: "Expired jobs successfully cleaned up.",
      time: now,
    });
  } catch (err) {
    console.error("[Cron] Handler error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
