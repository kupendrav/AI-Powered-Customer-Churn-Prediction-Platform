from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.db.base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"
    viewer = "viewer"


class User(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.analyst.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
