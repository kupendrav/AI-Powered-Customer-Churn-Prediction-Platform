"""
ML unit tests.
Run: pytest tests/ml/ -v
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../"))

import numpy as np
import pandas as pd
import pytest


class TestDatasetGenerator:
    def test_generates_correct_shape(self):
        from datasets.dataset_generator import generate
        df = generate()
        assert len(df) >= 100_000
        assert "churn_label" in df.columns
        assert "customer_id" in df.columns

    def test_churn_rate_realistic(self):
        from datasets.dataset_generator import generate
        df = generate()
        rate = df["churn_label"].mean()
        assert 0.15 <= rate <= 0.40, f"Churn rate {rate:.2%} outside expected range"

    def test_no_duplicate_customer_ids(self):
        from datasets.dataset_generator import generate
        df = generate()
        assert df["customer_id"].nunique() == len(df)


class TestPredictionService:
    def test_heuristic_high_risk(self):
        from backend.app.services.prediction_service import PredictionService
        svc = PredictionService()
        result = svc.predict_single({
            "customer_id": "TEST001",
            "contract_type": "Month-to-month",
            "tenure_months": 2,
            "support_tickets": 6,
            "customer_satisfaction": 1.5,
            "last_login_days": 45,
        })
        assert result["churn_probability"] >= 0.5
        assert result["risk_category"] in ("medium", "high")

    def test_heuristic_low_risk(self):
        from backend.app.services.prediction_service import PredictionService
        svc = PredictionService()
        result = svc.predict_single({
            "customer_id": "TEST002",
            "contract_type": "Two year",
            "tenure_months": 48,
            "support_tickets": 0,
            "customer_satisfaction": 4.8,
            "last_login_days": 2,
        })
        assert result["churn_probability"] <= 0.5
        assert result["risk_category"] == "low"
