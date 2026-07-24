import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(VITE_SUPABASE_URL || "", supabaseKey);

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
  if (!html) return "Exciting technical opportunity at a leading tech company.";
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
    console.log("[Auto-Scraper] Starting automated tech job aggregation...");

    const scrapedJobs = [];

    // Source 1: Arbeitnow Tech Jobs API
    try {
      const { data: arbeitRes } = await axios.get("https://www.arbeitnow.com/api/v1/jobs", { timeout: 8000 });
      if (arbeitRes && arbeitRes.data && Array.isArray(arbeitRes.data)) {
        arbeitRes.data.slice(0, 15).forEach((item) => {
          if (item.title && item.url) {
            scrapedJobs.push({
              title: item.title,
              company: item.company_name || "Tech Corporation",
              location: item.location || "Remote / Across India",
              experience: "Freshers / Experienced",
              salary: "Industry Standard",
              category: categorizeJob(item.title, item.tags || []),
              description: cleanDescription(item.description),
              skills: (item.tags || ["Software Development", "Coding", "Problem Solving"]).slice(0, 5),
              responsibilities: ["Develop scalable software solutions", "Collaborate with cross-functional technical teams", "Maintain code quality and documentation"],
              qualification: "B.E / B.Tech / MCA / B.Sc",
              passout_year: "Any",
              job_type: item.remote ? "Full-time" : "Full-time",
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
      const { data: remotiveRes } = await axios.get("https://remotive.com/api/remote-jobs?category=software-dev&limit=15", { timeout: 8000 });
      if (remotiveRes && remotiveRes.jobs && Array.isArray(remotiveRes.jobs)) {
        remotiveRes.jobs.slice(0, 15).forEach((item) => {
          if (item.title && item.url) {
            scrapedJobs.push({
              title: item.title,
              company: item.company_name || "Global Tech",
              location: item.candidate_required_location || "Remote",
              experience: "0-2 Years / Experienced",
              salary: item.salary || "Best in Industry",
              category: categorizeJob(item.title, item.tags || []),
              description: cleanDescription(item.description),
              skills: (item.tags || ["Full Stack", "JavaScript", "Python", "Cloud"]).slice(0, 5),
              responsibilities: ["Build enterprise grade web applications", "Optimize backend services and system performance", "Participate in agile sprint planning and code reviews"],
              qualification: "Degree in Computer Science or Related Field",
              passout_year: "Any",
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

    console.log(`[Auto-Scraper] Fetched ${scrapedJobs.length} potential tech job listings.`);

    let insertedCount = 0;
    let skippedCount = 0;

    for (const job of scrapedJobs) {
      const logoUrl = fetchLogoUrl(job.company, job.company_logo);
      const jobSlug = generateSlug(job.company, job.title);

      // Check for duplicate in database
      const { data: existingLink } = await supabase
        .from("jobs")
        .select("id")
        .eq("apply_link", job.apply_link)
        .maybeSingle();

      const { data: existingSlug } = await supabase
        .from("jobs")
        .select("id")
        .eq("slug", jobSlug)
        .maybeSingle();

      if (existingLink || existingSlug) {
        skippedCount++;
        continue;
      }

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
      } else {
        console.error(`[Auto-Scraper] Failed to insert ${job.title}:`, dbError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Auto-scraper execution completed.`,
      scrapedTotal: scrapedJobs.length,
      insertedCount,
      skippedCount,
      time: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Auto-Scraper] Fatal error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
