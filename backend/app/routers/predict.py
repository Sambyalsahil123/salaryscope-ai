"""
/predict/bulk — CSV upload → ML predictions → download result CSV.

Accepts any CSV with at least these columns (case-insensitive):
  experience, age, city, education

All other columns are preserved in the output.
Returns a CSV with a new column: predicted_salary_inr
"""

import io

import pandas as pd
from fastapi import APIRouter, HTTPException, Request, UploadFile, File
from fastapi.responses import StreamingResponse

from app.models.schemas import PredictRequest, PredictResponse

router = APIRouter(prefix="/predict", tags=["Prediction"])

# ── Columns the model requires (lowercase) ──────────────────────────────────
REQUIRED_COLS = {"experience", "age", "city", "education"}


def _normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Lowercase all column names so uploads are case-insensitive."""
    df.columns = [c.strip().lower() for c in df.columns]
    return df


# ── Single prediction ────────────────────────────────────────────────────────
@router.post("", response_model=PredictResponse)
def predict_salary(payload: PredictRequest, request: Request):
    pipeline = request.app.state.pipeline

    input_df = pd.DataFrame([{
        "experience": payload.experience,
        "age":        payload.age,
        "city":       payload.city,
        "education":  payload.education,
    }])

    try:
        raw_prediction = pipeline.predict(input_df)[0]
        salary = round(float(raw_prediction), 2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    return PredictResponse(
        predicted_salary=salary,
        input_received=payload,
    )


# ── Bulk prediction ──────────────────────────────────────────────────────────
@router.post("/bulk")
async def predict_bulk(
    request: Request,
    file: UploadFile = File(..., description="CSV file with columns: experience, age, city, education"),
):
    """
    Upload a CSV → get back a CSV with predicted_salary_inr for each row.

    Required columns (case-insensitive): experience, age, city, education
    All other columns are kept as-is in the output.

    Example CSV:
        name,experience,age,city,education
        Sahil,5,27,Bangalore,BTech
        Rahul,8,30,Mumbai,MTech
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")

    content = await file.read()

    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not parse CSV. Ensure it is valid UTF-8 CSV.")

    df = _normalize_columns(df)

    missing = REQUIRED_COLS - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"CSV is missing required columns: {sorted(missing)}. "
                   f"Required: {sorted(REQUIRED_COLS)}",
        )

    if len(df) == 0:
        raise HTTPException(status_code=400, detail="CSV has no data rows.")

    if len(df) > 5000:
        raise HTTPException(status_code=400, detail="Maximum 5000 rows per upload.")

    pipeline = request.app.state.pipeline
    try:
        features = df[["experience", "age", "city", "education"]].copy()
        features["experience"] = pd.to_numeric(features["experience"], errors="coerce")
        features["age"]        = pd.to_numeric(features["age"],        errors="coerce")

        predictions = pipeline.predict(features)
        df["predicted_salary_inr"] = [round(float(p), 2) for p in predictions]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=salary_predictions.csv"
        },
    )
