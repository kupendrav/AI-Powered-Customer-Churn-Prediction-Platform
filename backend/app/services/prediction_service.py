import os
import json
import logging
import numpy as np
import pandas as pd
import joblib
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

ARTIFACTS_PATH = os.environ.get("ML_ARTIFACTS_PATH", "./ml_artifacts")
if not os.path.exists(ARTIFACTS_PATH) and os.path.exists("./ml/artifacts"):
    ARTIFACTS_PATH = "./ml/artifacts"
MODEL_VERSION = "1.0.0"

FEATURE_COLUMNS = [
    "age", "tenure_months", "monthly_charges", "total_spending",
    "login_frequency", "feature_usage_count", "session_time_avg",
    "last_login_days", "support_tickets", "complaint_count",
    "customer_satisfaction", "nps_score", "inactive_days",
    "contract_type_Month-to-month", "contract_type_One year", "contract_type_Two year",
    "payment_method_Bank transfer", "payment_method_Credit card",
    "payment_method_Electronic check", "payment_method_Mailed check",
    "subscription_type_Basic", "subscription_type_Premium", "subscription_type_Standard",
    "gender_Female", "gender_Male",
    "avg_monthly_charge",
]

FEATURE_COLUMNS_PATH = os.path.join(ARTIFACTS_PATH, "feature_columns.json")
if os.path.exists(FEATURE_COLUMNS_PATH):
    with open(FEATURE_COLUMNS_PATH) as f:
        FEATURE_COLUMNS = json.load(f)


def _safe_float(val, default=0.0):
    try:
        v = float(val)
        return default if np.isnan(v) else v
    except (TypeError, ValueError):
        return default


