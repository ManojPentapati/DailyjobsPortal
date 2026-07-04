import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      // Try to insert into subscribers table
      const { error } = await supabase
        .from("subscribers")
        .insert([{ email: email.toLowerCase().trim() }]);

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation — already subscribed
          setStatus("success");
          setMessage("You're already subscribed! 🎉");
        } else {
          throw error;
        }
      } else {
        setStatus("success");
        setMessage("You're subscribed! We'll send you daily job alerts. 🎉");
      }
      setEmail("");
    } catch (err) {
      console.error("Subscribe error:", err);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 sm:p-8" id="newsletter-signup">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="w-5 h-5 text-white/90" />
          <h3 className="text-lg font-bold text-white">Get Daily Job Alerts</h3>
        </div>
        <p className="text-sm text-white/80 mb-5">
          Never miss a new opportunity. Get the latest jobs delivered to your inbox every day — completely free.
        </p>

        {status === "success" ? (
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-white">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
              placeholder="Enter your email..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              id="newsletter-email-input"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-5 py-2.5 bg-white text-amber-600 font-semibold text-sm rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 min-w-[120px]"
              id="newsletter-subscribe-btn"
            >
              {status === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-xs text-white/80 mt-2">{message}</p>
        )}
      </div>
    </section>
  );
}
