# System Architecture

## Overview

ChurnAI is a 10-phase, full-stack enterprise ML platform for predicting and preventing customer churn.

```
┌─────────────────────────────────────────────────────────┐
│                    Browser / Client                      │
│              Next.js 15 + Tailwind + Recharts            │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────────┐
│                   Nginx Reverse Proxy                    │
└──────────┬────────────────────────────┬─────────────────┘
           │ /v1/*                      │ /*
┌──────────▼──────────┐    ┌────────────▼─────────────────┐
│   FastAPI Backend   │    │     Next.js Frontend         │
│  JWT · RBAC · Async │    │  Dashboard, Analytics,       │
│  Pydantic v2 models │    │  Predictions, Insights       │
└────────┬────────────┘    └──────────────────────────────┘
         │
    ┌────┴────────────────────────────────────┐
    │                Services                  │
    │  PredictionService  RecommendationSvc    │
    │  MonitoringService  AuthService          │
    └────┬───────────────────────┬────────────┘
         │                       │
┌────────▼──────────┐  ┌────────▼──────────────┐
│   PostgreSQL 15    │  │   ML Artifacts (disk) │
│   Redis cache      │  │  model.pkl, scaler.pkl│
│   SQLAlchemy ORM   │  │  metrics.json         │
└────────────────────┘  └────────────────────────┘
         │
┌────────▼──────────────────────────────────────┐
│              MLflow Tracking Server            │
│   Experiment runs, model versions, metrics     │
└────────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────┐
│        Monitoring Stack                        │
│   Prometheus → Grafana dashboards              │
│   Evidently AI drift reports                   │
└────────────────────────────────────────────────┘
```

## ML Pipeline

```
Raw Data (CSV)
    │
    ▼
Preprocessing
    ├── Imputation (median for numerics)
    ├── One-hot encoding (contract, payment, subscription)
    ├── Feature engineering (avg_monthly_charge)
    └── SMOTE oversampling (training set only)
    │
    ▼
Model Training
    ├── Random Forest  (primary)
    ├── XGBoost        (challenger)
    ├── LightGBM       (challenger)
    └── Logistic Regression (baseline)
    │
    ▼
Evaluation
    ├── AUC-ROC, F1, Precision, Recall
    └── Best model selected by AUC
    │
    ▼
SHAP Explainability
    └── TreeExplainer → per-prediction factor ranking
    │
    ▼
Recommendation Engine
    └── Rule-based + SHAP attribution → prioritised actions
```

## Data Model

| Table           | Description                          |
|-----------------|--------------------------------------|
| users           | Platform users with RBAC roles       |
| customers       | Customer features + churn label      |
| predictions     | Churn scores per customer            |
| recommendations | AI retention strategies              |
| drift_reports   | Evidently data/concept drift results |

## API Design

All endpoints are prefixed `/v1/` and require JWT Bearer auth.

| Endpoint                             | Method | Description            |
|--------------------------------------|--------|------------------------|
| /auth/login                          | POST   | Get JWT token          |
| /auth/register                       | POST   | Create user            |
| /predictions/predict                 | POST   | Single prediction      |
| /predictions/predict/batch           | POST   | CSV batch prediction   |
| /predictions/explain/{id}            | GET    | SHAP explanation       |
| /analytics/kpis                      | GET    | Dashboard KPIs         |
| /analytics/churn-by-segment          | GET    | Segment analysis       |
| /analytics/customers                 | GET    | Paginated customer list|
| /recommendations/{id}                | GET    | Customer recs          |
| /recommendations/generate/{id}       | POST   | Generate new recs      |
| /monitoring/drift/reports            | GET    | Drift report list      |
| /monitoring/drift/run                | POST   | Run drift check        |
| /upload/churn-data                   | POST   | Import CSV             |
