import TelegramBot from "node-telegram-bot-api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import * as cheerio from "cheerio";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config(); // fallback to current dir

const {
  TELEGRAM_BOT_TOKEN,
  GEMINI_API_KEY,
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  PORTAL_BASE_URL = "http://localhost:5173",
  ALLOWED_USER_IDS = "",
  TELEGRAM_CHANNEL_ID = "",
} = process.env;

// Validate config
if (!TELEGRAM_BOT_TOKEN || !GEMINI_API_KEY || !VITE_SUPABASE_URL) {
  console.error("Missing required environment variables in .env file.");
  process.exit(1);
}

const allowedIds = ALLOWED_USER_IDS.split(",").map((id) => id.trim()).filter(Boolean);


// Initialize Clients
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
// Use Service Role key if available to bypass RLS, fallback to Anon Key
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || VITE_SUPABASE_ANON_KEY;
const supabase = createClient(VITE_SUPABASE_URL, supabaseKey);

// Clear webhook to ensure polling works
bot.deleteWebHook()
  .then(() => console.log("🧹 Cleared old webhooks successfully."))
  .catch((err) => console.error("Warning: Failed to clear webhook:", err.message));

// Add error listeners
bot.on("polling_error", (err) => console.error("Polling Error:", err.message));
bot.on("error", (err) => console.error("Bot Error:", err.message));

console.log("🚀 Job Aggregator Bot is running...");
console.log(`Allowed Users: ${allowedIds.length ? allowedIds.join(", ") : "All Users (Caution!)"}`);

// Health check server for Render / Railway port binding
const PORT = process.env.PORT || 8080;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Daily Jobs Bot is active.\n");
}).listen(PORT, () => {
  console.log(`📡 Port ${PORT} bound successfully for hosting health checks.`);
});

// Helper: Extract all unique URLs from text, ignoring generic social links
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];

  // Filter out common Telegram, WhatsApp, and social share domains
  const ignorePatterns = [
    "t.me", "telegram.me", "wa.me", "whatsapp.com", "instagram.com",
    "facebook.com", "linkedin.com", "twitter.com", "x.com", "youtube.com"
  ];

  const filtered = matches.filter((url) => {
    return !ignorePatterns.some((pattern) => url.toLowerCase().includes(pattern));
  });

  return [...new Set(filtered)];
}

// Helper: Crawl webpage and extract text content
async function crawlWebpage(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 10000,
    });
    const $ = cheerio.load(data);

    // Remove script and style elements
    $("script, style, iframe, noscript, header, footer, nav").remove();

    // Extract text content and links
    const textContent = $("body").text().replace(/\s+/g, " ").trim();
    const links = [];
    $("a[href]").each((i, el) => {
      const href = $(el).attr("href");
      const linkText = $(el).text().trim();
      if (href && href.startsWith("http")) {
        links.push({ text: linkText, url: href });
      }
    });

    return {
      url,
      text: textContent.substring(0, 8000), // Cap size to protect context window
      links: links.slice(0, 30),
    };
  } catch (error) {
    console.error(`Failed to crawl url ${url}:`, error.message);
    return { url, text: "", links: [], error: error.message };
  }
}

// Helper: Escape HTML special characters
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Helper: Resolve logo URL
const fetchLogoUrl = async (companyName) => {
  const companyDomains = {
    google: "google.com", microsoft: "microsoft.com", amazon: "amazon.com",
    apple: "apple.com", facebook: "facebook.com", meta: "meta.com",
    netflix: "netflix.com", tcs: "tcs.com", infosys: "infosys.com",
    wipro: "wipro.com", cognizant: "cognizant.com", accenture: "accenture.com",
    flipkart: "flipkart.com", zomato: "zomato.com", swiggy: "swiggy.com",
    ola: "olaweb.com", uber: "uber.com", paytm: "paytm.com",
    reliance: "reliance.com", jio: "jio.com", hcl: "hcltech.com",
    techmahindra: "techmahindra.com", nttdata: "nttdata.com",
  };

  const normalized = companyName.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  let domain = companyDomains[normalized] || `${companyName.toLowerCase().trim().replace(/\s+/g, "")}.com`;

  try {
    const res = await axios.get(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyName)}`, { timeout: 3000 });
    if (res.data && res.data.length > 0 && res.data[0].logo) {
      const logo = res.data[0].logo;
      if (logo.includes("logo.clearbit.com/")) {
        domain = logo.split("logo.clearbit.com/")[1] || domain;
      } else if (res.data[0].domain) {
        domain = res.data[0].domain;
      }
    }
  } catch (err) {
    console.error("Autocomplete logo fetch failed:", err.message);
  }

  const cleanDomain = domain.replace(/^(https?:)?\/\//, "").trim();
  return `https://www.google.com/s2/favicons?sz=64&domain=${cleanDomain}&fallback=sitemap`;
};

