from sqlalchemy import Column, String, Float, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base, TimestampMixin


class Recommendation(Base, TimestampMixin):
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(String(50), nullable=False, index=True)
    strategy = Column(String(255), nullable=False)
    rationale = Column(String(1024))
    priority = Column(String(20))         # high / medium / low
    estimated_revenue_saved = Column(Float)
    estimated_churn_reduction = Column(Float)
    action_items = Column(JSON)
    status = Column(String(20), default="pending")
