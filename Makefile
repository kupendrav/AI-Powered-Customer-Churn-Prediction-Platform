.PHONY: up down build test seed train lint

up:
	docker compose up --build

down:
	docker compose down

down-v:
	docker compose down -v

build:
	docker compose build

seed:
	docker compose exec backend python -m app.db.init_db
	python datasets/dataset_generator.py

train:
	python -m ml.pipelines.training_pipeline

test-backend:
	docker compose exec backend pytest app/tests/ -v --tb=short

test-ml:
	pytest tests/ml/ -v --tb=short

test:
	make test-backend
	make test-ml

lint-backend:
	docker compose exec backend python -m py_compile app/main.py

logs:
	docker compose logs -f backend

shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec db psql -U postgres churn_db
