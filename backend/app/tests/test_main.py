"""
Backend unit tests.
Run: pytest app/tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User, UserRole
from app.core.security import hash_password

SQLALCHEMY_TEST_URL = "sqlite://"
engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    admin = User(
        email="test@churn.ai",
        full_name="Test User",
        password_hash=hash_password("testpass"),
        role=UserRole.admin,
    )
    db.add(admin)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def get_token():
    r = client.post("/v1/auth/login", json={"email": "test@churn.ai", "password": "testpass"})
    return r.json()["access_token"]


class TestHealth:
    def test_health(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"


class TestAuth:
    def test_login_success(self):
        r = client.post("/v1/auth/login", json={"email": "test@churn.ai", "password": "testpass"})
        assert r.status_code == 200
        assert "access_token" in r.json()

    def test_login_wrong_password(self):
        r = client.post("/v1/auth/login", json={"email": "test@churn.ai", "password": "wrong"})
        assert r.status_code == 401

    def test_login_wrong_email(self):
        r = client.post("/v1/auth/login", json={"email": "nobody@churn.ai", "password": "testpass"})
        assert r.status_code == 401

    def test_register(self):
        r = client.post("/v1/auth/register", json={
            "email": "new@churn.ai", "full_name": "New User", "password": "pass123"
        })
        assert r.status_code == 201

    def test_get_me(self):
        token = get_token()
        r = client.get("/v1/users/me", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200
        assert r.json()["email"] == "test@churn.ai"


class TestPredictions:
    def test_predict_single(self):
        token = get_token()
        payload = {
            "customer_id": "TEST001",
            "contract_type": "Month-to-month",
            "tenure_months": 3,
            "monthly_charges": 75.0,
            "support_tickets": 5,
            "customer_satisfaction": 2.0,
        }
        r = client.post("/v1/predictions/predict", json=payload,
                        headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200
        data = r.json()
        assert "churn_probability" in data
        assert 0.0 <= data["churn_probability"] <= 1.0
        assert data["risk_category"] in ("low", "medium", "high")


class TestAnalytics:
    def test_kpis(self):
        token = get_token()
        r = client.get("/v1/analytics/kpis", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200
        data = r.json()
        assert "total_customers" in data
        assert "churn_rate" in data
