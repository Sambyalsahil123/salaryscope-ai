import Link from "next/link";
import ModelProof from "@/components/ModelProof";

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: "ML-Powered",
    desc: "Gradient Boosting model trained on real salary data across experience, city, and education.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: "City-Aware",
    desc: "Accounts for salary differences across Delhi, Mumbai, Bangalore, and Hyderabad.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "Instant Result",
    desc: "No signup, no wait. Fill four fields — get an AI estimate in under a second.",
  },
];

const stats = [
  { label: "Parameters", value: "4" },
  { label: "Response time", value: "<1s" },
  { label: "Stack", value: "Next.js + FastAPI" },
  { label: "Price", value: "Free" },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Glow bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-5 pt-24 pb-16 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400 bg-teal-400/10 border border-teal-400/20 px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            AI Model Live
          </span>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-slate-50 mb-5">
            Know Your Worth with{" "}
            <span className="gradient-text">AI Precision</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
            Get instant salary estimates powered by machine learning. Enter your
            experience, city, and education — and let the model do the rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/predict"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-teal-500/25"
            >
              Estimate My Salary
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium px-8 py-3.5 rounded-xl transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              View Source
            </a>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 bg-white/[0.02] py-6">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xl font-bold gradient-text">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-5 py-20">
        <h2 className="text-center text-2xl font-bold text-slate-200 mb-3">
          How it works
        </h2>
        <p className="text-center text-slate-500 mb-12">
          Four inputs. One AI model. Instant estimate.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-glass rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-slate-100 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proof it's ML */}
      <section className="max-w-2xl mx-auto px-5 py-10">
        <ModelProof />
      </section>

      {/* Why ML, not JS — client-facing proof */}
      <section className="max-w-3xl mx-auto px-5 py-10">
        <div className="card-glass rounded-2xl p-6 md:p-8 border-teal-500/20">
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            Why this isn&apos;t &quot;just JavaScript&quot;
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            The estimate comes from a trained model on the server — not from rules or formulas in the browser. Here&apos;s what that means:
          </p>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex gap-3">
              <span className="text-teal-400 shrink-0 font-medium">1.</span>
              <span><strong className="text-slate-300">No hardcoded formula.</strong> In JS you&apos;d write something like &quot;if Mumbai then +10k&quot;. Here the model learned patterns from data; there&apos;s no single equation we typed — the weights are trained, not written by hand.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-teal-400 shrink-0 font-medium">2.</span>
              <span><strong className="text-slate-300">Non-linear patterns.</strong> Real salary vs experience isn&apos;t a straight line. The model captures curves and interactions automatically; doing that accurately in JS would mean writing and maintaining many manual rules.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-teal-400 shrink-0 font-medium">3.</span>
              <span><strong className="text-slate-300">Add more inputs without rewriting logic.</strong> Need 10 or 20 factors (skills, company size, etc.)? With ML we retrain on new data; the same API keeps working. In JS, every new factor means more if/else and harder maintenance.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-teal-400 shrink-0 font-medium">4.</span>
              <span><strong className="text-slate-300">Calculation happens on the server.</strong> Open DevTools — there&apos;s no salary logic in the frontend. The number is returned by our API, where a Python ML model runs. You can hit the API directly (see &quot;Open API docs&quot; above) and verify.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-5 py-12 text-center">
        <div className="card-glass rounded-3xl p-10">
          <h2 className="text-2xl font-bold text-slate-100 mb-3">
            Ready to find out your worth?
          </h2>
          <p className="text-slate-500 mb-8">
            No account needed. Just 4 inputs — and your result is ready.
          </p>
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-teal-500/25"
          >
            Get Free Estimate
          </Link>
        </div>
      </section>
    </div>
  );
}
