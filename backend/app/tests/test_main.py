"""
Backend unit tests.
Run: pytest app/tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from uuid import uuid4

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.customer import Customer
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation

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


def override_current_user():
    return User(
        id=uuid4(),
        email="test@churn.ai",
        full_name="Test User",
        role=UserRole.admin.value,
        is_active=True,
    )


app.dependency_overrides[get_current_user] = override_current_user


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    admin = User(
        id=uuid4(),
        email="test@churn.ai",
        full_name="Test User",
        role=UserRole.admin.value,
    )
    db.add(admin)
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def get_token():
    return "test-insforge-access-token"


class TestHealth:
    def test_health(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "healthy"


class TestAuth:
    def test_login_is_retired(self):
        r = client.post("/v1/auth/login", json={"email": "test@churn.ai", "password": "testpass"})
        assert r.status_code == 410

    def test_register_is_retired(self):
        r = client.post("/v1/auth/register", json={
            "email": "new@churn.ai", "full_name": "New User", "password": "pass123"
        })
        assert r.status_code == 410

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


class TestUpload:
    def test_upload_parses_false_string_as_false(self):
        token = get_token()
        csv = "customer_id,monthly_charges,churn_label\nC001,10.0,False\n"
        r = client.post(
            "/v1/upload/churn-data",
            files={"file": ("customers.csv", csv, "text/csv")},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200

        db = TestingSessionLocal()
        customer = db.query(Customer).filter(Customer.customer_id == "C001").first()
        db.close()
        assert customer is not None
        assert customer.churn_label is False

    def test_upload_rejects_invalid_boolean(self):
        token = get_token()
        csv = "customer_id,monthly_charges,churn_label\nC002,10.0,maybe\n"
        r = client.post(
            "/v1/upload/churn-data",
            files={"file": ("customers.csv", csv, "text/csv")},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 422


class TestRecommendations:
    def test_generate_recommendations_deduplicates_and_uses_probability(self):
        token = get_token()
        db = TestingSessionLocal()
        db.add(Customer(
            customer_id="REC001",
            contract_type="Month-to-month",
            monthly_charges=100.0,
            predicted_ltv=1000.0,
        ))
        db.add(Prediction(
            customer_id="REC001",
            model_version="test",
            churn_probability=0.8,
            risk_score=0.8,
            risk_category="high",
        ))
        db.commit()
        db.close()

        for _ in range(2):
            r = client.post(
                "/v1/recommendations/generate/REC001",
                headers={"Authorization": f"Bearer {token}"},
            )
            assert r.status_code == 200

        db = TestingSessionLocal()
        recs = db.query(Recommendation).filter(Recommendation.customer_id == "REC001").all()
        db.close()
        assert len(recs) == 1
        assert recs[0].estimated_revenue_saved == 200.0
