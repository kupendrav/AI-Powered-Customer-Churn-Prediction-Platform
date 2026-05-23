from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io

from app.db.session import get_db
from app.models.user import User
from app.models.prediction import Prediction
from app.schemas.schemas import PredictionRequest, PredictionResponse
from app.dependencies import get_current_user
from app.services.prediction_service import PredictionService

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_single(
    payload: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = PredictionService()
    result = service.predict_single(payload.model_dump())

    prediction = Prediction(
        customer_id=payload.customer_id,
        model_version=result["model_version"],
        churn_probability=result["churn_probability"],
        risk_score=result["risk_score"],
        risk_category=result["risk_category"],
        shap_values=result.get("shap_values"),
        top_risk_factors=result.get("top_risk_factors"),
    )
    db.add(prediction)
    db.commit()
    return result


@router.post("/predict/batch", response_model=List[PredictionResponse])
async def predict_batch(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    content = await file.read()
    df = pd.read_csv(io.StringIO(content.decode("utf-8")))

    service = PredictionService()
    results = service.predict_batch(df)

    for r in results:
        db.add(Prediction(
            customer_id=r["customer_id"],
            model_version=r["model_version"],
            churn_probability=r["churn_probability"],
            risk_score=r["risk_score"],
            risk_category=r["risk_category"],
            top_risk_factors=r.get("top_risk_factors"),
        ))
    db.commit()
    return results


@router.get("/explain/{customer_id}")
async def explain_prediction(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pred = (
        db.query(Prediction)
        .filter(Prediction.customer_id == customer_id)
        .order_by(Prediction.created_at.desc())
        .first()
    )
    if not pred:
        raise HTTPException(status_code=404, detail="No prediction found for this customer")

    return {
        "customer_id": customer_id,
        "churn_probability": pred.churn_probability,
        "shap_values": pred.shap_values,
        "top_risk_factors": pred.top_risk_factors,
        "model_version": pred.model_version,
    }
