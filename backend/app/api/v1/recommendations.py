from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.schemas import RecommendationResponse
from app.dependencies import get_current_user
from app.services.recommendation_service import RecommendationService

router = APIRouter()


@router.get("/{customer_id}", response_model=List[RecommendationResponse])
async def get_recommendations(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.customer_id == customer_id)
        .order_by(Recommendation.created_at.desc())
        .limit(5)
        .all()
    )
    return recs


@router.post("/generate/{customer_id}", response_model=List[RecommendationResponse])
async def generate_recommendations(
    customer_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RecommendationService(db)
    recs = service.generate(customer_id)
    if not recs:
        raise HTTPException(status_code=404, detail="Customer not found or no prediction available")
    return recs


@router.get("/high-risk/list")
async def get_high_risk_recommendations(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recs = (
        db.query(Recommendation)
        .filter(Recommendation.priority == "high")
        .order_by(Recommendation.estimated_revenue_saved.desc())
        .limit(limit)
        .all()
    )
    return recs
