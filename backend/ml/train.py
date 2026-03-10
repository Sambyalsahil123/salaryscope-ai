"""
ML Training Script — Salary Predictor
Run once to generate model.pkl before starting the API server.

Usage:
    python ml/train.py
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

BASE_DIR = Path(__file__).parent

# ── Synthetic Dataset (replace with real CSV in production) ──
np.random.seed(42)
n = 500

experience = np.random.randint(1, 20, n)
age        = experience + np.random.randint(18, 25, n)
city       = np.random.choice(["Delhi", "Mumbai", "Bangalore", "Hyderabad"], n)
education  = np.random.choice(["BTech", "MTech", "MBA", "PhD"], n, p=[0.5, 0.25, 0.15, 0.1])

# Salary formula with noise
base   = 20000
salary = (base
          + experience * 8000
          + (age - 20) * 500
          + np.where(city == "Bangalore", 15000, 0)
          + np.where(education == "MTech", 10000, 0)
          + np.where(education == "PhD", 20000, 0)
          + np.random.normal(0, 5000, n))

df = pd.DataFrame({
    "experience": experience,
    "age":        age,
    "city":       city,
    "education":  education,
    "salary":     salary.round(2),
})

X = df.drop("salary", axis=1)
y = df["salary"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── Pipeline ─────────────────────────────────────────────────
numerical_cols    = ["experience", "age"]
categorical_cols  = ["city", "education"]

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
    ("model", GradientBoostingRegressor(n_estimators=200, random_state=42)),
])

# ── Train ─────────────────────────────────────────────────────
pipeline.fit(X_train, y_train)

# ── Evaluate ──────────────────────────────────────────────────
y_pred = pipeline.predict(X_test)
mae    = mean_absolute_error(y_test, y_pred)
r2     = r2_score(y_test, y_pred)
cv     = cross_val_score(pipeline, X, y, cv=5, scoring="r2").mean()

metrics = {"mae": round(mae, 2), "r2": round(r2, 4), "cv_r2": round(cv, 4)}
print(f"MAE: {mae:,.2f}  |  R²: {r2:.4f}  |  CV R²: {cv:.4f}")

# ── Save ──────────────────────────────────────────────────────
joblib.dump(pipeline, BASE_DIR / "model.pkl")

with open(BASE_DIR / "metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)

print("✅ model.pkl and metrics.json saved to ml/")