// Helper: Clean up expired jobs automatically
async function cleanExpiredJobs() {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("jobs")
      .delete()
      .lt("expires_at", now);
    if (error) console.error("Error deleting expired jobs:", error.message);
  } catch (err) {
    console.error("Failed to cleanup expired jobs:", err.message);
  }
}

// Bot main handler
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id.toString();
  const text = msg.text || msg.caption || "";

  // Authorization Check
  if (allowedIds.length && !allowedIds.includes(userId)) {
    return bot.sendMessage(chatId, `❌ Unauthorized. Your Telegram User ID is: <b>${userId}</b>\nTo gain access, add this ID to ALLOWED_USER_IDS in your .env file.`, { parse_mode: "HTML" });
  }

  // Run database maintenance to remove expired jobs
  await cleanExpiredJobs();

  // Handle start command
  if (text.startsWith("/start")) {
    return bot.sendMessage(
      chatId,
      "👋 Welcome to the <b>Daily Jobs Portal Aggregator Bot</b>!\n\nForward any job posting message (containing one or multiple links to job wrapper sites) here, and I will:\n1. Scrape all wrapper sites\n2. Extract all real apply links\n3. Use AI to structure all job details in parallel\n4. Post them to Supabase\n5. Give you the final formatted message containing all jobs ready to copy to WhatsApp!",
      { parse_mode: "HTML" }
    );
  }

  const urls = extractUrls(text);

  if (urls.length === 0) {
    return bot.sendMessage(chatId, "⚠️ Please send or forward a message that contains links to the job listings.");
  }

  const statusMsg = await bot.sendMessage(
    chatId,
    `⏳ <b>Step 1/4:</b> Crawling ${urls.length} webpage(s) in parallel to find official apply links...`,
    { parse_mode: "HTML" }
  );

  // 1. Crawl all webpages in parallel
  const crawlResults = await Promise.all(urls.map((url) => crawlWebpage(url)));
  const validCrawls = crawlResults.filter((r) => r.text || r.links.length > 0);

  if (validCrawls.length === 0) {
    return bot.editMessageText(`❌ Failed to crawl any of the links provided: ${escapeHtml(urls.join(", "))}`, {
      chat_id: chatId,
      message_id: statusMsg.message_id,
    });
  }

  await bot.editMessageText(`🤖 <b>Step 2/4:</b> Asking Gemini to structure details and extract real apply links for ${validCrawls.length} job(s)...`, {
    chat_id: chatId,
    message_id: statusMsg.message_id,
    parse_mode: "HTML",
  });

  // 2. Query Gemini with fallback support
  try {
    const prompt = `
You are a job parser AI. Your task is to analyze a raw job post message and the text/links crawled from its linked landing pages.
The message contains multiple job listings. Your goal is to map each job to its crawled page context and extract the details.
For each job, locate the REAL official application link (like a Google Form, Workday, Lever, Greenhouse, or the company's official career portal) on its respective crawled landing page.

Raw Message:
"""
${text}
"""

Crawled Pages Context:
${JSON.stringify(validCrawls, null, 2)}

Respond with a raw JSON array of job objects matching the exact schema below. Do not wrap in markdown code blocks or any other tags.
[
  {
    "title": "Job Title (e.g. System Engineer / Specialist Programmer)",
    "company": "Company Name (e.g. Infosys)",
    "location": "Job Location — use standard city names: Bangalore, Hyderabad, Chennai, Mumbai, Pune, Delhi, Noida, Gurgaon, Kolkata, Remote, Across India. Always use 'Bangalore' (not BENGALURU/Bengaluru). If multiple cities, list the primary one only.",
    "experience": "Experience Requirement — use ONLY these standard values: Freshers, 0-1 Years, 0-2 Years, 1-3 Years, 2-5 Years, 3-5 Years, 5-8 Years, 8+ Years. Map '0 years' or '0-0 years' to 'Freshers'.",
    "salary": "Salary (e.g. Rs. 6.25 - 21 LPA or Upto 8 LPA)",
    "category": "One of these exact categories: Software Development, Data Science, AI / ML, Testing / QA, Cloud Computing, Cyber Security, UI/UX Design, DevOps & Cloud, Product Management, Design",
    "description": "Full job description (1-2 paragraphs summarizing the role details, responsibilities, and requirements)",
    "skills": ["Skill1", "Skill2", "Skill3"],
    "responsibilities": ["Responsibility1", "Responsibility2", "Responsibility3"],
    "qualification": "Highly concise qualification label (e.g. B.E/B.Tech, MCA, B.Sc, BCA, Any Degree, BBA, MBA, M.Tech). Do NOT write a sentence. Keep it to a clean, simple short label.",
    "passout_year": "Comma separated years (e.g. 2024, 2025, 2026). If open to any, say Any",
    "job_type": "One of: Full-time, Part-time, Contract, Internship, Freelance",
    "apply_link": "The REAL official apply link found on its corresponding crawled page (e.g. a docs.google.com/forms link or infosys.com career link). Do NOT use the wrapper link. If not found, output the best alternative from the crawled page.",
    "expires_in_days": "Number of days until the job application link expires, estimated based on any text mentioning deadline, urgency, or expiration (e.g. 3, 5, 7). If no explicit mention of deadline/urgency/expiration, default to 7."
  }
]

Note: If the Crawled Pages Context lacks explicit skills or responsibilities, infer a logical list of 3-5 key skills and responsibilities based on the job title and company. Never leave them empty.
IMPORTANT: Always normalize location to standard city names and experience to standard ranges as specified above. Consistency is critical.
`;

    const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-flash-latest"];
    let result = null;
    let geminiError = null;
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    for (const modelName of modelsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const model = ai.getGenerativeModel({ model: modelName });
          result = await model.generateContent(prompt);
          break; // Success
        } catch (err) {
          console.error(`Gemini model ${modelName} (attempt ${attempt + 1}) failed:`, err.message);
          geminiError = err;
          // Retry same model once after 5s if it's a 503 (temporary overload)
          if (attempt === 0 && err.message?.includes("503")) {
            console.log(`Retrying ${modelName} in 5 seconds...`);
            await delay(5000);
            continue;
          }
          break; // Non-503 error, move to next model
        }
      }
      if (result) break;
    }

    if (!result) {
      throw new Error(`Gemini query failed for all attempted models. Last error: ${geminiError?.message}`);
    }

    let responseText = result.response.text().trim();

    // Clean markdown code blocks if AI wraps it
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
    }

    const jobsData = JSON.parse(responseText);

    if (!Array.isArray(jobsData)) {
      throw new Error("Gemini did not return an array of job listings.");
    }

    await bot.editMessageText(`💾 <b>Step 3/4:</b> Resolving company logos and saving ${jobsData.length} job(s) to Supabase...`, {
      chat_id: chatId,
      message_id: statusMsg.message_id,
      parse_mode: "HTML",
    });

    const insertedJobs = [];
    let skippedCount = 0;

    // Local Helper: Generate a URL slug
    const generateSlug = (company, title) => {
      const normalizedCompany = company.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      const normalizedTitle = title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      const baseSlug = `${normalizedCompany}-${normalizedTitle}`.replace(/-+/g, "-");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      return `${baseSlug}-${randomSuffix}`.substring(0, 100);
    };

    // Loop through each job and save to Supabase
    for (const jobData of jobsData) {
      const logoUrl = await fetchLogoUrl(jobData.company);
      const jobSlug = generateSlug(jobData.company, jobData.title);

      // Check for duplicate: same apply_link OR same slug (active jobs only)
      const { data: existingByLink } = await supabase
        .from("jobs")
        .select("id")
        .eq("apply_link", jobData.apply_link)
        .eq("is_active", true)
        .maybeSingle();

      const { data: existingBySlug } = await supabase
        .from("jobs")
        .select("id")
        .eq("slug", jobSlug)
        .eq("is_active", true)
        .maybeSingle();

      if (existingByLink || existingBySlug) {
        console.log(`Skipping duplicate job: ${jobData.title} at ${jobData.company}`);
        skippedCount++;
        continue;
      }

      const days = parseInt(jobData.expires_in_days) || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      const { data: inserted, error: dbError } = await supabase
        .from("jobs")
        .insert({
          title: jobData.title,
          company: jobData.company,
          company_logo: logoUrl,
          location: jobData.location,
          experience: jobData.experience,
          salary: jobData.salary,
          category: jobData.category,
          description: jobData.description,
          skills: jobData.skills || [],
          responsibilities: jobData.responsibilities || [],
          qualification: jobData.qualification,
          passout_year: jobData.passout_year,
          job_type: jobData.job_type,
          apply_link: jobData.apply_link,
          slug: jobSlug,
          is_active: true,
          is_featured: false,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (!dbError && inserted) {
        insertedJobs.push({ ...jobData, slug: inserted.slug || jobSlug, expires_in_days: days });
      } else {
        console.error(`Failed to insert job for ${jobData.company}:`, dbError);
      }
    }

    // If all jobs were duplicates and nothing new was inserted
    if (insertedJobs.length === 0 && skippedCount > 0) {
      await bot.deleteMessage(chatId, statusMsg.message_id);
      await bot.sendMessage(chatId, `⚠️ This job listing already exists on the website. Skipped.`, { parse_mode: "HTML" });
      
      try {
        await bot.deleteMessage(chatId, msg.message_id);
      } catch (err) { /* ignore */ }
      return;
    }

    await bot.editMessageText("📢 <b>Step 4/4:</b> Formatting final publication template...", {
      chat_id: chatId,
      message_id: statusMsg.message_id,
      parse_mode: "HTML",
    });

    // 4. Send final template response
    const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
    
    // 1. Build WhatsApp version (using * for bold, no HTML tags)
    let whatsAppPost = `*📝 LATEST JOB OPENINGS | ${today}*\n\n`;
    insertedJobs.forEach((job) => {
      const jobUrl = `${PORTAL_BASE_URL}/jobs/${job.slug}`;
      whatsAppPost += `🌟 *${job.company.toUpperCase()} IS HIRING!* 🌟\n`;
      whatsAppPost += `━━━━━━━━━━━━━━━━━━━━\n`;
      whatsAppPost += `  ◈ *Role:* ${job.title}\n`;
      whatsAppPost += `  ◈ *Location:* ${job.location || "Across India"}\n`;
      whatsAppPost += `  ◈ *Degree:* ${job.qualification || "Any Graduate"}\n`;
      whatsAppPost += `  ◈ *Experience:* ${job.experience || "Freshers / Experienced"}\n`;
      whatsAppPost += `  ◈ *Batch:* ${job.passout_year || "Any"}\n`;
      if (job.salary) {
        whatsAppPost += `  ◈ *Package:* ${job.salary}\n`;
      }
      whatsAppPost += `━━━━━━━━━━━━━━━━━━━━\n`;
      whatsAppPost += `🚀 *Apply Link:* ${jobUrl}\n`;
      whatsAppPost += `⏰ *Apply ASAP! Link expires in ${job.expires_in_days || 7} days.*\n\n\n`;
    });
    whatsAppPost += `*📢 Share this opportunity with your Friends and WhatsApp Group ❤️*\n\n`;
    whatsAppPost += `*🌐 Search more tech jobs on our website:* \n`;
    whatsAppPost += `https://dailyjobs-portal.vercel.app\n\n`;
    whatsAppPost += `*👉 Join our Telegram Channel for daily updates:* \n`;
    whatsAppPost += `https://t.me/DailyJobsUpdatesportal\n\n`;
    whatsAppPost += `*👉 Join our WhatsApp Channel for mobile alerts:* \n`;
    whatsAppPost += `https://whatsapp.com/channel/0029VbCRYZN0Qeaep5uwNY3f`;

    // 2. Build Telegram Channel version (using <b> for bold)
    let channelPost = `<b>📝 LATEST JOB OPENINGS | ${today}</b>\n\n`;
    insertedJobs.forEach((job) => {
      const jobUrl = `${PORTAL_BASE_URL}/jobs/${job.slug}`;
      channelPost += `🌟 <b>${escapeHtml(job.company.toUpperCase())} IS HIRING!</b> 🌟\n`;
      channelPost += `━━━━━━━━━━━━━━━━━━━━\n`;
      channelPost += `  ◈ <b>Role:</b> ${escapeHtml(job.title)}\n`;
      channelPost += `  ◈ <b>Location:</b> ${escapeHtml(job.location || "Across India")}\n`;
      channelPost += `  ◈ <b>Degree:</b> ${escapeHtml(job.qualification || "Any Graduate")}\n`;
      channelPost += `  ◈ <b>Experience:</b> ${escapeHtml(job.experience || "Freshers / Experienced")}\n`;
      channelPost += `  ◈ <b>Batch:</b> ${escapeHtml(job.passout_year || "Any")}\n`;
      if (job.salary) {
        channelPost += `  ◈ <b>Package:</b> ${escapeHtml(job.salary)}\n`;
      }
      channelPost += `━━━━━━━━━━━━━━━━━━━━\n`;
      channelPost += `🚀 <b>Apply Link:</b> ${jobUrl}\n`;
      channelPost += `⏰ <b>Apply ASAP! Link expires in 7 days.</b>\n\n\n`;
    });
    channelPost += `<b>📢 Share this opportunity with your Friends and WhatsApp Group ❤️</b>\n\n`;
    channelPost += `<b>🌐 Search more tech jobs on our website:</b>\n`;
    channelPost += `https://dailyjobs-portal.vercel.app\n\n`;
    channelPost += `<b>👉 Join our WhatsApp Channel for mobile alerts:</b>\n`;
    channelPost += `https://whatsapp.com/channel/0029VbCRYZN0Qeaep5uwNY3f`;

    // Send formatted post in code block for easy one-tap copying on mobile
    await bot.deleteMessage(chatId, statusMsg.message_id);
    let successMessage = `✅ <b>Successfully posted ${insertedJobs.length} job(s) to website!</b>`;
    if (skippedCount > 0) {
      successMessage += `\n⚠️ <b>Skipped ${skippedCount} duplicate job(s)</b> (already listed).`;
    }
    successMessage += `\n\nHere is your ready-to-use publication post (tap to copy):`;
    await bot.sendMessage(chatId, successMessage, { parse_mode: "HTML" });

    // Send whatsAppPost in chunks if it exceeds 3500 characters
    const maxPostLength = 3500;
    if (whatsAppPost.length <= maxPostLength) {
      await bot.sendMessage(chatId, `<pre>${escapeHtml(whatsAppPost.trim())}</pre>`, { parse_mode: "HTML" });
    } else {
      const jobs = whatsAppPost.split("\n\n\n");
      let currentChunk = "";
      for (const job of jobs) {
        if (!job.trim()) continue;
        if ((currentChunk + job).length > maxPostLength) {
          await bot.sendMessage(chatId, `<pre>${escapeHtml(currentChunk.trim())}</pre>`, { parse_mode: "HTML" });
          currentChunk = job + "\n\n\n";
        } else {
          currentChunk += job + "\n\n\n";
        }
      }
      if (currentChunk.trim()) {
        await bot.sendMessage(chatId, `<pre>${escapeHtml(currentChunk.trim())}</pre>`, { parse_mode: "HTML" });
      }
    }

    // Auto-broadcast to Telegram channel if configured
    if (TELEGRAM_CHANNEL_ID) {
      try {
        if (channelPost.length <= 4000) {
          await bot.sendMessage(TELEGRAM_CHANNEL_ID, channelPost, { parse_mode: "HTML" });
        } else {
          const jobs = channelPost.split("\n\n\n");
          let currentChunk = `<b>📝 LATEST JOB OPENINGS | ${today}</b>\n\n`;
          for (const job of jobs) {
            if (!job.trim() || job.includes("LATEST JOB OPENINGS")) continue;
            if ((currentChunk + job).length > 4000) {
              await bot.sendMessage(TELEGRAM_CHANNEL_ID, currentChunk, { parse_mode: "HTML" });
              currentChunk = job + "\n\n\n";
            } else {
              currentChunk += job + "\n\n\n";
            }
          }
          if (currentChunk.trim()) {
            await bot.sendMessage(TELEGRAM_CHANNEL_ID, currentChunk, { parse_mode: "HTML" });
          }
        }
      } catch (err) {
        console.error("Auto-broadcast failed:", err.message);
        await bot.sendMessage(chatId, `⚠️ <b>Warning:</b> Failed to auto-broadcast to your channel (${TELEGRAM_CHANNEL_ID}).\n\n<b>Solution:</b> Make sure the bot is added as an <b>Administrator</b> in your channel, and has permission to post messages!`, { parse_mode: "HTML" });
      }
    }

    // Delete the user's original forwarded message to keep the chat clean
    try {
      await bot.deleteMessage(chatId, msg.message_id);
    } catch (err) {
      console.warn("Could not delete user message:", err.message);
    }

  } catch (error) {
    console.error("Automation error:", error);
    const errorDetails = error.response?.data?.description || error.message;
    bot.editMessageText(`❌ <b>Failed to complete automation.</b>\n\n<b>Error:</b> ${escapeHtml(errorDetails)}`, {
      chat_id: chatId,
      message_id: statusMsg.message_id,
      parse_mode: "HTML",
    });
  }
});