class PredictionService:
    def __init__(self):
        self._model = None
        self._scaler = None

    def _load_artifacts(self):
        model_path = os.path.join(ARTIFACTS_PATH, "model.pkl")
        scaler_path = os.path.join(ARTIFACTS_PATH, "scaler.pkl")
        if os.path.exists(model_path):
            self._model = joblib.load(model_path)
        if os.path.exists(scaler_path):
            self._scaler = joblib.load(scaler_path)

    def _engineer_features(self, data: Dict[str, Any]) -> pd.DataFrame:
        tenure = _safe_float(data.get("tenure_months"), 1)
        total = _safe_float(data.get("total_spending"))
        monthly = _safe_float(data.get("monthly_charges"))

        row: Dict[str, float] = {
            "age": _safe_float(data.get("age"), 35),
            "tenure_months": tenure,
            "monthly_charges": monthly,
            "total_spending": total,
            "discount_usage": _safe_float(data.get("discount_usage"), 0),
            "plan_upgrades": _safe_float(data.get("plan_upgrades"), 0),
            "plan_downgrades": _safe_float(data.get("plan_downgrades"), 0),
            "login_frequency": _safe_float(data.get("login_frequency"), 3.0),
            "feature_usage_count": _safe_float(data.get("feature_usage_count"), 5),
            "session_time_avg": _safe_float(data.get("session_time_avg"), 20),
            "last_login_days": _safe_float(data.get("last_login_days"), 7),
            "email_open_rate": _safe_float(data.get("email_open_rate"), 0.3),
            "offer_response_rate": _safe_float(data.get("offer_response_rate"), 0.1),
            "inactive_days": _safe_float(data.get("inactive_days"), 3),
            "support_tickets": _safe_float(data.get("support_tickets"), 0),
            "complaint_count": _safe_float(data.get("complaint_count"), 0),
            "refund_requests": _safe_float(data.get("refund_requests"), 0),
            "app_crashes": _safe_float(data.get("app_crashes"), 0),
            "network_issues": _safe_float(data.get("network_issues"), 0),
            "service_interruptions": _safe_float(data.get("service_interruptions"), 0),
            "competitor_interactions": _safe_float(data.get("competitor_interactions"), 0),
            "customer_satisfaction": _safe_float(data.get("customer_satisfaction"), 3.5),
            "nps_score": _safe_float(data.get("nps_score"), 6),
            "avg_monthly_charge": total / tenure if tenure > 0 else monthly,
        }

        # One-hot: contract_type
        ct = str(data.get("contract_type", "Month-to-month"))
        row["contract_type_Month-to-month"] = 1.0 if ct == "Month-to-month" else 0.0
        row["contract_type_One year"] = 1.0 if ct == "One year" else 0.0
        row["contract_type_Two year"] = 1.0 if ct == "Two year" else 0.0

        # One-hot: payment_method
        pm = str(data.get("payment_method", "Electronic check"))
        row["payment_method_Bank transfer"] = 1.0 if pm == "Bank transfer" else 0.0
        row["payment_method_Credit card"] = 1.0 if pm == "Credit card" else 0.0
        row["payment_method_Electronic check"] = 1.0 if pm == "Electronic check" else 0.0
        row["payment_method_Mailed check"] = 1.0 if pm == "Mailed check" else 0.0

        # One-hot: subscription_type
        st = str(data.get("subscription_type", "Basic"))
        row["subscription_type_Basic"] = 1.0 if st == "Basic" else 0.0
        row["subscription_type_Premium"] = 1.0 if st == "Premium" else 0.0
        row["subscription_type_Standard"] = 1.0 if st == "Standard" else 0.0

        # One-hot: gender
        g = str(data.get("gender", "Male"))
        row["gender_Female"] = 1.0 if g == "Female" else 0.0
        row["gender_Male"] = 1.0 if g == "Male" else 0.0
        row["gender_Other"] = 1.0 if g == "Other" else 0.0

        region = str(data.get("region", "East"))
        for value in ("Central", "East", "North", "South", "West"):
            row[f"region_{value}"] = 1.0 if region == value else 0.0

        return pd.DataFrame([{col: row.get(col, 0.0) for col in FEATURE_COLUMNS}])

    def _heuristic_predict(self, data: Dict[str, Any]) -> float:
        """Fallback when no trained model is available."""
        score = 0.2
        if str(data.get("contract_type", "")) == "Month-to-month":
            score += 0.25
        if _safe_float(data.get("tenure_months"), 12) < 6:
            score += 0.15
        if _safe_float(data.get("support_tickets"), 0) >= 3:
            score += 0.15
        if _safe_float(data.get("customer_satisfaction"), 3.5) < 2.5:
            score += 0.15
        if _safe_float(data.get("last_login_days"), 7) > 30:
            score += 0.10
        return min(score, 0.99)

    def _top_risk_factors(self, data: Dict[str, Any], prob: float) -> List[Dict]:
        factors = []
        if str(data.get("contract_type", "")) == "Month-to-month":
            factors.append({"factor": "Month-to-month contract", "impact": "high", "direction": "increases_risk"})
        if _safe_float(data.get("tenure_months"), 12) < 6:
            factors.append({"factor": "Short tenure (< 6 months)", "impact": "high", "direction": "increases_risk"})
        if _safe_float(data.get("support_tickets"), 0) >= 3:
            factors.append({"factor": "High support ticket volume", "impact": "medium", "direction": "increases_risk"})
        if _safe_float(data.get("customer_satisfaction"), 3.5) < 2.5:
            factors.append({"factor": "Low satisfaction score", "impact": "high", "direction": "increases_risk"})
        if _safe_float(data.get("last_login_days"), 7) > 30:
            factors.append({"factor": "Inactive for 30+ days", "impact": "medium", "direction": "increases_risk"})
        return factors[:5]

    def predict_single(self, data: Dict[str, Any]) -> Dict[str, Any]:
        if self._model is None:
            self._load_artifacts()

        if self._model is not None:
            try:
                df = self._engineer_features(data)
                if self._scaler:
                    arr = self._scaler.transform(df)
                else:
                    arr = df.values
                prob = float(self._model.predict_proba(arr)[0][1])
            except Exception as exc:
                logger.warning(f"Model inference failed: {exc}; using heuristic")
                prob = self._heuristic_predict(data)
        else:
            prob = self._heuristic_predict(data)

        if prob >= 0.7:
            category = "high"
        elif prob >= 0.4:
            category = "medium"
        else:
            category = "low"

        return {
            "customer_id": data.get("customer_id", "unknown"),
            "churn_probability": round(prob, 4),
            "risk_score": round(prob, 4),
            "risk_category": category,
            "top_risk_factors": self._top_risk_factors(data, prob),
            "model_version": MODEL_VERSION,
        }

    def predict_batch(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        return [self.predict_single(row.to_dict()) for _, row in df.iterrows()]
