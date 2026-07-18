import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const {
  SEARCH_BOT_TOKEN,
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
async function sendTelegramMessage(chatId, text, replyToMessageId = null) {
  const url = `https://api.telegram.org/bot${SEARCH_BOT_TOKEN}/sendMessage`;
  const data = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    disable_web_page_preview: true
  };
  if (replyToMessageId) data.reply_to_message_id = replyToMessageId;
  await axios.post(url, data);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Search Bot is active.");
  }

  if (!SEARCH_BOT_TOKEN) {
    console.error("Missing SEARCH_BOT_TOKEN environment variable.");
    return res.status(200).send("Misconfigured.");
  }

  const { message } = req.body;
  if (!message) {
    return res.status(200).send("No message received.");
  }

  const chatId = message.chat.id;
  const text = (message.text || "").trim();
  const messageId = message.message_id;

  if (!text) {
    return res.status(200).send("Empty message.");
  }

  // 1. Handle /start command
  if (text.startsWith("/start")) {
    const welcomeText = `🔍 <b>Welcome to the Daily Jobs Search Bot!</b>\n\n` +
      `Send me any keywords (e.g. <i>React</i>, <i>Infosys</i>, <i>Bangalore</i>, <i>Freshers</i>) and I will find active job openings on our portal for you instantly!\n\n` +
      `<b>Example search queries:</b>\n` +
      `• <code>React Bengaluru</code>\n` +
      `• <code>Infosys Freshers</code>\n` +
      `• <code>Data Analyst</code>\n\n` +
      `🌐 <b>Visit our portal:</b> https://dailyjobs-portal.vercel.app`;
    await sendTelegramMessage(chatId, welcomeText);
    return res.status(200).send("Start command handled.");
  }

  // 2. Perform search
  try {
    // Split text into keywords
    const keywords = text.toLowerCase().split(/\s+/).filter(Boolean);
    if (keywords.length === 0) {
      await sendTelegramMessage(chatId, "⚠️ Please enter a search query.", messageId);
      return res.status(200).send("Empty query.");
    }

    // Build Supabase search query
    let query = supabase
      .from("jobs")
      .select("title, company, location, salary, experience, qualification, passout_year, slug, job_type")
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("posted_date", { ascending: false });

    // Match all keywords using OR on different fields
    const conditions = [];
    keywords.forEach((word) => {
      conditions.push(
        `title.ilike.%${word}%,company.ilike.%${word}%,category.ilike.%${word}%,location.ilike.%${word}%,skills.cs.{${word}}`
      );
    });
    
    // Join conditions by AND (meaning every word must match in some field)
    const orQueryString = conditions.join(",");
    query = query.or(orQueryString);
    query = query.limit(5); // Cap to 5 results for clean message

    const { data: jobs, error } = await query;

    if (error) {
      console.error("Search query error:", error.message);
      await sendTelegramMessage(chatId, `❌ Failed to execute search: ${error.message}`, messageId);
      return res.status(200).send("Query error.");
    }

    if (!jobs || jobs.length === 0) {
      await sendTelegramMessage(
        chatId,
        `🔍 No active jobs found matching "<b>${escapeHtml(text)}</b>".\n\nTry searching for broader terms like <i>React</i>, <i>Python</i>, <i>Software</i>, <i>Remote</i>, or <i>Bangalore</i>!`,
        messageId
      );
      return res.status(200).send("No results.");
    }

    // Format results
    let responseText = `🔍 <b>Search results for "${escapeHtml(text)}" (${jobs.length} found):</b>\n\n`;
    jobs.forEach((job, index) => {
      const jobUrl = `https://dailyjobs-portal.vercel.app/jobs/${job.slug}`;
      responseText += `<b>${index + 1}. ${escapeHtml(job.title)}</b> at <b>${escapeHtml(job.company)}</b>\n`;
      responseText += `📍 Location: ${escapeHtml(job.location)}\n`;
      responseText += `💼 Exp: ${escapeHtml(job.experience)}\n`;
      if (job.salary) responseText += `💵 Salary: ${escapeHtml(job.salary)}\n`;
      responseText += `🔗 <a href="${jobUrl}">View & Apply Here</a>\n\n`;
    });
    responseText += `🌐 <i>Browse more on <a href="https://dailyjobs-portal.vercel.app">Daily Jobs Portal</a></i>`;

    await sendTelegramMessage(chatId, responseText, messageId);

  } catch (err) {
    console.error("Search bot handler error:", err);
    await sendTelegramMessage(chatId, `❌ An unexpected error occurred: ${err.message}`, messageId);
  }

  return res.status(200).send("Done.");
}
