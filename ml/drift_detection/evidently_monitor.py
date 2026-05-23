"""
Data and concept drift monitoring using Evidently AI.
Usage: python -m ml.drift_detection.evidently_monitor
"""
import json
import logging
from pathlib import Path
from typing import Optional

import pandas as pd

logger = logging.getLogger(__name__)
ROOT = Path(__file__).parents[2]
DATA_PATH = ROOT / "datasets" / "synthetic" / "generated_churn_dataset.csv"
REPORTS_DIR = ROOT / "monitoring" / "evidently" / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

NUMERIC_COLS = [
    "age", "tenure_months", "monthly_charges", "total_spending",
    "login_frequency", "support_tickets", "customer_satisfaction",
    "nps_score", "last_login_days",
]
TARGET = "churn_label"


def run_data_drift_report(
    reference: pd.DataFrame,
    current: pd.DataFrame,
    output_path: Optional[Path] = None,
) -> dict:
    try:
        from evidently.report import Report
        from evidently.metric_preset import DataDriftPreset

        report = Report(metrics=[DataDriftPreset()])
        report.run(reference_data=reference[NUMERIC_COLS + [TARGET]],
                   current_data=current[NUMERIC_COLS + [TARGET]])

        if output_path:
            report.save_html(str(output_path))
            logger.info(f"Drift report saved to {output_path}")

        result = report.as_dict()
        drift_detected = any(
            m.get("result", {}).get("drift_detected", False)
            for m in result.get("metrics", [])
        )
        return {"drift_detected": drift_detected, "details": result}
    except ImportError:
        logger.warning("evidently not installed; returning stub report")
        return {"drift_detected": False, "note": "evidently not available"}
    except Exception as e:
        logger.error(f"Drift report failed: {e}")
        return {"drift_detected": False, "error": str(e)}


def run_from_file():
    if not DATA_PATH.exists():
        logger.error("Dataset not found. Run dataset_generator.py first.")
        return

    df = pd.read_csv(DATA_PATH).dropna(subset=NUMERIC_COLS[:3])
    split = int(len(df) * 0.7)
    reference = df.iloc[:split]
    current = df.iloc[split:]

    out = REPORTS_DIR / "data_drift_report.html"
    result = run_data_drift_report(reference, current, out)
    print(json.dumps({"drift_detected": result["drift_detected"]}, indent=2))


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_from_file()
