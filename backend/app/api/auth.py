from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    existing = db.scalar(select(User).where(or_(User.email == payload.email, User.phone == payload.phone)))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="الحساب موجود مسبقًا.")

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(access_token=create_access_token(str(user.id)))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(or_(User.email == payload.email, User.phone == payload.phone)))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="بيانات الدخول غير صحيحة.")
    return TokenResponse(access_token=create_access_token(str(user.id)))
