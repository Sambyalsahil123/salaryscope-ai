"""
/predict router — handles salary prediction requests.
"""

import pandas as pd
from fastapi import APIRouter, HTTPException, Request
from app.models.schemas import PredictRequest, PredictResponse

router = APIRouter(prefix="/predict", tags=["Prediction"])


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
