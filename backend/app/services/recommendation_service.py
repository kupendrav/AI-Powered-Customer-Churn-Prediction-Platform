import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from uuid import uuid4

from app.models.customer import Customer
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation

logger = logging.getLogger(__name__)

STRATEGIES = [
    {
        "trigger": lambda c, p: str(getattr(c, "contract_type", "")) == "Month-to-month",
        "strategy": "Offer annual contract upgrade with 15% discount",
        "rationale": "Month-to-month customers churn 3× more than annual subscribers. A discount incentive significantly reduces cancellation intent.",
        "priority": "high",
        "churn_reduction": 0.25,
        "action_items": [
            "Send personalised discount email within 24 hours",
            "Offer 1-year contract at 15% below monthly equivalent",
            "Include 30-day money-back guarantee",
        ],
    },
    {
        "trigger": lambda c, p: (getattr(c, "support_tickets", 0) or 0) >= 3,
        "strategy": "Assign dedicated success manager and priority support",
        "rationale": "Customers with 3+ unresolved tickets show elevated churn risk. Personal outreach from a success manager resolves friction.",
        "priority": "high",
        "churn_reduction": 0.20,
        "action_items": [
            "Assign account to senior success manager",
            "Schedule 30-minute review call within 48 hours",
            "Escalate open tickets to P1 resolution",
        ],
    },
    {
        "trigger": lambda c, p: (getattr(c, "last_login_days", 0) or 0) > 30,
        "strategy": "Re-engagement campaign with feature highlights",
        "rationale": "Inactivity for 30+ days strongly correlates with churn. A personalised re-engagement sequence can reactivate the account.",
        "priority": "medium",
        "churn_reduction": 0.15,
        "action_items": [
            "Trigger 3-email re-engagement sequence",
            "Highlight new features released since last login",
            "Offer free onboarding session",
        ],
    },
    {
        "trigger": lambda c, p: (getattr(c, "customer_satisfaction", 5) or 5) < 3,
        "strategy": "Proactive satisfaction recovery outreach",
        "rationale": "Below-average satisfaction scores are leading indicators of churn. Immediate outreach prevents escalation.",
        "priority": "high",
        "churn_reduction": 0.22,
        "action_items": [
            "Customer success manager personal call within 24 hours",
            "Root-cause analysis of satisfaction drivers",
            "Offer service credit as goodwill gesture",
        ],
    },
    {
        "trigger": lambda c, p: (getattr(c, "tenure_months", 12) or 12) < 6,
        "strategy": "Intensive onboarding accelerator programme",
        "rationale": "New customers in the first 6 months have the highest churn risk. Structured onboarding significantly increases long-term retention.",
        "priority": "medium",
        "churn_reduction": 0.18,
        "action_items": [
            "Enrol in 4-week guided onboarding programme",
            "Assign onboarding specialist",
            "Set 30/60/90-day success milestones",
        ],
    },
]


class RecommendationService:
    def __init__(self, db: Session):
        self.db = db

    def generate(self, customer_id: str) -> List[Recommendation]:
        customer = self.db.query(Customer).filter(Customer.customer_id == customer_id).first()
        if not customer:
            return []

        prediction = (
            self.db.query(Prediction)
            .filter(Prediction.customer_id == customer_id)
            .order_by(Prediction.created_at.desc())
            .first()
        )
        prob = float(prediction.churn_probability) if prediction else 0.5
        monthly = float(customer.monthly_charges or 0)
        ltv = float(customer.predicted_ltv or monthly * 24)

        results = []
        for s in STRATEGIES:
            if s["trigger"](customer, prediction):
                rev_saved = round(ltv * prob * s["churn_reduction"], 2)
                rec = (
                    self.db.query(Recommendation)
                    .filter(
                        Recommendation.customer_id == customer_id,
                        Recommendation.strategy == s["strategy"],
                        Recommendation.status == "pending",
                    )
                    .first()
                )
                if rec is None:
                    rec = Recommendation(customer_id=customer_id, strategy=s["strategy"], status="pending")
                    self.db.add(rec)
                rec.rationale = s["rationale"]
                rec.priority = s["priority"]
                rec.estimated_revenue_saved = rev_saved
                rec.estimated_churn_reduction = s["churn_reduction"]
                rec.action_items = s["action_items"]
                results.append(rec)

        if not results:
            rec = Recommendation(
                customer_id=customer_id,
                strategy="Monitor and personalise communication",
                rationale="No critical risk triggers detected. Continue monitoring engagement metrics.",
                priority="low",
                estimated_revenue_saved=0.0,
                estimated_churn_reduction=0.05,
                action_items=["Monthly health check", "Quarterly NPS survey"],
                status="pending",
            )
            existing = (
                self.db.query(Recommendation)
                .filter(
                    Recommendation.customer_id == customer_id,
                    Recommendation.strategy == rec.strategy,
                    Recommendation.status == "pending",
                )
                .first()
            )
            if existing:
                rec = existing
            else:
                self.db.add(rec)
            results.append(rec)

        self.db.commit()
        for r in results:
            self.db.refresh(r)
        return results
