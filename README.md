# ChurnAI

MIT-licensed AI-powered customer churn prediction and retention intelligence platform.

ChurnAI combines a Next.js analytics dashboard, FastAPI ML inference services, explainable churn predictions, retention recommendations, and InsForge-managed backend services for auth, Postgres, RLS, migrations, and secrets.

## Features

- Predictive churn scoring for individual customers and CSV batches.
- Revenue-at-risk KPIs, churn trend charts, segment analytics, and customer risk tables.
- Explainable AI outputs with top risk factors and SHAP-ready payloads.
- Retention recommendation generation with priority and estimated revenue impact.
- Drift monitoring endpoints and model metric reporting.
- InsForge authentication with email verification, OAuth-ready project config, and SSR-safe cookies.
- InsForge Postgres schema with RLS-protected tables for profiles, customers, predictions, recommendations, and drift reports.
- FastAPI backend for ML orchestration, uploads, analytics, recommendations, and monitoring.
- Docker Compose stack for frontend, backend, Redis, MLflow, Prometheus, Grafana, and Nginx.

## Architecture

- `frontend/`: Next.js 15 dashboard using `@insforge/sdk` SSR auth helpers.
- `backend/`: FastAPI API that validates InsForge bearer tokens and reads/writes InsForge Postgres.
- `migrations/`: InsForge SQL migrations for app tables, RLS, grants, triggers, and helper functions.
- `ml/`: model training, prediction, and artifact code.
- `datasets/`: synthetic data generation and legacy local SQL reference.
- `monitoring/`: Prometheus and Grafana configuration.
- `deployment/`: Nginx and deployment assets.

InsForge is the primary backend. Local Postgres is not part of the default development stack.

## InsForge Setup

Link the project:

```bash
npx @insforge/cli link --project-id b12ac892-a27c-450a-b90a-02f2eedafc31
npx @insforge/cli current
```

Apply database migrations:

```bash
npx @insforge/cli db migrations list
npx @insforge/cli db migrations up --all
```

Get the frontend anon key for local development:

```bash
npx @insforge/cli secrets get ANON_KEY
```

Do not commit `.insforge/project.json`, `.env`, `.env.local`, database passwords, anon keys, API keys, or generated secret files.

## Environment

Create `.env` from `.env.example` and fill in project-local values:

```bash
cp .env.example .env
```

Required values:

- `DATABASE_URL`: InsForge Postgres connection string for the FastAPI backend.
- `INSFORGE_URL`: InsForge API base URL.
- `NEXT_PUBLIC_INSFORGE_URL`: same public InsForge URL for Next.js.
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`: InsForge anon key from the CLI.
- `NEXT_PUBLIC_APP_URL`: local or deployed frontend URL.
- `NEXT_PUBLIC_API_URL`: FastAPI URL, usually `http://localhost:8000`.

## Local Development

Install frontend dependencies:

```bash
cd frontend
npm ci --legacy-peer-deps
```

Run the full local stack:

```bash
docker compose up --build
```

Or run services manually:

```bash
cd backend
uvicorn app.main:app --reload
```

```bash
cd frontend
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- FastAPI docs: `http://localhost:8000/docs`
- MLflow: `http://localhost:5000`
- Grafana: `http://localhost:3001`

## Testing

Backend:

```bash
cd backend
pytest app/tests/ -v --tb=short
```

ML:

```bash
pytest tests/ml/ -v --tb=short
```

Frontend:

```bash
cd frontend
npx tsc --noEmit
npm run lint
npm run build
```

InsForge verification:

```bash
npx @insforge/cli db query "select table_name from information_schema.tables where table_schema = 'public' order by table_name" --json
```

## License

This project is open source under the MIT License. See `LICENSE`.
