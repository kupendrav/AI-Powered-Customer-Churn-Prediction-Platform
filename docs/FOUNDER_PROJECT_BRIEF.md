# Founder Brief: AI Customer Churn Prediction Platform

## One-Line Positioning

This project is an AI-powered revenue retention platform that helps SaaS companies predict customer churn, identify revenue at risk, and recommend proactive retention actions before customers cancel.

## Business View

Churn directly reduces ARR, customer lifetime value, and growth efficiency. This platform helps leadership and customer success teams move from reactive reporting to proactive retention.

It answers:

- Which customers are likely to churn?
- Why are they at risk?
- How much revenue is exposed?
- What should the team do next?
- Is the model still reliable as behavior changes?

The business value is revenue protection. For a SaaS company with meaningful recurring revenue, even a small churn reduction can protect a large amount of ARR and improve net revenue retention.

## Technical View

The product is a full-stack AI SaaS platform:

- Frontend: Next.js dashboard for analytics, upload, predictions, recommendations, monitoring, admin, and settings.
- Backend: FastAPI API with JWT authentication, role-based access control, data ingestion, analytics, prediction, monitoring, and recommendation endpoints.
- Database: PostgreSQL for users, customers, predictions, drift reports, and recommendations.
- ML layer: Scikit-learn model artifacts, scaler metadata, feature schema, and metrics.
- MLOps and observability: MLflow, Prometheus, and Grafana through Docker Compose.
- Deployment: Dockerfiles, Docker Compose, Nginx reverse proxy, and Kubernetes manifests.

## Demo Flow

1. Login with the demo admin account.
2. Show dashboard KPIs: customers, churn rate, at-risk customers, MRR at risk, CLV, and NPS.
3. Show segment analytics to explain where churn is concentrated.
4. Upload a customer CSV.
5. Run a single churn prediction.
6. Show risk factors and prediction explanation.
7. Generate retention recommendations.
8. Show model metrics and drift monitoring.

## Validation Summary

Validated locally on May 23, 2026:

- Frontend lint passed.
- Frontend production build passed.
- Backend tests passed: 8/8.
- Docker Compose stack started successfully.
- Smoke tested health, auth, protected APIs, KPIs, prediction, model metrics, drift check, explanation, upload, recommendations, and frontend root page.

## Production Readiness Notes

The project is demo-ready and runnable, but real production hardening should include:

- Replace default demo credentials.
- Require a strong production `SECRET_KEY`.
- Restrict or disable public registration.
- Move auth tokens to a hardened storage strategy such as HTTP-only cookies.
- Use Alembic migrations instead of startup table creation.
- Restrict public access to database, Redis, PgAdmin, Prometheus, Grafana, docs, and metrics.
- Add rate limiting and upload size limits.
- Add stronger CSV validation.
- Persist real drift reports and alerts.
- Expand tests for upload, authorization boundaries, monitoring, recommendations, and frontend workflows.

## Founder Closing Pitch

This is more than a machine learning dashboard. It connects AI predictions to revenue protection, operational prioritization, and customer success action. The founder-level story is simple: detect churn earlier, explain why it is happening, and guide the team toward interventions that protect ARR.
