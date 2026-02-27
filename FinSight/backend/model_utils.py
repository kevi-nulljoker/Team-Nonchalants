from __future__ import annotations

import os
from pathlib import Path

import joblib

BASE_DIR = Path(__file__).resolve().parent

CANDIDATE_MODELS = [
    BASE_DIR / "expense_classifier.pkl",
    BASE_DIR / "expense_classifier (1).pkl",
]

MODEL_PATH = next((path for path in CANDIDATE_MODELS if path.exists()), None)
if MODEL_PATH is None:
    available = ", ".join(path.name for path in CANDIDATE_MODELS)
    raise FileNotFoundError(f"No model file found. Expected one of: {available}")

# Safety check
resolved_base = BASE_DIR.resolve()
resolved_model = MODEL_PATH.resolve()
if resolved_base not in resolved_model.parents and resolved_model != resolved_base:
    raise RuntimeError("Unsafe model path detected")

model = joblib.load(str(resolved_model))

def predict_transaction(description: str) -> dict:
    prediction = model.predict([description])[0]
    confidence = None
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba([description])[0]
        confidence = float(max(probs))
    return {
        "category": str(prediction),
        "confidence": round(confidence, 3) if confidence is not None else None,
    }