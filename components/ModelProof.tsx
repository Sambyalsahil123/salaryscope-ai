"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ModelInfo {
  model_type: string;
  library: string;
  metrics: { r2?: number; mae?: number; cv_r2?: number };
  api_docs_url: string;
}

export default function ModelProof() {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/model-info`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setInfo)
      .catch(() => setError(true));
  }, []);

  if (error || !info) return null;

  const r2 = info.metrics?.r2 != null ? (info.metrics.r2 * 100).toFixed(1) : null;
  const cvR2 = info.metrics?.cv_r2 != null ? (info.metrics.cv_r2 * 100).toFixed(1) : null;

  return (
    <div className="card-glass rounded-2xl p-5 border-teal-500/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <span className="text-xs font-semibold text-teal-400 uppercase tracking-widest">
          Proof: Real ML, not if/else
        </span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-4">
        This estimate is computed by a{" "}
        <strong className="text-slate-300">{info.model_type}</strong> model (
        {info.library}) running on our API. No hardcoded rules — the same model
        file (<code className="text-teal-400/90">.pkl</code>) used in training
        serves predictions live.
      </p>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {r2 != null && (
          <span className="text-slate-500">
            Validation R²: <span className="text-slate-300 font-medium">{r2}%</span>
          </span>
        )}
        {cvR2 != null && (
          <span className="text-slate-500">
            CV R²: <span className="text-slate-300 font-medium">{cvR2}%</span>
          </span>
        )}
        <a
          href={info.api_docs_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 font-medium transition"
        >
          Open API docs (Swagger)
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
