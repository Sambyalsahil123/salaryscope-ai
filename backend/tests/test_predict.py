"""
Basic API tests — run with: pytest tests/
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True


def test_predict_valid():
    res = client.post("/predict", json={
        "experience": 6,
        "age":        32,
        "city":       "Bangalore",
        "education":  "BTech",
    })
    assert res.status_code == 200
    data = res.json()
    assert "predicted_salary" in data
    assert data["predicted_salary"] > 0


def test_predict_invalid_city():
    res = client.post("/predict", json={
        "experience": 6,
        "age":        32,
        "city":       "Patna",   # not in allowed list
        "education":  "BTech",
    })
    assert res.status_code == 422  # Validation error


def test_predict_negative_experience():
    res = client.post("/predict", json={
        "experience": -1,         # invalid — must be > 0
        "age":        25,
        "city":       "Delhi",
        "education":  "BTech",
    })
    assert res.status_code == 422
