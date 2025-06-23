from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import Token, User, UserCreate
from app.services.user_service import UserService

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, obtém um token de acesso para credenciais futuras
    """
    user = await UserService.authenticate(
        email=form_data.username, 
        password=form_data.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/register", response_model=User)
async def register_user(user_in: UserCreate) -> Any:
    """
    Registra um novo usuário
    """
    try:
        user = await UserService.create_user(user_in)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
