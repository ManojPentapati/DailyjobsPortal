import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "Is Daily Jobs Portal free for job seekers?",
    a: "Yes, 100% free! We never charge candidates for applying to any job listing. We aggregate verified direct links to help you apply directly to companies."
  },
  {
    q: "How do you verify the job listings?",
    a: "Our automated systems and editors scan verified company career pages, official job boards, and trusted hiring networks. We filter out third-party consultancy pages so you can apply directly."
  },
  {
    q: "How often is the portal updated?",
    a: "We update our job listings multiple times a day as new postings are released by companies. You can see real-time updates and expiry times on all job cards."
  },
  {
    q: "What types of roles are posted here?",
    a: "We specialize in early-career, entry-level, internship, and fresher roles in software development, data science, testing, DevOps, product management, and other tech domains in India."
  },
  {
    q: "How do I get notified when new jobs are posted?",
    a: "You can subscribe to our daily email newsletter in the footer or join our active WhatsApp and Telegram channels for instant alerts right on your phone."
  }
];

function FAQItem({ q, a, index }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <div className="border-b border-stone-200 dark:border-white/[0.08] py-4 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-semibold text-stone-900 dark:text-white py-2 group"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base group-hover:text-amber-500 transition-colors">{q}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-amber-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-stone-400 group-hover:text-stone-300 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <p className="mt-2 text-xs sm:text-sm text-stone-500 dark:text-slate-450 leading-relaxed animate-fade-in pl-1">
          {a}
        </p>
      )}
    </div>
  );
}

export default function FAQSection() {
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-[#0b1329]" aria-labelledby="faq-heading" id="faq-section">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> FAQs
          </div>
          <h2 id="faq-heading" className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-slate-400">
            Everything you need to know about our portal and application process
          </p>
        </div>

        <div className="card-flat p-5 sm:p-8 bg-stone-50 dark:bg-[#0f1d32]/50 border border-stone-200 dark:border-white/[0.08] rounded-2xl">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} q={faq.q} a={faq.a} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
