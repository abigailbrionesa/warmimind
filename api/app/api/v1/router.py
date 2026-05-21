from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.learning import router as learning_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(learning_router)
