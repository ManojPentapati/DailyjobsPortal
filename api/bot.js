import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import * as cheerio from "cheerio";

// Initialize environment variables from Vercel
const {
  TELEGRAM_BOT_TOKEN,
  GEMINI_API_KEY,
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  ALLOWED_USER_IDS = "",
  TELEGRAM_CHANNEL_ID = "",
} = process.env;

const allowedIds = ALLOWED_USER_IDS.split(",").map((id) => id.trim()).filter(Boolean);

// Initialize Clients
const ai = new GoogleGenerativeAI(GEMINI_API_KEY || "");
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(VITE_SUPABASE_URL || "", supabaseKey);

// Helper: Extract all unique URLs from text, ignoring generic social links
function extractUrls(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];

  const ignorePatterns = [
    "t.me", "telegram.me", "wa.me", "whatsapp.com", "instagram.com",
    "facebook.com", "linkedin.com", "twitter.com", "x.com", "youtube.com"
  ];

  const filtered = matches.filter((url) => {
    const lowerUrl = url.toLowerCase();
    // Allow LinkedIn jobs specifically
    if (lowerUrl.includes("linkedin.com/jobs/")) {
      return true;
    }
    return !ignorePatterns.some((pattern) => lowerUrl.includes(pattern));
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
      text: textContent.substring(0, 8000),
      links: links.slice(0, 30),
    };
  } catch (error) {
    console.error(`Failed to crawl url ${url}:`, error.message);
    return { url, text: "", links: [], error: error.message };
  }
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
  const cleanName = companyName.toLowerCase().trim().replace(/\s+/g, "");
  let domain = companyDomains[normalized];
  if (!domain) {
    if (/\.(com|in|co|ai|io|org|net|me|info|tech|us|edu|gov)$/i.test(cleanName)) {
      domain = cleanName;
    } else {
      domain = `${cleanName}.com`;
    }
  }

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
  return `https://www.google.com/s2/favicons?sz=64&domain=${cleanDomain}`;
};

// Helper: Escape HTML special characters
function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Helper: Send message to Telegram
async function sendTelegramMessage(chatId, text, replyToMessageId = null, replyMarkup = null) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const data = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
  };
  if (replyToMessageId) data.reply_to_message_id = replyToMessageId;
  if (replyMarkup) data.reply_markup = replyMarkup;
  await axios.post(url, data);
}

// Helper: Delete message on Telegram
async function deleteTelegramMessage(chatId, messageId) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`;
    await axios.post(url, { chat_id: chatId, message_id: messageId });
  } catch (e) {
    console.warn("Could not delete message:", e.message);
  }
}

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

// Vercel Serverless Function Handler
export default async function handler(req, res) {
  // Verify request is POST (from Telegram Webhook)
  if (req.method !== "POST") {
    return res.status(200).send("Bot is active.");
  }

  const { message } = req.body;
  if (!message) {
    return res.status(200).send("No message received.");
  }

  const chatId = message.chat.id;
  const userId = message.from?.id?.toString() || "";
  const text = message.text || message.caption || "";
  const messageId = message.message_id;

  // Authorization Check
  if (allowedIds.length && !allowedIds.includes(userId)) {
    await sendTelegramMessage(chatId, `❌ Unauthorized. Your Telegram User ID is: <b>${userId}</b>\nTo gain access, add this ID to ALLOWED_USER_IDS in Vercel.`, messageId);
    return res.status(200).send("Unauthorized.");
  }

  // Run database maintenance to remove expired jobs
  await cleanExpiredJobs();

  // Handle start command
  if (text.startsWith("/start")) {
    await sendTelegramMessage(chatId, "👋 Welcome to the <b>Daily Jobs Portal Aggregator Bot</b> (Vercel Webhook Mode)!\n\nForward any job posting message containing links to wrapper sites, and I will crawl the links, extract details using Gemini, post to Supabase, and give you the WhatsApp template instantly!\n\n<b>Commands:</b>\n/start — Show this welcome message\n/stats — Show portal statistics");
    return res.status(200).send("Start command handled.");
  }

  // Handle stats command
  if (text.startsWith("/stats")) {
    try {
      const now = new Date().toISOString();
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString();

      const [activeRes, todayRes, expiringRes, totalRes] = await Promise.all([
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true).gt("expires_at", now),
        supabase.from("jobs").select("*", { count: "exact", head: true }).gte("posted_date", todayStart.toISOString()),
        supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true).gt("expires_at", now).lt("expires_at", threeDaysLater),
        supabase.from("jobs").select("*", { count: "exact", head: true }),
      ]);

      const stats = `📊 <b>Daily Jobs Portal — Stats</b>\n\n` +
        `✅ Active Jobs: <b>${activeRes.count || 0}</b>\n` +
        `🆕 Posted Today: <b>${todayRes.count || 0}</b>\n` +
        `⏳ Expiring in 3 days: <b>${expiringRes.count || 0}</b>\n` +
        `📦 Total All-time: <b>${totalRes.count || 0}</b>\n\n` +
        `🌐 <a href="https://dailyjobs-portal.vercel.app">Visit Portal</a>`;

      await sendTelegramMessage(chatId, stats, messageId);
    } catch (err) {
      await sendTelegramMessage(chatId, `❌ Failed to fetch stats: ${err.message}`, messageId);
    }
    return res.status(200).send("Stats command handled.");
  }

  const urls = extractUrls(text);
  if (urls.length === 0) {
    await sendTelegramMessage(chatId, "⚠️ Please send or forward a message that contains links to the job listings.", messageId);
    return res.status(200).send("No URLs found.");
  }

  // Send an initial processing notice (which we will delete later)
  // Telegram requires us to track this message's ID to delete or update it later
  // Let's create a webhook workflow. Since Vercel executes serverless, we must respond within 15 seconds.
  // We will run the crawl and Gemini in this serverless context.
  try {
    // 1. Crawl all webpages in parallel
    const crawlResults = await Promise.all(urls.map((url) => crawlWebpage(url)));
    
    // We map crawls to make sure we always pass context, even if the website blocked crawling (e.g. 403 or error).
    // This allows Gemini to parse job details from the Telegram message text and use the original URL.
    const validCrawls = crawlResults.map((r) => ({
      url: r.url,
      text: r.text || "(This page blocked crawling or is empty. Use the raw Telegram message text below for details)",
      links: r.links || [],
      error: r.error || null
    }));

    // 2. Query Gemini with fallback support
    const todayDateStr = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = `
