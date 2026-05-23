from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.api.router import api_router
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User, UserRole
from app.core.security import hash_password
from app.logging_config import setup_logging
from prometheus_client import make_asgi_app
def seed_default_users() -> None:
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@churn.ai").first():
            admin = User(
                email="admin@churn.ai",
                full_name="Admin User",
                password_hash=hash_password("admin123"),
                role=UserRole.admin,
            )
            db.add(admin)

        if not db.query(User).filter(User.email == "analyst@churn.ai").first():
            analyst = User(
                email="analyst@churn.ai",
                full_name="Analyst User",
                password_hash=hash_password("analyst123"),
                role=UserRole.analyst,
            )
            db.add(analyst)

        db.commit()
    finally:
        db.close()


setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting ChurnAI API...")
    Base.metadata.create_all(bind=engine)
    seed_default_users()
    yield
    logger.info("Shutting down ChurnAI API...")


app = FastAPI(
    title="ChurnAI API",
    description="AI-Powered Customer Churn Prediction & Retention Intelligence Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── Middleware ─────────────────────────────────────────────────────────────────
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/v1")

# ── Prometheus metrics endpoint ────────────────────────────────────────────────
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}
