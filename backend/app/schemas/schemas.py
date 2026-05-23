from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole


# ── Auth ──────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str


# ── User ──────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.analyst


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime


# ── Prediction ────────────────────────────────────────────────────────────────
class PredictionRequest(BaseModel):
    customer_id: str
    age: Optional[int] = None
    gender: Optional[str] = None
    region: Optional[str] = None
    subscription_type: Optional[str] = None
    contract_type: Optional[str] = None
    tenure_months: Optional[int] = None
    monthly_charges: Optional[float] = None
    total_spending: Optional[float] = None
    payment_method: Optional[str] = None
    login_frequency: Optional[float] = None
    feature_usage_count: Optional[int] = None
    session_time_avg: Optional[float] = None
    last_login_days: Optional[int] = None
    support_tickets: Optional[int] = None
    complaint_count: Optional[int] = None
    customer_satisfaction: Optional[float] = None
    nps_score: Optional[int] = None


class PredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    customer_id: str
    churn_probability: float
    risk_score: float
    risk_category: str
    top_risk_factors: list
    model_version: str


# ── Recommendation ────────────────────────────────────────────────────────────
class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    customer_id: str
    strategy: str
    rationale: str
    priority: str
    estimated_revenue_saved: Optional[float]
    estimated_churn_reduction: Optional[float]
    action_items: Optional[list]
    status: str
    created_at: datetime


# ── Analytics ─────────────────────────────────────────────────────────────────
class KPIResponse(BaseModel):
    total_customers: int
    churn_rate: float
    at_risk_customers: int
    mrr_at_risk: float
    avg_clv: float
    avg_nps: float
    monthly_churn_trend: list
    risk_high: int
    risk_medium: int
    risk_low: int


# ── Drift ─────────────────────────────────────────────────────────────────────
class DriftReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    report_type: str
    feature_name: Optional[str]
    drift_score: Optional[float]
    drift_detected: bool
    created_at: datetime
