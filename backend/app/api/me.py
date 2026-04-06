from fastapi import APIRouter, Depends

from app.models import User
from app.schemas.auth import UserResponse
from app.services.dependencies import get_current_user


router = APIRouter(tags=["me"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)
