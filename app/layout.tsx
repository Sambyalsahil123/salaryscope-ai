import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import KeepAlive from "@/components/KeepAlive";

export const metadata: Metadata = {
  title: "SalaryScope AI | AI-Powered Salary Predictor",
  description:
    "Get instant AI-powered salary estimates based on your experience, location, and education. Free, no signup.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Navbar */}
        <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                S
              </span>
              <span className="font-semibold text-slate-100 tracking-tight">
                SalaryScope <span className="gradient-text">AI</span>
              </span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="text-sm text-slate-400 hover:text-slate-100 transition px-3 py-1.5"
              >
                Home
              </Link>
              <Link
                href="/bulk"
                className="text-sm text-slate-400 hover:text-slate-100 transition px-3 py-1.5"
              >
                Bulk CSV
              </Link>
              <Link
                href="/predict"
                className="text-sm font-medium bg-teal-500 hover:bg-teal-400 text-white px-4 py-1.5 rounded-lg transition"
              >
                Try Free
              </Link>
            </nav>
          </div>
        </header>

        <KeepAlive />
        <main className="flex-1 pt-16">{children}</main>

        <footer className="relative z-10 border-t border-white/5 bg-slate-950 py-8 text-center text-sm text-slate-600">
          <p>
            SalaryScope AI &mdash; Built with{" "}
            <span className="text-slate-500">Next.js + FastAPI + scikit-learn</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
