import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useJobs } from "../../context/JobContext";
import { categories } from "../../data/jobs";
import { generateSlug } from "../../components/utils/slugUtils";
import { parseWalkinData, cleanDescription, serializeWalkinData } from "../../components/utils/walkinUtils";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance", "Walk-in"];
const QUALIFICATIONS = ["B.Tech", "M.Tech", "BCA", "MCA", "B.Sc", "M.Sc", "B.Com", "BBA", "MBA", "Any Degree"];
const PASSOUT_YEARS = ["2022", "2023", "2024", "2025", "2026", "2027", "2028"];

function FormField({ label, id, error, required, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

const emptyJob = {
  title: "", company: "", company_logo: "", location: "",
  experience: "", salary: "", category: categories[0].name,
  description: "", skills: "", apply_link: "", is_featured: false,
  qualification: "B.Tech",
  passout_year: "",
  job_type: "Full-time",
  walkin_venue: "",
  walkin_datetime: "",
};

export default function JobFormPage({ isEdit = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { dispatch, getJobById } = useJobs();
  const [form, setForm] = useState(emptyJob);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = isEdit ? "Edit Job – Admin" : "Add New Job – Admin";
    if (isEdit && id) {
      getJobById(id).then(job => {
        if (job) {
          const walkin = parseWalkinData(job.description);
          const cleanDesc = cleanDescription(job.description);
          setForm({
            ...emptyJob,
            ...job,
            description: cleanDesc,
            skills: job.skills?.join(", ") || "",
            qualification: job.qualification || "B.Tech",
            passout_year: job.passout_year || "",
            job_type: job.job_type || "Full-time",
            walkin_venue: walkin?.venue || "",
            walkin_datetime: walkin?.dateTime || "",
          });
        }
      });
    }
  }, [isEdit, id]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Job title is required.";
    if (!form.company.trim()) errs.company = "Company name is required.";
    if (!form.location.trim()) errs.location = "Location is required.";
    if (!form.experience.trim()) errs.experience = "Experience is required.";
    if (!form.description.trim()) errs.description = "Job description is required.";
    if (!form.skills.trim()) errs.skills = "At least one skill is required.";
    if (!form.apply_link?.trim()) {
      errs.apply_link = "Apply link is required.";
    } else if (!/^https?:\/\/.+/.test(form.apply_link)) {
      errs.apply_link = "Must be a valid URL starting with http:// or https://";
    }
    if (form.job_type === "Walk-in") {
      if (!form.walkin_datetime?.trim()) errs.walkin_datetime = "Walk-in Date & Time is required.";
      if (!form.walkin_venue?.trim()) errs.walkin_venue = "Walk-in Venue is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const togglePassoutYear = (year) => {
    setForm((prev) => {
      const current = prev.passout_year ? prev.passout_year.split(", ").filter(Boolean) : [];
      const updated = current.includes(year)
        ? current.filter((y) => y !== year)
        : [...current, year].sort();
      return { ...prev, passout_year: updated.join(", ") };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Fetch the official company logo via Clearbit's Autocomplete API and return Google S2 Favicon service URL
    const fetchLogoUrl = async (companyName) => {
      if (!companyName) return "";
      
      const companyDomains = {
        google: "google.com",
        amazon: "amazon.com",
        microsoft: "microsoft.com",
        netflix: "netflix.com",
        apple: "apple.com",
        meta: "meta.com",
        facebook: "facebook.com",
        twitter: "x.com",
        tata: "tata.com",
        tcs: "tcs.com",
        infosys: "infosys.com",
        wipro: "wipro.com",
        cognizant: "cognizant.com",
        accenture: "accenture.com",
        flipkart: "flipkart.com",
        zomato: "zomato.com",
        swiggy: "swiggy.com",
        ola: "olaweb.com",
        uber: "uber.com",
        paytm: "paytm.com",
        reliance: "reliance.com",
        jio: "jio.com",
        hcl: "hcltech.com",
        techmahindra: "techmahindra.com",
      };

      const normalized = companyName.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
      let domain = companyDomains[normalized] || `${companyName.toLowerCase().trim().replace(/[^a-z0-9.]/g, "")}.com`;

      try {
        const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyName)}`);
        if (res.ok) {
          const suggestions = await res.json();
          if (suggestions && suggestions.length > 0 && suggestions[0].logo) {
            const logo = suggestions[0].logo;
            if (logo.includes("logo.clearbit.com/")) {
              domain = logo.split("logo.clearbit.com/")[1] || domain;
            } else if (suggestions[0].domain) {
              domain = suggestions[0].domain;
            }
          }
        }
      } catch (err) {
        console.error("Autocomplete logo fetch failed:", err);
      }

      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    };


    const logoUrl = await fetchLogoUrl(form.company);

    let finalDescription = form.description;
    if (form.job_type === "Walk-in") {
      finalDescription = serializeWalkinData(form.description, {
        venue: form.walkin_venue,
        dateTime: form.walkin_datetime
      });
    } else {
      finalDescription = cleanDescription(form.description);
    }

    const jobData = { 
      ...form, 
      description: finalDescription,
      company_logo: logoUrl,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) 
    };
    
    // Remove properties not in schema before update (like created_at, updated_at if they snuck in)
    delete jobData.created_at;
    delete jobData.updated_at;
    delete jobData.posted_date;
    delete jobData.expires_at;
    delete jobData.walkin_venue;
    delete jobData.walkin_datetime;

    try {
      if (isEdit) {
        await dispatch({ type: "UPDATE_JOB", payload: { ...jobData, id } });
      } else {
        await dispatch({ type: "ADD_JOB", payload: { ...jobData, slug: generateSlug(jobData.company, jobData.title) } });
      }
      setSaved(true);
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (err) {
      console.error("Failed to save job:", err);
      alert("Failed to save job. Check console for details.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950" id={isEdit ? "edit-job-page" : "add-job-page"}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2" aria-label="Go back" id="job-form-back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="lg:ml-0 ml-8">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? "Edit Job Listing" : "Add New Job Listing"}
            </h1>
            <p className="text-xs text-slate-400">{isEdit ? "Update the job details below" : "Fill in the details to create a new listing"}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {saved ? (
            <div className="max-w-lg mx-auto text-center py-20 animate-scale-in">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <Save className="w-9 h-9 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {isEdit ? "Job Updated!" : "Job Created!"}
              </h2>
              <p className="text-slate-400 text-sm">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate id="job-form" className="max-w-3xl mx-auto space-y-6">
              <div className="card-flat p-6 space-y-5">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3">
                  Basic Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField label="Job Title" id="job-title" error={errors.title} required>
                    <input id="job-title" name="title" type="text" value={form.title} onChange={handleChange}
                      placeholder="e.g. Senior React Developer" className={`input-field ${errors.title ? "border-red-400" : ""}`} />
                  </FormField>
                  <FormField label="Company Name" id="job-company" error={errors.company} required>
                    <input id="job-company" name="company" type="text" value={form.company} onChange={handleChange}
                      placeholder="e.g. Google" className={`input-field ${errors.company ? "border-red-400" : ""}`} />
                  </FormField>
                  <FormField label="Location" id="job-location" error={errors.location} required>
                    <input id="job-location" name="location" type="text" value={form.location} onChange={handleChange}
                      placeholder="e.g. Bangalore, India or Remote" className={`input-field ${errors.location ? "border-red-400" : ""}`} />
                  </FormField>

                  <FormField label="Category" id="job-category">
                    <select
                      id="job-category"
                      name="category"
                      value={categories.some((c) => c.name === form.category) ? form.category : "__custom__"}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setForm((p) => ({ ...p, category: "" }));
                        } else {
                          handleChange(e);
                        }
                      }}
                      className="input-field"
                    >
                      {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      <option value="__custom__">Other (Custom)</option>
                    </select>
                    {!categories.some((c) => c.name === form.category) && (
                      <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="Enter custom category name"
                        className="input-field mt-2"
                        id="job-category-custom"
                      />
                    )}
                  </FormField>
                  <FormField label="Job Type" id="job-type">
                    <select id="job-type" name="job_type" value={form.job_type} onChange={handleChange} className="input-field">
                      {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </FormField>
                  {form.job_type === "Walk-in" && (
                    <>
                      <FormField label="Walk-in Date & Time" id="job-walkin-datetime" error={errors.walkin_datetime} required>
                        <input
                          id="job-walkin-datetime"
                          name="walkin_datetime"
                          type="text"
                          value={form.walkin_datetime || ""}
                          onChange={handleChange}
                          placeholder="e.g. July 25 - July 27, 10:00 AM - 4:00 PM"
                          className={`input-field ${errors.walkin_datetime ? "border-red-400" : ""}`}
                        />
                      </FormField>
                      <FormField label="Walk-in Venue Address" id="job-walkin-venue" error={errors.walkin_venue} required>
                        <input
                          id="job-walkin-venue"
                          name="walkin_venue"
                          type="text"
                          value={form.walkin_venue || ""}
                          onChange={handleChange}
                          placeholder="e.g. Tech Park, 4th Floor, Phase 2, Bangalore"
                          className={`input-field ${errors.walkin_venue ? "border-red-400" : ""}`}
                        />
                      </FormField>
                    </>
                  )}
                  <FormField label="Experience Required" id="job-experience" error={errors.experience} required>
                    <input id="job-experience" name="experience" type="text" value={form.experience} onChange={handleChange}
                      placeholder="e.g. 3-5 years" className={`input-field ${errors.experience ? "border-red-400" : ""}`} />
                  </FormField>
                  <FormField label="Salary Range" id="job-salary">
                    <input id="job-salary" name="salary" type="text" value={form.salary} onChange={handleChange}
                      placeholder="e.g. ₹20L – ₹35L / year" className="input-field" />
                  </FormField>
                  <FormField label="Apply Link (Official URL)" id="job-apply-link" error={errors.apply_link} required>
                    <input id="job-apply-link" name="apply_link" type="url" value={form.apply_link || ""} onChange={handleChange}
                      placeholder="https://company.com/careers/apply" className={`input-field ${errors.apply_link ? "border-red-400" : ""}`} />
                  </FormField>
                  <FormField label="Qualification" id="job-qualification">
                    <select id="job-qualification" name="qualification" value={form.qualification} onChange={handleChange} className="input-field">
                      {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Passed Out Year (select all that apply)" id="job-passout-year">
                    <div id="job-passout-year" role="group" aria-label="Passed out year selection" className="flex flex-wrap gap-2 mt-1">
                      {PASSOUT_YEARS.map((y) => {
                        const selected = form.passout_year?.split(", ").includes(y);
                        return (
                          <button
                            key={y}
                            type="button"
                            onClick={() => togglePassoutYear(y)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                              selected
                                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500"
                            }`}
                            id={`passout-year-${y}`}
                          >
                            {y}
                          </button>
                        );
                      })}
                    </div>
                    {form.passout_year && (
                      <p className="text-xs text-slate-400 mt-1.5">Selected: {form.passout_year}</p>
                    )}
                  </FormField>
                </div>
              </div>

              <div className="card-flat p-6 space-y-5">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-3">
                  Job Details
                </h2>
                <FormField label="Job Description" id="job-description" error={errors.description} required>
                  <textarea id="job-description" name="description" rows={5} value={form.description} onChange={handleChange}
                    placeholder="Describe the role, responsibilities, and company culture..."
                    className={`input-field resize-none ${errors.description ? "border-red-400" : ""}`} />
                </FormField>
                <FormField label="Required Skills (comma-separated)" id="job-skills" error={errors.skills} required>
                  <input id="job-skills" name="skills" type="text" value={form.skills} onChange={handleChange}
                    placeholder="React, TypeScript, Node.js, AWS"
                    className={`input-field ${errors.skills ? "border-red-400" : ""}`} />
                </FormField>
              </div>



              <div className="flex items-center gap-3 justify-end pb-6">
                <button type="button" onClick={() => navigate(-1)} className="btn-secondary" id="job-form-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-8" id="job-form-submit">
                  <Save className="w-4 h-4" />
                  {isEdit ? "Update Job" : "Create Job"}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
