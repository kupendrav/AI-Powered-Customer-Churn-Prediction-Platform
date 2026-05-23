from sqlalchemy import Column, String, Float, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base, TimestampMixin


class DriftReport(Base, TimestampMixin):
    __tablename__ = "drift_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_type = Column(String(50), nullable=False)   # data_drift / concept_drift
    feature_name = Column(String(100))
    drift_score = Column(Float)
    drift_detected = Column(Boolean, default=False)
    test_name = Column(String(100))
    report_data = Column(JSON)
    model_version = Column(String(50))
