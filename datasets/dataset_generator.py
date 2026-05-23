"""
Synthetic churn dataset generator (≥100,000 rows).
Usage: python datasets/dataset_generator.py
"""
import numpy as np
import pandas as pd
from pathlib import Path

RNG = np.random.default_rng(42)
N = 110_000
OUT_DIR = Path(__file__).parent / "synthetic"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def generate() -> pd.DataFrame:
    # ── Demographics ───────────────────────────────────────────────────────
    age = RNG.integers(18, 75, N)
    gender = RNG.choice(["Male", "Female", "Other"], N, p=[0.48, 0.48, 0.04])
    region = RNG.choice(["North", "South", "East", "West", "Central"], N)

    # ── Subscription ──────────────────────────────────────────────────────
    contract_type = RNG.choice(
        ["Month-to-month", "One year", "Two year"],
        N,
        p=[0.55, 0.25, 0.20],
    )
    subscription_type = RNG.choice(["Basic", "Standard", "Premium"], N, p=[0.40, 0.35, 0.25])
    tenure_months = RNG.integers(1, 73, N).astype(float)

    # Introduce ~2% missing tenure
    tenure_months[RNG.random(N) < 0.02] = np.nan

    base_charge = {"Basic": 25, "Standard": 55, "Premium": 95}
    monthly_charges = np.array([
        base_charge[sub] + RNG.normal(0, 8)
        for sub in subscription_type
    ]).clip(10, 200)

    total_spending = np.where(
        np.isnan(tenure_months),
        monthly_charges * 12,
        monthly_charges * tenure_months,
    )

    payment_method = RNG.choice(
        ["Electronic check", "Mailed check", "Bank transfer", "Credit card"],
        N,
        p=[0.34, 0.22, 0.22, 0.22],
    )
    discount_usage = RNG.integers(0, 5, N)
    plan_upgrades = RNG.integers(0, 4, N)
    plan_downgrades = RNG.integers(0, 3, N)

    # ── Usage ─────────────────────────────────────────────────────────────
    login_frequency = RNG.exponential(4, N).clip(0, 30)
    feature_usage_count = RNG.integers(0, 20, N)
    session_time_avg = RNG.exponential(25, N).clip(1, 180)
    last_login_days = RNG.integers(0, 120, N)
    email_open_rate = RNG.beta(2, 5, N)
    offer_response_rate = RNG.beta(1.5, 6, N)
    inactive_days = RNG.integers(0, 60, N)

    # ── Support ───────────────────────────────────────────────────────────
    support_tickets = RNG.negative_binomial(1, 0.5, N).clip(0, 15)
    complaint_count = (support_tickets * RNG.beta(1, 3, N)).astype(int)
    refund_requests = RNG.integers(0, 4, N)
    app_crashes = RNG.integers(0, 10, N)
    network_issues = RNG.integers(0, 5, N)
    service_interruptions = RNG.integers(0, 3, N)
    competitor_interactions = RNG.integers(0, 3, N)

    # ── Satisfaction ──────────────────────────────────────────────────────
    customer_satisfaction = RNG.normal(3.5, 1.0, N).clip(1, 5)
    nps_score = RNG.integers(-100, 101, N)

    # ── Churn probability ─────────────────────────────────────────────────
    log_odds = (
        -1.5
        + 1.2 * (contract_type == "Month-to-month").astype(float)
        - 0.6 * (contract_type == "Two year").astype(float)
        - 0.05 * np.nan_to_num(tenure_months, nan=12)
        + 0.015 * monthly_charges
        + 0.10 * support_tickets
        + 0.20 * complaint_count
        - 0.25 * customer_satisfaction
        - 0.003 * nps_score
        + 0.02 * last_login_days
        + 0.01 * inactive_days
        - 0.05 * login_frequency
        + 0.30 * (payment_method == "Electronic check").astype(float)
        + RNG.normal(0, 0.5, N)
    )
    churn_prob = 1 / (1 + np.exp(-log_odds))
    churn_label = (RNG.random(N) < churn_prob).astype(int)

    # ── Risk score (0-1) ──────────────────────────────────────────────────
    risk_score = churn_prob.round(4)

    # ── CLV ───────────────────────────────────────────────────────────────
    predicted_ltv = (monthly_charges * 12 * (1 + plan_upgrades * 0.1)).round(2)

    df = pd.DataFrame({
        "customer_id": [f"CUST{i:07d}" for i in range(1, N + 1)],
        "age": age,
        "gender": gender,
        "region": region,
        "contract_type": contract_type,
        "subscription_type": subscription_type,
        "tenure_months": tenure_months,
        "monthly_charges": monthly_charges.round(2),
        "total_spending": total_spending.round(2),
        "payment_method": payment_method,
        "discount_usage": discount_usage,
        "plan_upgrades": plan_upgrades,
        "plan_downgrades": plan_downgrades,
        "login_frequency": login_frequency.round(2),
        "feature_usage_count": feature_usage_count,
        "session_time_avg": session_time_avg.round(2),
        "last_login_days": last_login_days,
        "email_open_rate": email_open_rate.round(4),
        "offer_response_rate": offer_response_rate.round(4),
        "inactive_days": inactive_days,
        "support_tickets": support_tickets,
        "complaint_count": complaint_count,
        "refund_requests": refund_requests,
        "app_crashes": app_crashes,
        "network_issues": network_issues,
        "service_interruptions": service_interruptions,
        "competitor_interactions": competitor_interactions,
        "customer_satisfaction": customer_satisfaction.round(2),
        "nps_score": nps_score,
        "predicted_ltv": predicted_ltv,
        "risk_score": risk_score,
        "churn_label": churn_label,
    })

    return df


if __name__ == "__main__":
    print("Generating synthetic dataset…")
    df = generate()
    out_path = OUT_DIR / "generated_churn_dataset.csv"
    df.to_csv(out_path, index=False)
    print(f"Saved {len(df):,} rows → {out_path}")
    print(f"Churn rate: {df['churn_label'].mean():.1%}")
    print(df.describe())