You are a job parser AI. Your task is to analyze a raw job post message and the text/links crawled from its linked landing pages.
The message contains multiple job listings. Your goal is to map each job to its crawled page context and extract the details.
For each job, locate the REAL official application link (like a Google Form, Workday, Lever, Greenhouse, or the company's official career portal) on its respective crawled landing page.

Today's Date: ${todayDateStr}

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
    "apply_link": "The REAL official apply link found on its corresponding crawled page (e.g. a docs.google.com/forms link or infosys.com career link). Do NOT use the wrapper link. If the crawled page text is blocked or empty, use the corresponding page URL as the apply link.",
    "expires_in_days": "Number of days from today until the application expires. Calculate this dynamically: if the post/page mentions a specific deadline (e.g. 'Apply by July 25th' and today is July 18th), calculate the exact number of days (7). If it mentions 'Apply ASAP', 'Urgent', or 'Limited seats', set to 3. If there is no deadline mentioned, estimate a realistic expiration: 14 days for startups/smaller companies, 30 days for large MNCs (e.g. Infosys, TCS, Cognizant, Wipro). Do not just output 7 for everything."
  }
]

Note: If the Crawled Pages Context lacks explicit skills or responsibilities, infer a logical list of 3-5 key skills and responsibilities based on the job title and company. Never leave them empty.
IMPORTANT: Always normalize location to standard city names and experience to standard ranges as specified above. Consistency is critical.
`;

    const modelsToTry = [
      "gemini-3.1-flash-lite",
      "gemini-flash-lite-latest",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash-lite",
      "gemini-flash-latest"
    ];
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

    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
    }

    const jobsData = JSON.parse(responseText);

    if (!Array.isArray(jobsData)) {
      throw new Error("Gemini did not return an array of job listings.");
    }

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

    // Fetch existing active jobs to perform strict duplicate checking
    const { data: existingActiveJobs } = await supabase
      .from("jobs")
      .select("id, title, company, apply_link")
      .eq("is_active", true);

    const existingKeys = new Set(
      (existingActiveJobs || []).map((j) =>
        `${(j.company || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "")}-${(j.title || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "")}`
      )
    );

    const existingLinks = new Set(
      (existingActiveJobs || []).map((j) =>
        (j.apply_link || "").toLowerCase().split("?")[0].replace(/\/$/, "")
      ).filter(Boolean)
    );

    // Loop through each job and save to Supabase
    for (const jobData of jobsData) {
      const cleanCompanyKey = (jobData.company || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      const cleanTitleKey = (jobData.title || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      const jobKey = `${cleanCompanyKey}-${cleanTitleKey}`;
      const cleanJobLink = (jobData.apply_link || "").toLowerCase().split("?")[0].replace(/\/$/, "");

      if (existingKeys.has(jobKey) || (cleanJobLink && existingLinks.has(cleanJobLink))) {
        console.log(`Skipping duplicate job: ${jobData.title} at ${jobData.company}`);
        skippedCount++;
        continue;
      }

      const logoUrl = await fetchLogoUrl(jobData.company);
      const jobSlug = generateSlug(jobData.company, jobData.title);

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
      await sendTelegramMessage(chatId, `⚠️ This job listing already exists on the website. Skipped.`, messageId);
      await deleteTelegramMessage(chatId, messageId);
      return res.status(200).send("Duplicate skipped.");
    }

    // 3. Format final publication template
    const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();

    // Resolve frontend URL base
    const portalUrlBase = req.headers.origin || `https://${req.headers.host}`;

    // 1. Build WhatsApp version (using * for bold, no HTML tags)
    let whatsAppPost = `*📝 LATEST JOB OPENINGS | ${today}*\n\n`;
    insertedJobs.forEach((job) => {
      const jobUrl = `${portalUrlBase}/jobs/${job.slug}`;
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
      const jobUrl = `${portalUrlBase}/jobs/${job.slug}`;
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
      channelPost += `⏰ <b>Apply ASAP! Link expires in ${job.expires_in_days || 7} days.</b>\n\n\n`;
    });
    channelPost += `<b>📢 Share this opportunity with your Friends and WhatsApp Group ❤️</b>\n\n`;
    channelPost += `<b>🌐 Search more tech jobs on our website:</b>\n`;
    channelPost += `https://dailyjobs-portal.vercel.app\n\n`;
    channelPost += `<b>👉 Join our WhatsApp Channel for mobile alerts:</b>\n`;
    channelPost += `https://whatsapp.com/channel/0029VbCRYZN0Qeaep5uwNY3f`;

    // 4. Send final template response and delete original message to keep chat clean
    let successMessage = `✅ <b>Successfully posted ${insertedJobs.length} job(s) to website!</b>`;
    if (skippedCount > 0) {
      successMessage += `\n⚠️ <b>Skipped ${skippedCount} duplicate job(s)</b> (already listed).`;
    }
    successMessage += `\n\nHere is your ready-to-use publication post (tap to copy):`;
    await sendTelegramMessage(chatId, successMessage);

    // Send whatsAppPost in chunks if it exceeds 3500 characters
    const maxPostLength = 3500;
    if (whatsAppPost.length <= maxPostLength) {
      await sendTelegramMessage(chatId, `<pre>${escapeHtml(whatsAppPost.trim())}</pre>`);
    } else {
      const jobs = whatsAppPost.split("\n\n\n");
      let currentChunk = "";
      for (const job of jobs) {
        if (!job.trim()) continue;
        if ((currentChunk + job).length > maxPostLength) {
          await sendTelegramMessage(chatId, `<pre>${escapeHtml(currentChunk.trim())}</pre>`);
          currentChunk = job + "\n\n\n";
        } else {
          currentChunk += job + "\n\n\n";
        }
      }
      if (currentChunk.trim()) {
        await sendTelegramMessage(chatId, `<pre>${escapeHtml(currentChunk.trim())}</pre>`);
      }
    }

    // Auto-broadcast to Telegram channel if configured
    if (TELEGRAM_CHANNEL_ID) {
      try {
        if (channelPost.length <= 4000) {
          await sendTelegramMessage(TELEGRAM_CHANNEL_ID, channelPost);
        } else {
          const jobs = channelPost.split("\n\n\n");
          let currentChunk = `<b>📝 LATEST JOB OPENINGS | ${today}</b>\n\n`;
          for (const job of jobs) {
            if (!job.trim() || job.includes("LATEST JOB OPENINGS")) continue;
            if ((currentChunk + job).length > 4000) {
              await sendTelegramMessage(TELEGRAM_CHANNEL_ID, currentChunk);
              currentChunk = job + "\n\n\n";
            } else {
              currentChunk += job + "\n\n\n";
            }
          }
          if (currentChunk.trim()) {
            await sendTelegramMessage(TELEGRAM_CHANNEL_ID, currentChunk);
          }
        }
      } catch (err) {
        console.error("Auto-broadcast failed:", err.message);
        await sendTelegramMessage(chatId, `⚠️ <b>Warning:</b> Failed to auto-broadcast to your channel (${TELEGRAM_CHANNEL_ID}).\n\n<b>Solution:</b> Make sure the bot is added as an <b>Administrator</b> in your channel, and has permission to post messages!`);
      }
    }

    await deleteTelegramMessage(chatId, messageId);

  } catch (error) {
    console.error("Webhook processing error:", error);
    const errorDetails = error.response?.data?.description || error.message;
    await sendTelegramMessage(chatId, `❌ <b>Failed to complete automation.</b>\n\n<b>Error:</b> ${escapeHtml(errorDetails)}`, messageId);
  }

  return res.status(200).send("Done.");
}
