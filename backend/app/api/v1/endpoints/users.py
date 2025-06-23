from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import EmailStr

from app.api.deps import get_current_active_user
from app.models.user import User, UserUpdate
from app.services.user_service import UserService

router = APIRouter()

@router.get("/me", response_model=User)
async def read_user_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtém o usuário atual
    """
    return current_user

@router.put("/me", response_model=User)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Atualiza o usuário atual
    """
    try:
        user = await UserService.update_user(current_user.id, user_in)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.get("/me/plan", response_model=dict)
async def read_user_plan(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtém o plano do usuário atual
    """
    try:
        plan = await UserService.get_user_plan(current_user.id)
        return plan
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
