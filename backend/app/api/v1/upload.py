from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import io
import logging

from app.db.session import get_db
from app.models.customer import Customer
from app.models.user import User
from app.dependencies import require_analyst

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/churn-data")
async def upload_churn_data(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst),
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files accepted")

    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))

    required_cols = {"customer_id", "monthly_charges", "churn_label"}
    missing = required_cols - set(df.columns)
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing columns: {missing}")

    df["customer_id"] = df["customer_id"].astype(str)
    df = df.drop_duplicates(subset=["customer_id"])

    def to_int(value):
        if pd.isna(value):
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    def to_float(value):
        if pd.isna(value):
            return None
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    def to_str(value):
        if pd.isna(value):
            return None
        text = str(value).strip()
        return text or None

    def to_bool(value):
        if pd.isna(value):
            return None
        try:
            return bool(int(value))
        except (TypeError, ValueError):
            return bool(value)

    ids = df["customer_id"].tolist()
    existing_ids: set[str] = set()
    chunk_size = 1000
    for start in range(0, len(ids), chunk_size):
        chunk = ids[start:start + chunk_size]
        rows = db.query(Customer.customer_id).filter(Customer.customer_id.in_(chunk)).all()
        existing_ids.update(r[0] for r in rows)

    new_df = df[~df["customer_id"].isin(existing_ids)]
    customers = []
    for row in new_df.to_dict(orient="records"):
        customers.append(
            Customer(
                customer_id=to_str(row.get("customer_id")),
                age=to_int(row.get("age")),
                gender=to_str(row.get("gender")),
                region=to_str(row.get("region")),
                subscription_type=to_str(row.get("subscription_type")),
                contract_type=to_str(row.get("contract_type")),
                tenure_months=to_int(row.get("tenure_months")),
                monthly_charges=to_float(row.get("monthly_charges")) or 0.0,
                total_spending=to_float(row.get("total_spending")),
                payment_method=to_str(row.get("payment_method")),
                login_frequency=to_float(row.get("login_frequency")),
                feature_usage_count=to_int(row.get("feature_usage_count")),
                session_time_avg=to_float(row.get("session_time_avg")),
                last_login_days=to_int(row.get("last_login_days")),
                email_open_rate=to_float(row.get("email_open_rate")),
                inactive_days=to_int(row.get("inactive_days")),
                support_tickets=to_int(row.get("support_tickets")),
                complaint_count=to_int(row.get("complaint_count")),
                refund_requests=to_int(row.get("refund_requests")),
                customer_satisfaction=to_float(row.get("customer_satisfaction")),
                nps_score=to_int(row.get("nps_score")),
                churn_label=to_bool(row.get("churn_label")),
                risk_score=to_float(row.get("risk_score")),
                predicted_ltv=to_float(row.get("predicted_ltv")),
            )
        )

    if customers:
        db.bulk_save_objects(customers)
        db.commit()

    inserted = len(customers)
    logger.info(f"Uploaded {inserted} new customers from {file.filename}")
    return {"inserted": inserted, "total_rows": len(df), "filename": file.filename}
