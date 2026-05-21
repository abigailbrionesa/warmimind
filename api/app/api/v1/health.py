from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def versioned_health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name, "version": settings.api_version}
