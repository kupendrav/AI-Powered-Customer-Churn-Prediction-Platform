"""
SHAP-based explainability for churn predictions.
Usage: python -m ml.explainability.shap_analysis
"""
import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Any

import joblib
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

ROOT = Path(__file__).parents[2]
ARTIFACTS_DIR = ROOT / "ml" / "artifacts"


class ShapExplainer:
    def __init__(self):
        self._explainer = None
        self._model = None
        self._feature_cols: List[str] = []

    def _load(self):
        try:
            import shap
            model_path = ARTIFACTS_DIR / "model.pkl"
            cols_path = ARTIFACTS_DIR / "feature_columns.json"
            if model_path.exists():
                self._model = joblib.load(model_path)
                with open(cols_path) as f:
                    self._feature_cols = json.load(f)
                self._explainer = shap.TreeExplainer(self._model)
                logger.info("SHAP TreeExplainer loaded")
        except ImportError:
            logger.warning("shap not installed")
        except Exception as e:
            logger.warning(f"Could not load SHAP explainer: {e}")

    def explain(self, features: Dict[str, float]) -> Dict[str, Any]:
        if self._model is None:
            self._load()

        if self._explainer is None:
            return {"error": "Model not available for SHAP explanations"}

        try:
            import shap
            df = pd.DataFrame([features]).reindex(columns=self._feature_cols).fillna(0)
            sv = self._explainer.shap_values(df)
            if isinstance(sv, list):
                sv = sv[1]
            sv_flat = sv[0]
            top_idx = np.argsort(np.abs(sv_flat))[::-1][:10]
            top_factors = [
                {
                    "feature": self._feature_cols[i],
                    "shap_value": round(float(sv_flat[i]), 4),
                    "direction": "increases_risk" if sv_flat[i] > 0 else "decreases_risk",
                }
                for i in top_idx
            ]
            return {
                "top_factors": top_factors,
                "base_value": round(float(self._explainer.expected_value
                                          if not isinstance(self._explainer.expected_value, np.ndarray)
                                          else self._explainer.expected_value[1]), 4),
            }
        except Exception as e:
            logger.error(f"SHAP explanation failed: {e}")
            return {"error": str(e)}
