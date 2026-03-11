# SalaryScope AI — Code Flow (Start se End)

Yeh doc batata hai: **kaunsi file kya karti hai, kab chalati hai, aur data kahan se kahan tak jata hai.**

---

## Big picture (ek nazar me)

```
[1] build_dataset.py  →  salary_data.csv (2000 rows)
           ↓
[2] train.py          →  CSV padh ke model train  →  model.pkl + metrics.json
           ↓
[3] main.py           →  Server start hote hi model.pkl load  →  app.state.pipeline
           ↓
[4] User browser      →  Form bharta hai  →  POST /predict (JSON)
           ↓
[5] predict.py       →  pipeline.predict(input)  →  JSON response
           ↓
[6] Frontend         →  Result dikhata hai
```

---

## Step 1: Data kaise banta hai — `backend/ml/build_dataset.py`

**Kab chalata hai:** Jab tum `python ml/build_dataset.py` run karte ho (ek baar, data banane ke liye).

**Kya karta hai:**

1. **Experience (1–20 years)** — 2000 random values, zyada weight 1–8 yr pe (pyramid).
2. **Age** — experience se linked: `experience + 21–27 + thoda noise`, 21–60 ke beech.
3. **City** — Bangalore 35%, Hyderabad 25%, Mumbai 22%, Delhi 18%.
4. **Education** — BTech 58%, MTech 22%, MBA 14%, PhD 6%.
5. **Salary formula:**
   - `base_lpa = 3.2 * exp(0.195 * experience)` — exponential growth (real market jaisa).
   - City multiplier: Bangalore 1.0, Hyderabad 0.91, Mumbai 0.875, Delhi 0.855.
   - Education multiplier: BTech 1.0, MTech 1.175, MBA 1.22, PhD 1.30.
   - 8+ yr + MBA/PhD pe extra 1.15x.
   - Last me ±18% noise (market variance).
6. **Output:** `ml/data/salary_data.csv` — columns: `experience`, `age`, `city`, `education`, `salary`.

**Summary:** Yeh file **sirf CSV banati hai**. Koi model train nahi hota.

---

## Step 2: Model kaise banta hai — `backend/ml/train.py`

**Kab chalata hai:** Jab tum `python ml/train.py` run karte ho (data ke baad, ek baar).

**Kya karta hai:**

1. **CSV load**  
   `ml/data/salary_data.csv` padhta hai. Agar file nahi mile to error: pehle `build_dataset.py` chalao.

2. **X aur y alag karna**  
   - `X` = 4 columns: experience, age, city, education  
   - `y` = salary (target)

3. **Train / test split**  
   - 80% rows → training, 20% → test (same split har baar, `random_state=42`).

4. **Pipeline banana**  
   - **Numerical (experience, age):** missing value median se, phir StandardScaler (mean=0, std=1).  
   - **Categorical (city, education):** missing → most_frequent, phir OneHotEncoder (Delhi/Mumbai/Bangalore/Hyderabad, BTech/MTech/MBA/PhD → 0/1 columns).  
   - **Model:** GradientBoostingRegressor (300 trees, depth 5, learning_rate 0.08).

5. **Train**  
   `pipeline.fit(X_train, y_train)` — model andar se patterns seekhta hai.

6. **Evaluate**  
   Test set pe predict karke MAE, R², CV R² nikalta hai.

7. **Save**  
   - `joblib.dump(pipeline, "model.pkl")` — pura pipeline (preprocessor + model) ek file me.  
   - `metrics.json` — MAE, R², cv_r2, training_rows, data_source.

**Summary:** CSV → train → **model.pkl** (wohi file jo API use karegi). Ab prediction ke liye CSV dobara nahi padhna.

---

## Step 3: API server kaise start hota hai — `backend/app/main.py`

**Kab chalata hai:** Jab tum `uvicorn app.main:app --reload` chalate ho.

**Kya karta hai:**

1. **Lifespan (startup)**  
   - `model.pkl` exist karta hai? Nahi to error: pehle `train.py` chalao.  
   - `joblib.load(MODEL_PATH)` → **app.state.pipeline** me daal deta hai (sirf ek baar load).  
   - `metrics.json` padh ke **app.state.metrics** me daal deta hai.

2. **FastAPI app**  
   - CORS: localhost:3000 + salaryscope-ai.vercel.app se frontend request kar sake.  
   - Routers include: `health.router`, `predict.router`.

