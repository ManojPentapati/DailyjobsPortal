import { createClient } from "@supabase/supabase-js";

const {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(VITE_SUPABASE_URL || "", supabaseKey);

export default async function handler(req, res) {
  try {
    // 1. Fetch active jobs from Supabase
    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("slug, posted_date")
      .eq("is_active", true)
      .order("posted_date", { ascending: false });

    if (error) {
      throw error;
    }

    const host = req.headers.host || "dailyjobs-portal.vercel.app";
    const baseUrl = `https://${host}`;

    // 2. Build XML Sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Add static home page
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>1.0</priority>\n`;
    xml += `  </url>\n`;

    // Add static jobs browse page
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/jobs</loc>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>0.9</priority>\n`;
    xml += `  </url>\n`;

    // Add blog listing page
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/blog</loc>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;

    // Add static career blog articles
    const blogSlugs = [
      "off-campus-placement-guide-2026",
      "ats-friendly-resume-building-tips",
      "top-tech-skills-in-demand-2026",
      "freshers-technical-interview-prep"
    ];
    blogSlugs.forEach((slug) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/blog/${slug}</loc>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    // Add static pages
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/about</loc>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.5</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/disclaimer</loc>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.3</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/privacy</loc>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.3</priority>\n`;
    xml += `  </url>\n`;

    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/terms</loc>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.3</priority>\n`;
    xml += `  </url>\n`;

    // Add dynamic job slug pages
    if (jobs && jobs.length > 0) {
      jobs.forEach((job) => {
        if (job.slug) {
          const lastMod = job.posted_date ? new Date(job.posted_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/jobs/${job.slug}</loc>\n`;
          xml += `    <lastmod>${lastMod}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          xml += `  </url>\n`;
        }
      });
    }

    xml += `</urlset>`;

    // 3. Respond with XML headers and content
    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600"); // Cache for 1 hour
    return res.status(200).send(xml);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return res.status(500).send("Error generating sitemap");
  }
}
