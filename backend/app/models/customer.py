from sqlalchemy import Column, String, Float, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base, TimestampMixin


class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(String(50), unique=True, nullable=False, index=True)

    # Demographics
    age = Column(Integer)
    gender = Column(String(20))
    region = Column(String(50))

    # Subscription
    subscription_type = Column(String(50))
    contract_type = Column(String(50))
    tenure_months = Column(Integer)
    monthly_charges = Column(Float)
    total_spending = Column(Float)
    payment_method = Column(String(50))

    # Usage
    login_frequency = Column(Float)
    feature_usage_count = Column(Integer)
    session_time_avg = Column(Float)
    last_login_days = Column(Integer)
    email_open_rate = Column(Float)
    inactive_days = Column(Integer)

    # Support
    support_tickets = Column(Integer)
    complaint_count = Column(Integer)
    refund_requests = Column(Integer)

    # Satisfaction
    customer_satisfaction = Column(Float)
    nps_score = Column(Integer)

    # Computed
    predicted_ltv = Column(Float)
    risk_score = Column(Float)
    churn_label = Column(Boolean)
