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
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

## 3. Test

- Click **Estimate My Salary** or go to **Try Predictor**
- Fill: Experience (e.g. 5), Age (e.g. 28), City, Education
- Click **Get Estimate** → predicted salary in INR

## 4. Deploy (when ready)

- Backend → Render or Railway (see README)
- Frontend → Vercel, set `NEXT_PUBLIC_API_URL` to backend URL
- Add frontend URL to backend CORS in `app/main.py`
- Put live link in README and use that link on Upwork / LinkedIn
