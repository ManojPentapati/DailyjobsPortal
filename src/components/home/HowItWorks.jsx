import { Search, FileText, Rocket } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description: "Browse thousands of tech roles across top companies. Filter by domain, location, or skill.",
    color: "from-amber-400 to-orange-500",
    glow: "rgba(255,153,0,0.25)",
    step: "01",
  },
  {
    icon: FileText,
    title: "Apply Instantly",
    description: "One-click apply with your profile. No lengthy forms — just submit and you're in the pipeline.",
    color: "from-amber-500 to-orange-600",
    glow: "rgba(255,153,0,0.25)",
    step: "02",
  },
  {
    icon: Rocket,
    title: "Get Hired",
    description: "Companies review your application and reach out directly. Land your dream role faster.",
    color: "from-emerald-500 to-teal-600",
    glow: "rgba(52,211,153,0.25)",
    step: "03",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-[#0a1120]" aria-labelledby="how-it-works-heading" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700/50 mb-4">
            <Rocket className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Simple Process</span>
          </div>
          <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-stone-900 dark:text-white mb-3">
            How It Works
          </h2>
          <p className="text-stone-500 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Three simple steps to land your next tech role
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-emerald-500/20" />

          {steps.map((step, i) => (
            <div
              key={step.step}
              className="relative group animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="bg-stone-50 dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                {/* Step number */}
                <div className="text-[10px] font-extrabold text-stone-300 dark:text-slate-600 tracking-widest mb-4 uppercase">
                  Step {step.step}
                </div>

                {/* Icon */}
                <div className="relative inline-flex mb-5">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    style={{ boxShadow: `0 8px 24px ${step.glow}` }}
                  >
                    <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-stone-500 dark:text-slate-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
