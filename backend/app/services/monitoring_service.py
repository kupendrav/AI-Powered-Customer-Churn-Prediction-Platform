import json
import logging
import os
from typing import Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)
METRICS_PATH = os.environ.get("ML_ARTIFACTS_PATH", "./ml_artifacts")


class MonitoringService:
    def __init__(self, db: Optional[Session]):
        self.db = db

    def run_data_drift(self) -> dict:
        """Stub: in production, compare live data to training reference with Evidently."""
        return {
            "drift_detected": False,
            "features_checked": 15,
            "features_drifted": 0,
            "summary": "No significant drift detected in current batch.",
        }

    def get_latest_metrics(self) -> dict:
        metrics_file = os.path.join(METRICS_PATH, "metrics.json")
        if os.path.exists(metrics_file):
            with open(metrics_file) as f:
                return json.load(f)
        return {
            "accuracy": None,
            "roc_auc": None,
            "f1": None,
            "precision": None,
            "recall": None,
            "model_version": "not_trained",
            "note": "Train the model first: python -m ml.pipelines.training_pipeline",
        }
