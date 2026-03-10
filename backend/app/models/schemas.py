"""
Pydantic schemas — request/response contracts for the API.
These match what the frontend sends and what we return.
"""

from pydantic import BaseModel, Field
from typing import Literal


class PredictRequest(BaseModel):
    experience: float = Field(..., gt=0, le=50, description="Years of work experience")
    age:        float = Field(..., gt=18, le=70, description="Age of the person")
    city:       Literal["Delhi", "Mumbai", "Bangalore", "Hyderabad"] = Field(
        ..., description="City of work"
    )
    education:  Literal["BTech", "MTech", "MBA", "PhD"] = Field(
        ..., description="Highest education level"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "experience": 6,
                "age": 32,
                "city": "Bangalore",
                "education": "BTech",
            }
        }
    }


class PredictResponse(BaseModel):
    predicted_salary: float
    currency:         str = "INR"
    input_received:   PredictRequest


class HealthResponse(BaseModel):
    status:       str
    model_loaded: bool
    model_r2:     float | None
    model_mae:    float | None


class ModelInfoResponse(BaseModel):
    """Exposed so frontend can prove this is ML, not if/else."""
    model_type:   str
    library:      str = "scikit-learn"
    metrics:      dict
    api_docs_url: str
