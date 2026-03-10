# SalaryScope AI — Portfolio Project

**AI-powered salary estimator.** Enter experience, age, city, and education → get an instant salary estimate (INR). Full-stack: Next.js 15 + FastAPI + scikit-learn.

**Live demo:** [Add your Vercel link after deploy]  
**Backend API:** [Add your Render/Railway link after deploy]

---

## Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend  | FastAPI, Pydantic, Uvicorn |
| ML       | scikit-learn (GradientBoostingRegressor), Pipeline, joblib |
| Deploy   | Vercel (frontend), Render / Railway (backend) |

---

## Run locally

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python ml/train.py          # once: creates model.pkl
python -m uvicorn app.main:app --reload
```

API: http://localhost:8000  
Docs: http://localhost:8000/docs

### 2. Frontend

```bash
# From repo root (where package.json lives)
npm install
cp .env.local.example .env.local   # edit NEXT_PUBLIC_API_URL if needed
npm run dev
```

App: http://localhost:3000

### 3. Test flow

Open http://localhost:3000 → “Estimate My Salary” → fill form → Get Estimate. Result shows predicted salary in INR.

---

## Deploy (for Upwork / LinkedIn portfolio)

### Backend (Render or Railway)

1. Push this repo to GitHub.
2. On Render: New → Web Service → connect repo, set root to `backend` (or use Dockerfile from repo root).
3. Build: `pip install -r requirements.txt` (or use Docker).
4. Start: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Run `python ml/train.py` in build step so `model.pkl` exists, or add it to repo / build script.
6. Copy the public URL (e.g. `https://salaryscope-api.onrender.com`).

### Frontend (Vercel)

1. Vercel → New Project → import same GitHub repo.
2. **Root Directory: leave empty** (Next.js app is at repo root).
3. Environment variable: `NEXT_PUBLIC_API_URL` = your backend URL (e.g. `https://salaryscope-ai.onrender.com`).
4. Deploy. Copy the frontend URL (e.g. `https://salaryscope-ai.vercel.app`).

### CORS

In `backend/app/main.py`, add your Vercel URL to `allow_origins`:

```python
allow_origins=["http://localhost:3000", "https://salaryscope-ai.vercel.app"],
```

Redeploy backend after changing.

---

## For Upwork / LinkedIn

- **Project title:** AI Salary Estimator (Next.js + FastAPI + ML)
- **One-liner:** Full-stack AI product: user enters profile → ML model returns salary estimate; deployed on Vercel + Render.
- **Link:** Share the live frontend URL and (optional) GitHub repo.
- **Screenshot:** Home page + Predictor page with a sample result.

---

## Project structure

```
salaryscope-ai/           (repo root = Next.js app)
├── app/
│   ├── page.tsx
│   ├── predict/page.tsx
│   └── layout.tsx
├── components/
├── package.json
├── next.config.ts
├── backend/              # FastAPI + ML
│   ├── app/
│   ├── ml/
│   └── requirements.txt
└── README.md
```

---

## License

MIT. Use for portfolio and learning.