3. **Request aate hi**  
   Har request me `request.app.state.pipeline` use hota hai — model dobara load nahi hota.

**Summary:** Server start = **model ek baar memory me**. Baaki sab request usi pipeline se predict karte hain.

---

## Step 4: Request/Response shape — `backend/app/models/schemas.py`

**Kya hai:** Pydantic models — API ko pata chalega input/output ka structure.

- **PredictRequest:** experience (1–50), age (18–70), city (Delhi/Mumbai/Bangalore/Hyderabad), education (BTech/MTech/MBA/PhD).  
- **PredictResponse:** predicted_salary, currency="INR", input_received (jo bheja tha).

Frontend jo JSON bhejta hai wo PredictRequest jaisa hona chahiye; jo API return karti hai wo PredictResponse jaisa hota hai.

---

## Step 5: Prediction kaise hoti hai — `backend/app/routers/predict.py`

### Single prediction — `POST /predict`

1. Body me JSON aata hai: `{ experience, age, city, education }`.  
2. FastAPI use **PredictRequest** se validate karta hai (range, allowed cities/education).  
3. Ek row ka DataFrame banta hai: same 4 columns.  
4. **pipeline.predict(input_df)[0]** — andar preprocessor (scale + one-hot) lagta hai, phir model predict karta hai → ek number (salary).  
5. Round karke **PredictResponse** me daal ke return: `{ predicted_salary, currency, input_received }`.

**Yahan koi CSV nahi padhta — sirf model.pkl ka pipeline + naya input.**

### Bulk prediction — `POST /predict/bulk`

1. Request me **file** (CSV) aata hai.  
2. CSV parse karke columns check: experience, age, city, education hona zaroori.  
3. Rows 1–5000 tak allow.  
4. **pipeline.predict(features)** — har row ke liye prediction.  
5. Original DataFrame me **predicted_salary_inr** column add karke CSV return (download).

---

## Step 6: Frontend — `app/predict/page.tsx`

**Kya hota hai:**

1. **State:** experience, age, city, education, result, loading, error.  
2. **Form submit:**  
   - `e.preventDefault()` — page reload nahi.  
   - experience/age validate (1–50, 18–70).  
   - **fetch(API_BASE + "/predict", { method: "POST", body: JSON.stringify({...}) })**.  
3. **Response:**  
   - 200 + JSON → `setResult(data)` → right side pe salary + "Based on" details.  
   - Error → `setError(...)` → red message.  
4. **UI:** Left = form, Right = result card (₹ salary, input_received) ya placeholder.

**API_BASE:** `.env.local` me `NEXT_PUBLIC_API_URL` (local = http://localhost:8000, production = Render URL).

---

## Flow ek line me (user click se result tak)

1. User form bharta hai, "Get AI Estimate" click karta hai.  
2. Browser **POST /predict** with JSON body.  
3. FastAPI body ko **PredictRequest** se validate karta hai.  
4. **predict.py** me payload se 1-row DataFrame banta hai → **request.app.state.pipeline.predict(...)** → ek number.  
5. Woh number **PredictResponse** me daal ke JSON return.  
6. Frontend wo JSON setResult me daalta hai → UI me salary dikh jati hai.

**Purana data yahan kahin bhi read nahi hota — sirf model.pkl (memory me loaded) + naya input use hota hai.**

---

## File summary

| File | Kab chalta hai | Kya karta hai |
|------|----------------|----------------|
| `ml/build_dataset.py` | Hand-run (data banana) | 2000 rows bana ke `ml/data/salary_data.csv` likhta hai |
| `ml/train.py` | Hand-run (model banana) | CSV padh ke train → `model.pkl` + `metrics.json` |
| `app/main.py` | `uvicorn` se server start | model.pkl load → app.state.pipeline, routers attach |
| `app/models/schemas.py` | Har /predict request | Request/response shape define (Pydantic) |
| `app/routers/predict.py` | POST /predict ya /predict/bulk | pipeline.predict() call karke salary return |
| `app/predict/page.tsx` | User /predict page kholta hai | Form → fetch /predict → result dikhata hai |

Isse **starting se end tak** pura process clear ho jana chahiye: data kahan se, model kaise banta hai, API kaise predict karti hai, aur frontend kaise call karke dikhata hai.
