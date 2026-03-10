# Quick start — SalaryScope AI

## 1. Backend (terminal 1)

```bash
cd backend
pip install -r requirements.txt
python ml/train.py
python -m uvicorn app.main:app --reload
```


Leave this running. API: http://localhost:8000


## 2. Frontend (terminal 2)

```bash
# From repo root (same folder as package.json)
npm install
npm run dev
```

Open: http://localhost:3000

## 3. Test

- Click **Estimate My Salary** or go to **Try Predictor**
- Fill: Experience (e.g. 5), Age (e.g. 28), City, Education
- Click **Get Estimate** → predicted salary in INR

## 4. Deploy (when ready)

- Backend → Render (root: `backend`), see README
- Frontend → Vercel: **leave Root Directory empty** (Next.js is at repo root)
- Env: `NEXT_PUBLIC_API_URL` = backend URL
