"""
End-to-end ML training pipeline.
Usage: python -m ml.pipelines.training_pipeline
"""
import json
import logging
import os
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, classification_report, f1_score,
    precision_score, recall_score, roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Optional heavy deps
try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

try:
    import lightgbm as lgb
    HAS_LGB = True
except ImportError:
    HAS_LGB = False

try:
    from imblearn.over_sampling import SMOTE
    HAS_SMOTE = True
except ImportError:
    HAS_SMOTE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

ROOT = Path(__file__).parents[2]
DATA_PATH = ROOT / "datasets" / "synthetic" / "generated_churn_dataset.csv"
ARTIFACTS_DIR = ROOT / "ml" / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

NUMERIC_FEATURES = [
    "age", "tenure_months", "monthly_charges", "total_spending",
    "login_frequency", "feature_usage_count", "session_time_avg",
    "last_login_days", "support_tickets", "complaint_count",
    "customer_satisfaction", "nps_score", "inactive_days",
]
CATEGORICAL_FEATURES = ["contract_type", "payment_method", "subscription_type", "gender", "region"]
TARGET = "churn_label"


def load_and_prepare(path: Path) -> tuple[pd.DataFrame, pd.Series]:
    logger.info(f"Loading data from {path}")
    df = pd.read_csv(path)
    logger.info(f"Shape: {df.shape}, churn rate: {df[TARGET].mean():.2%}")

    # Impute numerics
    for col in NUMERIC_FEATURES:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())

    # Feature engineering
    df["avg_monthly_charge"] = df["total_spending"] / df["tenure_months"].clip(1)

    # One-hot encode
    df_enc = pd.get_dummies(df, columns=CATEGORICAL_FEATURES, drop_first=False)

    feature_cols = [c for c in df_enc.columns if c not in [TARGET, "customer_id", "risk_score", "predicted_ltv"]]
    X = df_enc[feature_cols].fillna(0).astype(float)
    y = df_enc[TARGET].astype(int)

    return X, y, feature_cols


def evaluate(model, X_test, y_test, name: str) -> dict:
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else y_pred

    metrics = {
        "model": name,
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "roc_auc": round(roc_auc_score(y_test, y_prob), 4),
        "f1": round(f1_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred), 4),
        "recall": round(recall_score(y_test, y_pred), 4),
    }
    logger.info(f"{name}: AUC={metrics['roc_auc']} F1={metrics['f1']} Recall={metrics['recall']}")
    return metrics


def train():
    if not DATA_PATH.exists():
        logger.error(f"Dataset not found at {DATA_PATH}. Run: python datasets/dataset_generator.py")
        sys.exit(1)

    X, y, feature_cols = load_and_prepare(DATA_PATH)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, stratify=y, random_state=42
    )
    logger.info(f"Train: {X_train.shape}, Test: {X_test.shape}")

    # SMOTE on training set only
    if HAS_SMOTE:
        sm = SMOTE(random_state=42)
        X_train_res, y_train_res = sm.fit_resample(X_train, y_train)
        logger.info(f"After SMOTE: {X_train_res.shape}, churn rate: {y_train_res.mean():.2%}")
    else:
        X_train_res, y_train_res = X_train, y_train
        logger.warning("imbalanced-learn not installed; skipping SMOTE")

    scaler = StandardScaler()
    X_train_sc = scaler.fit_transform(X_train_res)
    X_test_sc = scaler.transform(X_test)

    all_metrics = []
    best_model = None
    best_auc = 0.0

    # ── Random Forest ──────────────────────────────────────────────────────
    logger.info("Training Random Forest…")
    rf = RandomForestClassifier(n_estimators=200, max_depth=12, class_weight="balanced", random_state=42, n_jobs=-1)
    rf.fit(X_train_res, y_train_res)
    m = evaluate(rf, X_test, y_test, "RandomForest")
    all_metrics.append(m)
    if m["roc_auc"] > best_auc:
        best_auc, best_model = m["roc_auc"], rf

    # ── XGBoost ────────────────────────────────────────────────────────────
    if HAS_XGB:
        logger.info("Training XGBoost…")
        scale_pos = (y_train_res == 0).sum() / (y_train_res == 1).sum()
        xgb_m = xgb.XGBClassifier(n_estimators=300, max_depth=6, learning_rate=0.05,
                                    scale_pos_weight=scale_pos, use_label_encoder=False,
                                    eval_metric="logloss", random_state=42, n_jobs=-1)
        xgb_m.fit(X_train_sc, y_train_res)
        m = evaluate(xgb_m, X_test_sc, y_test, "XGBoost")
        all_metrics.append(m)
        if m["roc_auc"] > best_auc:
            best_auc, best_model = m["roc_auc"], xgb_m

    # ── LightGBM ───────────────────────────────────────────────────────────
    if HAS_LGB:
        logger.info("Training LightGBM…")
        lgb_m = lgb.LGBMClassifier(n_estimators=300, learning_rate=0.05,
                                    class_weight="balanced", random_state=42, n_jobs=-1, verbose=-1)
        lgb_m.fit(X_train_sc, y_train_res)
        m = evaluate(lgb_m, X_test_sc, y_test, "LightGBM")
        all_metrics.append(m)
        if m["roc_auc"] > best_auc:
            best_auc, best_model = m["roc_auc"], lgb_m

    # ── Logistic Regression ────────────────────────────────────────────────
    logger.info("Training Logistic Regression…")
    lr = LogisticRegression(max_iter=500, class_weight="balanced", random_state=42)
    lr.fit(X_train_sc, y_train_res)
    m = evaluate(lr, X_test_sc, y_test, "LogisticRegression")
    all_metrics.append(m)
    if m["roc_auc"] > best_auc:
        best_auc, best_model = m["roc_auc"], lr

    # ── Save best model ────────────────────────────────────────────────────
    logger.info(f"Best model AUC: {best_auc:.4f}")

    model_path = ARTIFACTS_DIR / "model.pkl"
    scaler_path = ARTIFACTS_DIR / "scaler.pkl"
    cols_path = ARTIFACTS_DIR / "feature_columns.json"
    metrics_path = ARTIFACTS_DIR / "metrics.json"

    joblib.dump(best_model, model_path)
    joblib.dump(scaler, scaler_path)

    with open(cols_path, "w") as f:
        json.dump(feature_cols, f, indent=2)

    best_metrics = max(all_metrics, key=lambda x: x["roc_auc"])
    best_metrics["model_version"] = "1.0.0"
    with open(metrics_path, "w") as f:
        json.dump(best_metrics, f, indent=2)

    logger.info(f"Artifacts saved to {ARTIFACTS_DIR}")
    logger.info("Training complete!")
    return best_metrics


if __name__ == "__main__":
    train()
