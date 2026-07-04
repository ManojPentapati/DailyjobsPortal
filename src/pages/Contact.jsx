import { useEffect, useState } from "react";
import { Mail, MapPin, Send, CheckCircle2, MessageSquare, Clock } from "lucide-react";

const CONTACT_INFO = [
  { icon: Mail, label: "Email Us", value: "dailyjobsposting@gmail.com", href: "mailto:dailyjobsposting@gmail.com", color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40" },
  { icon: MapPin, label: "Visit Us", value: "Hyderabad,Telangana", href: "#", color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20" },
];

const SUBJECTS = [
  "General Inquiry",
  "Post a Job",
  "Report an Issue",
  "Partnership",
  "Career Advice",
  "Other",
];

const initialForm = { name: "", email: "", subject: "", message: "" };
const initialErrors = { name: "", email: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Contact Us – Daily Jobs Portal";
  }, []);

  const validate = () => {
    const newErrors = { ...initialErrors };
    if (!form.name.trim()) newErrors.name = "Full name is required.";
    else if (form.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters.";

    if (!form.email.trim()) newErrors.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Please enter a valid email address.";

    if (!form.subject) newErrors.subject = "Please select a subject.";

    if (!form.message.trim()) newErrors.message = "Message is required.";
    else if (form.message.trim().length < 10) newErrors.message = "Message must be at least 10 characters.";

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        setForm(initialForm);
      } else {
        alert(result.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error("Contact form Web3Forms submission failed:", err);
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="contact-page">
      {/* Header */}
      <section className="bg-stone-50 dark:bg-[#0f1d32] py-16 border-b border-stone-200 dark:border-slate-800/60" aria-labelledby="contact-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700/50 rounded-full text-amber-700 dark:text-amber-400 text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" /> Get in Touch
          </div>
          <h1 id="contact-heading" className="text-4xl font-extrabold mb-4 text-stone-900 dark:text-white">Contact Us</h1>
          <p className="text-stone-500 dark:text-slate-300 text-lg">Have questions? We're here to help you find your next opportunity.</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Let's Connect</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Reach out for job posting inquiries, platform questions, or partnership opportunities.
              </p>
            </div>
            {CONTACT_INFO.map(({ icon: Icon, label, value, href, color }) => (
              <a
                key={label}
                href={href}
                className="card p-4 flex items-center gap-4 hover:border-amber-200 dark:hover:border-amber-700 border-2 border-transparent transition-all"
                id={`contact-info-${label.replace(/\s/g, "-").toLowerCase()}`}
              >
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="card-flat p-8">
              {submitted ? (
                <div className="text-center py-12 animate-scale-in" id="contact-success">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    Thanks for reaching out. We'll get back to you within 24 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-primary"
                    id="send-another-btn"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate id="contact-form" className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Send a Message</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Rahul Sharma"
                        className={`input-field ${errors.name ? "border-red-400 dark:border-red-500 focus:ring-red-400" : ""}`}
                        aria-describedby={errors.name ? "name-error" : undefined}
                        aria-invalid={!!errors.name}
                        autoComplete="name"
                      />
                      {errors.name && <p id="name-error" className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="rahul@example.com"
                        className={`input-field ${errors.email ? "border-red-400 dark:border-red-500 focus:ring-red-400" : ""}`}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        aria-invalid={!!errors.email}
                        autoComplete="email"
                      />
                      {errors.email && <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={`input-field ${errors.subject ? "border-red-400 dark:border-red-500 focus:ring-red-400" : ""}`}
                      aria-describedby={errors.subject ? "subject-error" : undefined}
                      aria-invalid={!!errors.subject}
                    >
                      <option value="">Select a subject...</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.subject && <p id="subject-error" className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help..."
                      className={`input-field resize-none ${errors.message ? "border-red-400 dark:border-red-500 focus:ring-red-400" : ""}`}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      aria-invalid={!!errors.message}
                    />
                    {errors.message && <p id="message-error" className="text-red-500 text-xs mt-1">{errors.message}</p>}
                    <p className="text-xs text-slate-400 mt-1 text-right">{form.message.length} / 10 min</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3 disabled:opacity-60"
                    id="contact-submit-btn"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
