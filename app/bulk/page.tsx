"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const REQUIRED_COLS = ["experience", "age", "city", "education"];

type Row = Record<string, string>;

interface ParsedCSV {
  headers: string[];
  rows: Row[];
  raw: string;
}

// ── Parse CSV string ─────────────────────────────────────────────────────────
function parseCSV(text: string): ParsedCSV {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: Row[] = lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Row = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] ?? "").trim();
    });
    return row;
  });
  return { headers, rows, raw: text };
}

// ── Validate required columns ────────────────────────────────────────────────
function getMissingCols(headers: string[]): string[] {
  return REQUIRED_COLS.filter((c) => !headers.includes(c));
}

type Status = "idle" | "ready" | "predicting" | "done" | "error";

export default function BulkPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [parsed, setParsed] = useState<ParsedCSV | null>(null);
  const [resultCSV, setResultCSV] = useState<string | null>(null);
  const [resultRows, setResultRows] = useState<Row[]>([]);
  const [resultHeaders, setResultHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ── File loading ────────────────────────────────────────────────────────────
  const loadFile = useCallback((file: File) => {
    setError(null);
    setResultCSV(null);
    setStatus("idle");

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are supported.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);
      const missing = getMissingCols(data.headers);

      if (missing.length > 0) {
        setError(
          `CSV is missing required columns: ${missing.join(", ")}. ` +
            `Required: ${REQUIRED_COLS.join(", ")}`
        );
        setParsed(null);
        setStatus("error");
        return;
      }

      if (data.rows.length === 0) {
        setError("CSV has no data rows.");
        setStatus("error");
        return;
      }

      if (data.rows.length > 5000) {
        setError("Maximum 5000 rows per upload.");
        setStatus("error");
        return;
      }

      setParsed(data);
      setFileName(file.name);
      setStatus("ready");
    };
    reader.readAsText(file);
  }, []);

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  // ── Run predictions ─────────────────────────────────────────────────────────
  async function runPredictions() {
    if (!parsed) return;
    setStatus("predicting");
    setError(null);

    const blob = new Blob([parsed.raw], { type: "text/csv" });
    const form = new FormData();
    form.append("file", blob, fileName || "upload.csv");

    try {
      const res = await fetch(`${API_BASE}/predict/bulk`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${res.status}`);
      }

      const csv = await res.text();
      setResultCSV(csv);

      const result = parseCSV(csv);
      setResultHeaders(result.headers);
      setResultRows(result.rows);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  // ── Download result CSV ─────────────────────────────────────────────────────
  function downloadCSV() {
    if (!resultCSV) return;
    const url = URL.createObjectURL(
      new Blob([resultCSV], { type: "text/csv" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "salary_predictions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const preview = parsed?.rows.slice(0, 5) ?? [];
  const previewHeaders = parsed?.headers ?? [];

  return (
    <div className="min-h-screen">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-5 py-14">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition mb-6"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-50 mb-2">
                Bulk Salary Predictor
              </h1>
              <p className="text-slate-500 max-w-xl">
                Upload a CSV with your employee data — the AI model scores every
                row instantly and returns a downloadable result file.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Powered by{" "}
                <a
                  href={`${API_BASE}/docs`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-500 hover:underline"
                >
                  POST /predict/bulk
                </a>{" "}
                · GradientBoostingRegressor (scikit-learn)
              </p>
            </div>

            {/* Sample CSV download */}
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                "name,experience,age,city,education\nSahil,5,27,Bangalore,BTech\nRahul,8,30,Mumbai,MTech\nPriya,3,25,Delhi,MBA\nAnkit,12,35,Hyderabad,PhD"
              )}`}
              download="sample_employees.csv"
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:border-teal-500 hover:text-teal-300 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Download Sample CSV
            </a>
          </div>
        </div>

        {/* Required columns hint */}
        <div className="card-glass rounded-xl px-5 py-3 mb-6 flex flex-wrap gap-3 items-center">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Required columns:
          </span>
          {REQUIRED_COLS.map((col) => (
            <span
              key={col}
              className="text-xs font-mono px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20"
            >
              {col}
            </span>
          ))}
          <span className="text-xs text-slate-600 ml-auto">
            Any extra columns are preserved in the output
          </span>
        </div>

        {/* Upload zone */}
        {status === "idle" || status === "error" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`card-glass rounded-2xl border-2 border-dashed p-14 text-center cursor-pointer transition ${
              dragging
                ? "border-teal-400 bg-teal-500/10"
                : "border-slate-700 hover:border-teal-600"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={onFileChange}
            />
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
            <p className="text-slate-300 font-semibold mb-1">
              Drop your CSV here
            </p>
            <p className="text-slate-500 text-sm">
              or{" "}
              <span className="text-teal-400 underline underline-offset-2">
                click to browse
              </span>
            </p>
            <p className="text-xs text-slate-600 mt-3">
              Max 5,000 rows · UTF-8 encoding
            </p>

            {error && (
              <div className="mt-5 flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl text-left">
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>
        ) : null}

        {/* File ready — preview + run */}
        {(status === "ready" || status === "predicting") && parsed && (
          <div className="space-y-6">
            {/* File info bar */}
            <div className="card-glass rounded-xl px-5 py-3 flex items-center gap-3">
              <svg
                className="w-5 h-5 text-teal-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span className="text-sm text-slate-300 font-medium flex-1">
                {fileName}
              </span>
              <span className="text-xs text-slate-500">
                {parsed.rows.length} rows · {parsed.headers.length} columns
              </span>
              <button
                onClick={() => {
                  setParsed(null);
                  setStatus("idle");
                  setError(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="text-xs text-slate-600 hover:text-slate-400 transition ml-2"
              >
                Remove
              </button>
            </div>

            {/* Preview table */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Preview (first {Math.min(5, preview.length)} rows)
              </p>
              <div className="card-glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        {previewHeaders.map((h) => (
                          <th
                            key={h}
                            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                              REQUIRED_COLS.includes(h)
                                ? "text-teal-400"
                                : "text-slate-500"
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-white/5 last:border-0 hover:bg-white/2"
                        >
                          {previewHeaders.map((h) => (
                            <td
                              key={h}
                              className="px-4 py-2.5 text-slate-400 font-mono"
                            >
                              {row[h] ?? "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {parsed.rows.length > 5 && (
                <p className="text-xs text-slate-600 mt-1.5">
                  + {parsed.rows.length - 5} more rows not shown
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={runPredictions}
                disabled={status === "predicting"}
                className="btn-primary flex-1"
              >
                {status === "predicting" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Running AI predictions...
                  </span>
                ) : (
                  `Run AI Predictions on ${parsed.rows.length} rows`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {status === "done" && resultRows.length > 0 && (
          <div className="space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Rows predicted",
                  value: resultRows.length.toString(),
                },
                {
                  label: "Avg salary (INR)",
                  value: `₹${Math.round(
                    resultRows.reduce(
                      (s, r) =>
                        s + parseFloat(r["predicted_salary_inr"] || "0"),
                      0
                    ) / resultRows.length
                  ).toLocaleString("en-IN")}`,
                },
                {
                  label: "Max salary (INR)",
                  value: `₹${Math.max(
                    ...resultRows.map((r) =>
                      parseFloat(r["predicted_salary_inr"] || "0")
                    )
                  ).toLocaleString("en-IN")}`,
                },
              ].map((s) => (
                <div key={s.label} className="card-glass rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className="text-xl font-bold gradient-text">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={downloadCSV}
                className="btn-primary flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Download Results CSV
              </button>
              <button
                onClick={() => {
                  setParsed(null);
                  setResultCSV(null);
                  setResultRows([]);
                  setStatus("idle");
                  setError(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="px-4 py-2.5 text-sm text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded-xl transition"
              >
                Upload another file
              </button>
            </div>

            {/* Results table */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                Results — showing first {Math.min(50, resultRows.length)} rows
              </p>
              <div className="card-glass rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        {resultHeaders.map((h) => (
                          <th
                            key={h}
                            className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                              h === "predicted_salary_inr"
                                ? "text-teal-400"
                                : "text-slate-500"
                            }`}
                          >
                            {h === "predicted_salary_inr"
                              ? "Predicted Salary (INR)"
                              : h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {resultRows.slice(0, 50).map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-white/5 last:border-0 hover:bg-white/2"
                        >
                          {resultHeaders.map((h) => (
                            <td
                              key={h}
                              className={`px-4 py-2.5 font-mono ${
                                h === "predicted_salary_inr"
                                  ? "text-teal-300 font-semibold"
                                  : "text-slate-400"
                              }`}
                            >
                              {h === "predicted_salary_inr"
                                ? `₹${parseFloat(row[h] ?? "0").toLocaleString("en-IN")}`
                                : (row[h] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
