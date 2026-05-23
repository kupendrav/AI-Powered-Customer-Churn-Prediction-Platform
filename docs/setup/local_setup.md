# Local Development Setup

## Prerequisites

- Docker Desktop (with Compose v2)
- Python 3.11+ (for local ML work)
- Node.js 20+ (optional, for frontend-only dev)
- Git

## Steps

### 1. Clone and configure

```bash
git clone <your-repo-url> churn-platform
cd churn-platform
cp .env.example .env
```

### 2. Start all services

```bash
docker compose up --build
```

This starts: PostgreSQL, Redis, FastAPI backend, Next.js frontend, MLflow, Prometheus, Grafana, PgAdmin, Nginx.

### 3. Initialise database and seed admin users

```bash
docker compose exec backend python -m app.db.init_db
```

### 4. Generate synthetic dataset (110,000 rows)

```bash
docker compose exec backend python datasets/dataset_generator.py
# or locally:
python datasets/dataset_generator.py
```

### 5. Train the ML model

```bash
docker compose exec backend python -m ml.pipelines.training_pipeline
# or locally:
python -m ml.pipelines.training_pipeline
```

Trained artifacts saved to `ml/artifacts/`.

### 6. Upload dataset via API

```bash
curl -X POST http://localhost:8000/v1/upload/churn-data \
  -H "Authorization: Bearer <token>" \
  -F "file=@datasets/synthetic/generated_churn_dataset.csv"
```

## Service URLs

| Service     | URL                      | Credentials        |
|-------------|--------------------------|-------------------|
| Frontend    | http://localhost:3000    | —                 |
| API Docs    | http://localhost:8000/docs | —               |
| MLflow      | http://localhost:5000    | —                 |
| Grafana     | http://localhost:3001    | admin / admin     |
| PgAdmin     | http://localhost:5050    | admin@churn.ai / admin |
| Prometheus  | http://localhost:9090    | —                 |

## Default Platform Users

| Email              | Password    | Role    |
|--------------------|-------------|---------|
| admin@churn.ai     | admin123    | Admin   |
| analyst@churn.ai   | analyst123  | Analyst |

## Running Tests

```bash
# Backend
docker compose exec backend pytest app/tests/ -v

# ML
pytest tests/ml/ -v
```

## Stopping

```bash
docker compose down          # stop containers
docker compose down -v       # stop + delete volumes
```
