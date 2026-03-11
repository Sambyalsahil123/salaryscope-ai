"""
ML Training Script — Salary Predictor
======================================
Loads a market-calibrated dataset and trains a GradientBoostingRegressor pipeline.

Setup (run once):
    python ml/build_dataset.py   ← generates ml/data/salary_data.csv
    python ml/train.py           ← trains + saves model.pkl + metrics.json

Data source:
    ml/data/salary_data.csv — 2000-row dataset calibrated against
    2024 Indian IT salary benchmarks (Naukri / LinkedIn / AmbitionBox).
"""

import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import json
from pathlib import Path

BASE_DIR  = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "salary_data.csv"

# ── Load dataset ──────────────────────────────────────────────────────────────
if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"Dataset not found at {DATA_PATH}.\n"
        "Run `python ml/build_dataset.py` first to generate it."
    )

df = pd.read_csv(DATA_PATH)
print(f"Loaded {len(df)} rows from {DATA_PATH.name}")
print(f"Columns: {list(df.columns)}")
print(f"Salary range: {df.salary.min():,.0f} – {df.salary.max():,.0f} INR\n")

X = df[["experience", "age", "city", "education"]]
y = df["salary"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── Pipeline ──────────────────────────────────────────────────────────────────
numerical_cols   = ["experience", "age"]
categorical_cols = ["city", "education"]

num_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler",  StandardScaler()),
])
cat_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
])

preprocessor = ColumnTransformer([
    ("num", num_pipe, numerical_cols),
    ("cat", cat_pipe, categorical_cols),
])

pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("model", GradientBoostingRegressor(
        n_estimators=300,      # more trees → better fit
        learning_rate=0.08,    # smaller LR + more trees = less overfit
        max_depth=5,
        subsample=0.85,        # row sampling (reduces variance)
        min_samples_leaf=10,
        random_state=42,
    )),
])

# ── Train ──────────────────────────────────────────────────────────────────────
print("Training GradientBoostingRegressor...")
pipeline.fit(X_train, y_train)

# ── Evaluate ───────────────────────────────────────────────────────────────────
y_pred = pipeline.predict(X_test)
mae    = mean_absolute_error(y_test, y_pred)
r2     = r2_score(y_test, y_pred)
cv     = cross_val_score(pipeline, X, y, cv=5, scoring="r2").mean()
mae_lpa = mae / 100_000

print(f"\nResults:")
print(f"  MAE:    {mae:>12,.0f} INR  (~{mae_lpa:.2f} LPA)")
print(f"  R²:     {r2:.4f}  ({r2*100:.1f}% variance explained)")
print(f"  CV R²:  {cv:.4f}  (5-fold cross-validation)")

# ── Sample predictions (sanity check) ─────────────────────────────────────────
samples = pd.DataFrame([
    {"experience": 2,  "age": 24, "city": "Delhi",     "education": "BTech"},
    {"experience": 5,  "age": 27, "city": "Bangalore",  "education": "BTech"},
    {"experience": 8,  "age": 31, "city": "Bangalore",  "education": "MTech"},
    {"experience": 12, "age": 36, "city": "Mumbai",     "education": "MBA"},
    {"experience": 15, "age": 40, "city": "Hyderabad",  "education": "PhD"},
])
preds = pipeline.predict(samples)
print("\nSanity check — sample predictions:")
for _, row in samples.iterrows():
    pred = preds[_]
    print(f"  {row.city:<12} {row.education:<6} {int(row.experience):>2}yr  ->  "
          f"{pred/100_000:>6.1f} LPA  ({pred:>10,.0f} INR)")

# ── Save ────────────────────────────────────────────────────────────────────────
metrics = {
    "mae":         round(mae, 2),
    "mae_lpa":     round(mae_lpa, 3),
    "r2":          round(r2,  4),
    "cv_r2":       round(cv,  4),
    "training_rows": len(X_train),
    "data_source": "Indian IT salary benchmarks 2024 (Naukri/LinkedIn/AmbitionBox)",
}

joblib.dump(pipeline, BASE_DIR / "model.pkl")
with open(BASE_DIR / "metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print(f"\nSaved: model.pkl + metrics.json")
