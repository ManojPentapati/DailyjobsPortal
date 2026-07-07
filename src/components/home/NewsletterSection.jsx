import { useState } from "react";
import { Mail, Sparkles, CheckCircle, Bell } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', 'duplicate'
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setLoading(true);
    setStatus(null);
    setMessage("");

    try {
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email: email.trim().toLowerCase() }]);

      if (error) {
        // PostgREST Unique constraint violation code is 23505
        if (error.code === "23505") {
          setStatus("duplicate");
          setMessage("You're already on the list! We'll keep sending you job alerts. ✨");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
        setMessage("Awesome! You've successfully subscribed to daily tech job alerts. 🚀");
        setEmail("");
      }
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      setStatus("error");
      setMessage("Failed to subscribe. Please try again later or contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 px-4 max-w-7xl mx-auto" id="newsletter-section">
      <div 
        className="relative overflow-hidden rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-white/[0.06] p-8 sm:p-12 lg:p-16 text-center shadow-xl"
        style={{
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.1)"
        }}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Stay Ahead
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight mb-4">
            Never Miss Another Job Opening
          </h2>
          
          <p className="text-sm sm:text-base text-stone-500 dark:text-slate-400 leading-relaxed mb-8">
            Subscribe to our daily newsletter and get the latest tech jobs delivered straight to your inbox. No middlemen, no spam—just fresh, verified links.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" id="newsletter-form">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-slate-500" />
              <input
                type="email"
                id="newsletter-email-input"
                name="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || status === "success"}
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-white border border-stone-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 disabled:opacity-60"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || status === "success"}
              className="px-6 py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2"
              id="newsletter-submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Subscribe Alerts
                </>
              )}
            </button>
          </form>

          {/* Status Message */}
          {status && (
            <div 
              className={`mt-6 inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium animate-slide-up ${
                status === "success" 
                  ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200/50 dark:border-green-900/30"
                  : status === "duplicate"
                  ? "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30"
                  : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/30"
              }`}
              id="newsletter-status-message"
            >
              {status === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
