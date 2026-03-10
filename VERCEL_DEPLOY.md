# Vercel deploy — Next.js at repo root

Next.js app is now at **repo root** (package.json, app/, components/ at root). No subfolder.

## Vercel settings

1. **Root Directory:** leave **empty** (do not set to `frontend`).
2. **Environment variable:** `NEXT_PUBLIC_API_URL` = `https://salaryscope-ai.onrender.com`
3. Deploy / Redeploy.

Build will detect Next.js from root and succeed.
