from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
from sqlalchemy.orm import Session
from uuid import UUID

from app.config import settings
from app.db.session import get_db
from app.models.user import User, UserRole

bearer_scheme = HTTPBearer()


async def _get_insforge_user(token: str) -> dict:
    url = f"{settings.INSFORGE_URL.rstrip('/')}/api/auth/sessions/current"
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers={"Authorization": f"Bearer {token}"})

    if response.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate InsForge session",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = response.json()
    user = payload.get("user") or payload.get("data", {}).get("user") or payload
    if not user or not user.get("id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="InsForge session did not include a user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        auth_user = await _get_insforge_user(credentials.credentials)
        user_id = UUID(str(auth_user["id"]))
    except (ValueError, httpx.HTTPError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        profile = auth_user.get("profile") or {}
        email = auth_user.get("email") or profile.get("email") or ""
        full_name = (
            profile.get("name")
            or profile.get("full_name")
            or auth_user.get("name")
            or email.split("@")[0]
            or "InsForge User"
        )
        user = User(
            id=user_id,
            email=email,
            full_name=full_name,
            role=UserRole.analyst.value,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


def require_analyst(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in (UserRole.admin.value, UserRole.analyst.value):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Analyst access required")
    return current_user
