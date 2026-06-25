from fastapi import APIRouter, HTTPException, status

from app.schemas.schemas import LoginRequest, TokenResponse, UserCreate, UserResponse

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Password login is handled by InsForge auth. Use the frontend InsForge sign-in flow.",
    )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate):
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Registration is handled by InsForge auth. Use the frontend InsForge sign-up flow.",
    )
