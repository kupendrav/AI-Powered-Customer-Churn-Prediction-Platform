from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # App
    APP_NAME: str = "ChurnAI"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # InsForge backend
    INSFORGE_URL: str = "https://shzt9f84.ap-southeast.insforge.app"

    # Database. Must be supplied by .env/.env.local/secret manager.
    DATABASE_URL: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Legacy security settings kept only for old local test helpers.
    SECRET_KEY: str = "dev-only-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
    ]

    # MLflow
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MLFLOW_EXPERIMENT_NAME: str = "churn-prediction"

    # ML artifacts path
    ML_ARTIFACTS_PATH: str = "./ml_artifacts"


settings = Settings()
