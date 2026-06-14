import os
from io import StringIO

import pandas as pd
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.auth import get_current_user
from app.auth_routes import router as auth_router
from app.database import Base, engine
from app.explain import generate_alert_explanation
from app.models import User
from app.predict import predict_batch

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173",
    ).split(",")
    if origin.strip()
]

app = FastAPI(
    title="AML Fraud Detection API",
    description="API pentru detectarea tranzactiilor suspecte folosind XGBoost",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "AML Fraud Detection API is running",
    }


@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "model": "XGBoost",
        "service": "AML Fraud Detection",
    }


@app.post("/predict-batch")
async def predict_batch_endpoint(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Fisierul trebuie sa fie in format CSV.",
        )

    try:
        contents = await file.read()
        decoded = contents.decode("utf-8")
        df = pd.read_csv(StringIO(decoded))

        summary, alerts = predict_batch(df)

        return {
            "summary": summary,
            "alerts": alerts.to_dict(orient="records"),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@app.post("/explain-alert")
async def explain_alert(
    alert: dict,
    current_user: User = Depends(get_current_user),
):
    try:
        explanation = generate_alert_explanation(alert)

        return {
            "explanation": explanation,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
