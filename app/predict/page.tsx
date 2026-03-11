"use client";

import { useState } from "react";
import Link from "next/link";
import ModelProof from "@/components/ModelProof";

const CITIES = ["Delhi", "Mumbai", "Bangalore", "Hyderabad"] as const;
const EDUCATION = ["BTech", "MTech", "MBA", "PhD"] as const;

type City = (typeof CITIES)[number];
type Education = (typeof EDUCATION)[number];

interface PredictResponse {
  predicted_salary: number;
  currency: string;
  confidence_range: {
    low: number;
    high: number;
    note: string;
  };
  input_received: {
    experience: number;
    age: number;
    city: City;
    education: Education;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CITY_FLAGS: Record<City, string> = {
  Delhi: "🏛️",
  Mumbai: "🌊",
  Bangalore: "💻",
  Hyderabad: "💎",
};

const EDU_ICONS: Record<Education, string> = {
  BTech: "⚙️",
  MTech: "🔬",
  MBA: "📊",
  PhD: "🎓",
};

export default function PredictPage() {
  const [experience, setExperience] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState<City>("Bangalore");
  const [education, setEducation] = useState<Education>("BTech");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const exp = parseFloat(experience);
    const ageNum = parseFloat(age);
    if (isNaN(exp) || exp <= 0 || exp > 50) {
      setError("Experience must be between 1 and 50 years.");
      return;
    }
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 70) {
      setError("Age must be between 18 and 70.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experience: exp, age: ageNum, city, education }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Request failed: ${res.status}`);
      }
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 py-14">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </Link>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">
            Salary Estimator
          </h1>
          <p className="text-slate-500">
            Fill in your profile — AI will predict your market salary instantly.
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Estimate is computed by our ML model on the server, not by rules in the browser.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="card-glass rounded-2xl p-7 space-y-5"
          >
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Your Profile
            </h2>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                min={1}
                max={50}
                step={0.5}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="input-dark"
                placeholder="e.g. 5"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Age
              </label>
              <input
                type="number"
                min={18}
                max={70}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="input-dark"
                placeholder="e.g. 28"
                required
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                City
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                      city === c
                        ? "bg-teal-500/15 border-teal-500 text-teal-300"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <span>{CITY_FLAGS[c]}</span>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Education
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EDUCATION.map((ed) => (
                  <button
                    key={ed}
                    type="button"
                    onClick={() => setEducation(ed)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                      education === ed
                        ? "bg-teal-500/15 border-teal-500 text-teal-300"
                        : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    <span>{EDU_ICONS[ed]}</span>
                    {ed}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analysing...
                </span>
              ) : (
                "Get AI Estimate"
              )}
            </button>
          </form>

          {/* Result panel */}
          <div className="space-y-5">
            {!result && !loading && (
              <div className="card-glass rounded-2xl p-7 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
                <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium mb-1">Your result will appear here</p>
                <p className="text-sm text-slate-600">Fill in your profile and click estimate</p>
              </div>
            )}

            {result && (
              <div className="card-glass rounded-2xl p-7">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs font-medium text-teal-400 uppercase tracking-widest">
                    AI Result
                  </span>
                </div>

                <p className="text-sm text-slate-500 mb-1">Estimated Annual Salary</p>
                <p className="text-5xl font-bold gradient-text mb-1">
                  &#8377;{result.predicted_salary.toLocaleString("en-IN")}
                </p>
                <p className="text-slate-600 text-sm mb-2">Indian Rupees (INR)</p>

                {/* Confidence range bar */}
                {result.confidence_range && (
                  <div className="mt-4 mb-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Market Range (±20%)
                    </p>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-400">
                        &#8377;{result.confidence_range.low.toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-teal-400 font-semibold px-2 py-0.5 bg-teal-500/10 rounded-full">
                        Predicted
                      </span>
                      <span className="text-sm font-medium text-slate-400">
                        &#8377;{result.confidence_range.high.toLocaleString("en-IN")}
                      </span>
                    </div>
                    {/* visual bar */}
                    <div className="relative h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-600 via-teal-500 to-slate-600 rounded-full" />
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5">{result.confidence_range.note}</p>
                  </div>
                )}

                <a
                  href={`${API_BASE}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition"
                >
                  Served by ML API (POST /predict)
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <div className="mb-6" />

                <div className="border-t border-white/5 pt-6 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                    Based on
                  </p>
                  {[
                    { label: "Experience", value: `${result.input_received.experience} years` },
                    { label: "Age", value: `${result.input_received.age}` },
                    { label: "City", value: `${CITY_FLAGS[result.input_received.city]} ${result.input_received.city}` },
                    { label: "Education", value: `${EDU_ICONS[result.input_received.education]} ${result.input_received.education}` },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <span className="text-sm font-medium text-slate-300">{item.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setResult(null); setExperience(""); setAge(""); }}
                  className="mt-6 w-full text-sm text-slate-500 hover:text-slate-300 transition"
                >
                  Try another estimate
                </button>
              </div>
            )}

            <ModelProof />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "⚡", label: "Instant" },
                { icon: "🔒", label: "No signup" },
                { icon: "🆓", label: "Always free" },
              ].map((b) => (
                <div key={b.label} className="card-glass rounded-xl p-3 text-center">
                  <p className="text-lg mb-1">{b.icon}</p>
                  <p className="text-xs text-slate-500">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
