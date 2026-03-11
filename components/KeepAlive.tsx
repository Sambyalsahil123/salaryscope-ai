"use client";

import { useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Silently pings /health on mount so the Render backend wakes up
 * before the user clicks anything. No UI — invisible to user.
 */
export default function KeepAlive() {
  useEffect(() => {
    fetch(`${API_BASE}/health`, { method: "GET" }).catch(() => {
      // backend is waking up — no action needed, fire-and-forget
    });
  }, []);

  return null;
}
