from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.drift import DriftReport
from app.models.user import User
from app.schemas.schemas import DriftReportResponse
from app.dependencies import get_current_user
from app.services.monitoring_service import MonitoringService

router = APIRouter()


@router.get("/drift/reports", response_model=List[DriftReportResponse])
async def get_drift_reports(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(DriftReport).order_by(DriftReport.created_at.desc()).limit(limit).all()


@router.post("/drift/run")
async def run_drift_check(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = MonitoringService(db)
    report = service.run_data_drift()
    return {"status": "completed", "drift_detected": report.get("drift_detected", False), "report": report}


@router.get("/model/metrics")
async def get_model_metrics(current_user: User = Depends(get_current_user)):
    service = MonitoringService(None)
    return service.get_latest_metrics()
