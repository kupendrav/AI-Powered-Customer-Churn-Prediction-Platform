"""
Run once to create tables and seed default admin user.
Usage: python -m app.db.init_db
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../"))

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models import user, customer, prediction, recommendation, drift  # noqa: F401
from app.models.user import User, UserRole
from app.core.security import hash_password


def init():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@churn.ai").first():
            admin = User(
                email="admin@churn.ai",
                full_name="Admin User",
                password_hash=hash_password("admin123"),
                role=UserRole.admin,
            )
            db.add(admin)

        if not db.query(User).filter(User.email == "analyst@churn.ai").first():
            analyst = User(
                email="analyst@churn.ai",
                full_name="Analyst User",
                password_hash=hash_password("analyst123"),
                role=UserRole.analyst,
            )
            db.add(analyst)

        db.commit()
        print("Database initialised. Default users created.")
    finally:
        db.close()


if __name__ == "__main__":
    init()
