from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Integer, case

from app.db.session import get_db
from app.models.customer import Customer
from app.models.user import User
from app.schemas.schemas import KPIResponse
from app.dependencies import get_current_user

router = APIRouter()


def _risk_expr():
    return case(
        (Customer.risk_score.isnot(None), Customer.risk_score),
        (Customer.churn_label.is_(True), 0.9),
        else_=0.1,
    )


@router.get("/kpis", response_model=KPIResponse)
async def get_kpis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    risk_expr = _risk_expr()
    base = db.query(
        func.count(Customer.id).label("total"),
        func.count(Customer.id).filter(Customer.churn_label == True).label("churned"),
        func.count(Customer.id).filter(risk_expr >= 0.7).label("risk_high"),
        func.count(Customer.id).filter(risk_expr >= 0.4, risk_expr < 0.7).label("risk_medium"),
        func.sum(Customer.monthly_charges).filter(risk_expr >= 0.7).label("mrr_at_risk"),
        func.avg(Customer.predicted_ltv).label("avg_clv"),
        func.avg(Customer.nps_score).label("avg_nps"),
    ).one()
    total = base.total or 0
    churned = base.churned or 0
    churn_rate = round(churned / total * 100, 2) if total else 0.0
    risk_high = base.risk_high or 0
    risk_medium = base.risk_medium or 0
    risk_low = max(total - risk_high - risk_medium, 0)
    mrr_at_risk = float(base.mrr_at_risk or 0)
    avg_clv = float(base.avg_clv or 0)
    avg_nps = float(base.avg_nps or 0)

    if db.bind and db.bind.dialect.name == "sqlite":
        month_expr = func.strftime("%Y-%m", Customer.created_at)
    else:
        month_expr = func.date_trunc("month", Customer.created_at)

    trend_rows = (
        db.query(month_expr.label("month"), func.avg(cast(Customer.churn_label, Integer)).label("rate"))
        .group_by("month")
        .order_by("month")
        .all()
    )
    monthly_churn_trend = [
        {
            "month": r[0].strftime("%b %Y") if hasattr(r[0], "strftime") else str(r[0] or "Unknown"),
            "churn_rate": round(float(r[1] or 0) * 100, 2),
        }
        for r in trend_rows
    ]

    return KPIResponse(
        total_customers=total,
        churn_rate=churn_rate,
        at_risk_customers=at_risk,
        mrr_at_risk=round(float(mrr_at_risk), 2),
        avg_clv=round(float(avg_clv), 2),
        avg_nps=round(float(avg_nps), 2),
        monthly_churn_trend=monthly_churn_trend,
        risk_high=risk_high,
        risk_medium=risk_medium,
        risk_low=risk_low,
    )


@router.get("/churn-by-segment")
async def churn_by_segment(
    segment: str = "contract_type",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed = {"contract_type", "subscription_type", "region", "payment_method"}
    if segment not in allowed:
        segment = "contract_type"

    col = getattr(Customer, segment)
    segment_col = func.coalesce(col, "Unknown")
    rows = (
        db.query(segment_col, func.count(Customer.id), func.avg(cast(Customer.churn_label, Integer)))
        .group_by(segment_col)
        .all()
    )
    return [
        {"segment": r[0], "count": r[1], "churn_rate": round(float(r[2] or 0) * 100, 2)}
        for r in rows
    ]


@router.get("/customers")
async def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    risk_min: float = Query(0.0, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    risk_expr = _risk_expr()
    q = db.query(Customer).filter(risk_expr >= risk_min)
    total = q.count()
    customers = q.order_by(risk_expr.desc()).offset(skip).limit(limit).all()
    for customer in customers:
        if customer.risk_score is None:
            customer.risk_score = 0.9 if customer.churn_label else 0.1
    return {"total": total, "customers": customers}
