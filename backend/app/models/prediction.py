from sqlalchemy import Column, String, Float, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base, TimestampMixin


class Prediction(Base, TimestampMixin):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(String(50), nullable=False, index=True)
    model_version = Column(String(50), nullable=False)
    churn_probability = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_category = Column(String(20), nullable=False)  # low / medium / high
    shap_values = Column(JSON)
    top_risk_factors = Column(JSON)
