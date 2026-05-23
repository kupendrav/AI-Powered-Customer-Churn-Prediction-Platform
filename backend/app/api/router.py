from fastapi import APIRouter
from app.api.v1 import auth, users, predictions, analytics, upload, monitoring, recommendations

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["Monitoring"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])
