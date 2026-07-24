import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHANNEL_ID = "",
  ALLOWED_USER_IDS = "",
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(VITE_SUPABASE_URL || "", supabaseKey);

// Helper: Escape HTML special characters
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Helper: Send message to Telegram
async function sendTelegramMessage(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN || !chatId) return;
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    });
  } catch (err) {
    console.error(`[Auto-Scraper] Telegram broadcast error to ${chatId}:`, err.message);
  }
}

// Helper: Generate URL slug
const generateSlug = (company, title) => {
  const normalizedCompany = (company || "tech").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
  const normalizedTitle = (title || "job").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
  const baseSlug = `${normalizedCompany}-${normalizedTitle}`.replace(/-+/g, "-");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${baseSlug}-${randomSuffix}`.substring(0, 100);
};

// Helper: Resolve logo URL
const fetchLogoUrl = (companyName, fallbackLogo) => {
  if (fallbackLogo && fallbackLogo.startsWith("http")) return fallbackLogo;

  const companyDomains = {
    google: "google.com", microsoft: "microsoft.com", amazon: "amazon.com",
    apple: "apple.com", facebook: "facebook.com", meta: "meta.com",
    netflix: "netflix.com", tcs: "tcs.com", infosys: "infosys.com",
    wipro: "wipro.com", cognizant: "cognizant.com", accenture: "accenture.com",
    flipkart: "flipkart.com", zomato: "zomato.com", swiggy: "swiggy.com",
    hcl: "hcltech.com", techmahindra: "techmahindra.com"
  };

  const cleanName = (companyName || "").toLowerCase().trim().replace(/\s+/g, "");
  let domain = companyDomains[cleanName];
  if (!domain) {
    domain = `${cleanName || "tech"}.com`;
  }
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
};

// Helper: Clean and format HTML to plain text
function cleanDescription(html) {
  if (!html) return "Exciting technical opportunity for freshers and early-career tech professionals.";
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.substring(0, 1200) + (text.length > 1200 ? "..." : "");
}

// Helper: Standardize tech category
function categorizeJob(title, tags = []) {
  const combined = (title + " " + tags.join(" ")).toLowerCase();
  if (combined.includes("data") || combined.includes("analytics") || combined.includes("sql")) return "Data Science";
  if (combined.includes("machine learning") || combined.includes("ai") || combined.includes("deep learning")) return "AI / ML";
  if (combined.includes("devops") || combined.includes("cloud") || combined.includes("aws") || combined.includes("kubernetes")) return "DevOps & Cloud";
  if (combined.includes("test") || combined.includes("qa") || combined.includes("automation")) return "Testing / QA";
  if (combined.includes("cyber") || combined.includes("security")) return "Cyber Security";
  if (combined.includes("ui") || combined.includes("ux") || combined.includes("design")) return "UI/UX Design";
  if (combined.includes("product manager") || combined.includes("product owner")) return "Product Management";
  return "Software Development";
}

export default async function handler(req, res) {
  try {
    console.log("[Auto-Scraper] Starting automated fresher tech job aggregation for all companies...");

    const scrapedJobs = [];

    // Source 1: Arbeitnow Tech Jobs API
    try {
      const { data: arbeitRes } = await axios.get("https://www.arbeitnow.com/api/v1/jobs", { timeout: 8000 });
      if (arbeitRes && arbeitRes.data && Array.isArray(arbeitRes.data)) {
        arbeitRes.data.slice(0, 20).forEach((item) => {
          if (item.title && item.url) {
            scrapedJobs.push({
              title: item.title,
              company: item.company_name || "Tech Corporation",
              location: item.location || "Remote / Across India",
              experience: "Freshers",
              salary: "Best in Industry",
              category: categorizeJob(item.title, item.tags || []),
              description: cleanDescription(item.description),
              skills: (item.tags || ["Software Engineering", "Coding", "Problem Solving"]).slice(0, 5),
              responsibilities: [
                "Build and maintain responsive software application features",
                "Work closely with engineering teams on technical solutions",
                "Write clean, well-tested, and maintainable code"
              ],
              qualification: "B.E / B.Tech / MCA / B.Sc / Any Graduate",
              passout_year: "2024, 2025, 2026, Any",
              job_type: "Full-time",
              apply_link: item.url,
              company_logo: null
            });
          }
        });
      }
    } catch (e1) {
      console.error("[Auto-Scraper] Arbeitnow API fetch failed:", e1.message);
    }

    // Source 2: Remotive Software Development Jobs API
    try {
      const { data: remotiveRes } = await axios.get("https://remotive.com/api/remote-jobs?category=software-dev&limit=20", { timeout: 8000 });
      if (remotiveRes && remotiveRes.jobs && Array.isArray(remotiveRes.jobs)) {
        remotiveRes.jobs.slice(0, 20).forEach((item) => {
          if (item.title && item.url) {
            scrapedJobs.push({
              title: item.title,
              company: item.company_name || "Global Tech Firm",
              location: item.candidate_required_location || "Remote",
              experience: "Freshers",
              salary: item.salary || "As per Market Standards",
              category: categorizeJob(item.title, item.tags || []),
              description: cleanDescription(item.description),
              skills: (item.tags || ["Full Stack", "JavaScript", "Python", "Problem Solving"]).slice(0, 5),
              responsibilities: [
                "Develop enterprise application components and REST APIs",
                "Perform unit testing, debugging, and software optimization",
                "Participate in technical design discussions and agile team sprints"
              ],
              qualification: "B.E / B.Tech / MCA / Computer Science Degree",
              passout_year: "2024, 2025, 2026, Any",
              job_type: "Full-time",
              apply_link: item.url,
              company_logo: item.company_logo_url || null
            });
          }
        });
      }
    } catch (e2) {
      console.error("[Auto-Scraper] Remotive API fetch failed:", e2.message);
    }

    console.log(`[Auto-Scraper] Fetched ${scrapedJobs.length} potential fresher tech job listings across all companies.`);

// Helper: Check if location is suitable for Indian job seekers (India or Remote open to India)
function isTargetLocation(locationStr) {
  if (!locationStr) return true;
  const loc = locationStr.toLowerCase();
  const excludedKeywords = [
    "usa", "us ", "us,", "us-", "canada", "israel", "europe", "americas",
    "timezone", "cst", "est", "pst", "jst", "uk ", "uk,", "uk-", "brazil",
    "mexico", "uruguay", "germany", "france", "spain", "italy", "poland",
    "sweden", "finland", "norway", "australia", "japan", "singapore only"
  ];
  return !excludedKeywords.some((keyword) => loc.includes(keyword));
}

// Helper: Fuzzy title key generator (strips location parentheticals and filler words)
function getFuzzyKey(company, title) {
  const normCompany = (company || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normTitle = (title || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // Strip city/regional parentheticals like (Campinas) or (Belo Horizonte)
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(fresher|freshers|trainee|intern|internship|associate|junior|sr|senior)\b/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .sort()
    .join("");
  return `${normCompany}-${normTitle}`;
}

    // Fetch existing active jobs to perform strict fuzzy duplicate checking
    const { data: existingActiveJobs } = await supabase
      .from("jobs")
      .select("id, title, company, apply_link")
      .eq("is_active", true);

    const existingKeys = new Set(
      (existingActiveJobs || []).map((j) => getFuzzyKey(j.company, j.title))
    );

    const existingLinks = new Set(
      (existingActiveJobs || []).map((j) =>
        (j.apply_link || "").toLowerCase().split("?")[0].replace(/\/$/, "")
      ).filter(Boolean)
    );

    let insertedCount = 0;
    let skippedCount = 0;
    const newInsertedJobs = [];

    for (const job of scrapedJobs) {
      if (!isTargetLocation(job.location)) {
        skippedCount++;
        continue;
      }

      const jobKey = getFuzzyKey(job.company, job.title);
      const cleanJobLink = (job.apply_link || "").toLowerCase().split("?")[0].replace(/\/$/, "");

      if (existingKeys.has(jobKey) || (cleanJobLink && existingLinks.has(cleanJobLink))) {
        skippedCount++;
        continue;
      }

      const logoUrl = fetchLogoUrl(job.company, job.company_logo);
      const jobSlug = generateSlug(job.company, job.title);

      // Expiration: 30 days for automated job postings
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error: dbError } = await supabase
        .from("jobs")
        .insert({
          title: job.title,
          company: job.company,
          company_logo: logoUrl,
          location: job.location,
          experience: job.experience,
          salary: job.salary,
          category: job.category,
          description: job.description,
          skills: job.skills,
          responsibilities: job.responsibilities,
          qualification: job.qualification,
          passout_year: job.passout_year,
          job_type: job.job_type,
          apply_link: job.apply_link,
          slug: jobSlug,
          is_active: true,
          is_featured: false,
          expires_at: expiresAt.toISOString(),
        });

      if (!dbError) {
        insertedCount++;
        newInsertedJobs.push({ ...job, slug: jobSlug });
      } else {
        console.error(`[Auto-Scraper] Failed to insert ${job.title}:`, dbError.message);
      }
    }

    // Broadcast new jobs to Telegram Channel & send WhatsApp copy block to Admin
    if (newInsertedJobs.length > 0) {
      const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
      const portalUrlBase = "https://dailyjobs-portal.vercel.app";

      // 1. Build WhatsApp version (using * for bold, no HTML tags)
      let whatsAppPost = `*📝 LATEST TECH JOB OPENINGS | ${today}*\n\n`;
      newInsertedJobs.forEach((job) => {
        const jobUrl = `${portalUrlBase}/jobs/${job.slug}`;
        whatsAppPost += `🌟 *${job.company.toUpperCase()} IS HIRING!* 🌟\n`;
        whatsAppPost += `━━━━━━━━━━━━━━━━━━━━\n`;
        whatsAppPost += `  ◈ *Role:* ${job.title}\n`;
        whatsAppPost += `  ◈ *Location:* ${job.location || "Across India"}\n`;
        whatsAppPost += `  ◈ *Degree:* ${job.qualification || "Any Graduate"}\n`;
        whatsAppPost += `  ◈ *Experience:* ${job.experience || "Freshers"}\n`;
        whatsAppPost += `  ◈ *Batch:* ${job.passout_year || "Any"}\n`;
        if (job.salary) {
          whatsAppPost += `  ◈ *Package:* ${job.salary}\n`;
        }
        whatsAppPost += `━━━━━━━━━━━━━━━━━━━━\n`;
        whatsAppPost += `🚀 *Apply Link:* ${jobUrl}\n`;
        whatsAppPost += `⏰ *Apply ASAP! Link expires in 30 days.*\n\n\n`;
      });
      whatsAppPost += `*📢 Share this opportunity with your Friends and WhatsApp Group ❤️*\n\n`;
      whatsAppPost += `*🌐 Search more tech jobs on our website:* \n`;
      whatsAppPost += `https://dailyjobs-portal.vercel.app\n\n`;
      whatsAppPost += `*👉 Join our Telegram Channel for daily updates:* \n`;
      whatsAppPost += `https://t.me/DailyJobsUpdatesportal\n\n`;
      whatsAppPost += `*👉 Join our WhatsApp Channel for mobile alerts:* \n`;
      whatsAppPost += `https://whatsapp.com/channel/0029VbCRYZN0Qeaep5uwNY3f`;

      // 2. Build Telegram Channel version (using <b> for bold)
      let channelPost = `<b>📝 LATEST TECH JOB OPENINGS | ${today}</b>\n\n`;
      newInsertedJobs.forEach((job) => {
        const jobUrl = `${portalUrlBase}/jobs/${job.slug}`;
        channelPost += `🌟 <b>${escapeHtml(job.company.toUpperCase())} IS HIRING!</b> 🌟\n`;
        channelPost += `━━━━━━━━━━━━━━━━━━━━\n`;
        channelPost += `  ◈ <b>Role:</b> ${escapeHtml(job.title)}\n`;
        channelPost += `  ◈ <b>Location:</b> ${escapeHtml(job.location || "Across India")}\n`;
        channelPost += `  ◈ <b>Degree:</b> ${escapeHtml(job.qualification || "Any Graduate")}\n`;
        channelPost += `  ◈ <b>Experience:</b> ${escapeHtml(job.experience || "Freshers")}\n`;
        channelPost += `  ◈ <b>Batch:</b> ${escapeHtml(job.passout_year || "Any")}\n`;
        if (job.salary) {
          channelPost += `  ◈ <b>Package:</b> ${escapeHtml(job.salary)}\n`;
        }
        channelPost += `━━━━━━━━━━━━━━━━━━━━\n`;
        channelPost += `🚀 <b>Apply Link:</b> ${jobUrl}\n`;
        channelPost += `⏰ <b>Apply ASAP! Link expires in 30 days.</b>\n\n\n`;
      });
      channelPost += `<b>📢 Share this opportunity with your Friends and WhatsApp Group ❤️</b>\n\n`;
      channelPost += `<b>🌐 Search more tech jobs on our website:</b>\n`;
      channelPost += `https://dailyjobs-portal.vercel.app\n\n`;
      channelPost += `<b>👉 Join our WhatsApp Channel for mobile alerts:</b>\n`;
      channelPost += `https://whatsapp.com/channel/0029VbCRYZN0Qeaep5uwNY3f`;

      // 3. Broadcast to Telegram Channel automatically
      if (TELEGRAM_CHANNEL_ID) {
        console.log(`[Auto-Scraper] Broadcasting ${newInsertedJobs.length} new jobs to Telegram channel: ${TELEGRAM_CHANNEL_ID}`);
        await sendTelegramMessage(TELEGRAM_CHANNEL_ID, channelPost);
      }

      // 4. Send WhatsApp tap-to-copy block to Admin Chat
      const adminChatId = ALLOWED_USER_IDS.split(",")[0]?.trim();
      if (adminChatId) {
        console.log(`[Auto-Scraper] Sending WhatsApp copy-template to admin chat: ${adminChatId}`);
        const adminMsg = `🤖 <b>Auto-Scraper published ${newInsertedJobs.length} new job(s)!</b>\n\nHere is your ready-to-use WhatsApp template (tap code box below to copy):`;
        await sendTelegramMessage(adminChatId, adminMsg);
        await sendTelegramMessage(adminChatId, `<pre>${escapeHtml(whatsAppPost.trim())}</pre>`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Auto-scraper completed for all companies and freshers.`,
      scrapedTotal: scrapedJobs.length,
      insertedCount,
      skippedCount,
      broadcasted: newInsertedJobs.length > 0,
      time: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Auto-Scraper] Fatal error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
