from typing import Generator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import ALGORITHM
from app.db.supabase import get_supabase_client
from app.models.user import User, TokenPayload
from app.services.user_service import UserService

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_current_user(
    token: str = Depends(reusable_oauth2)
) -> User:
    """
    Valida o token JWT e retorna o usuário atual
    
    Args:
        token: Token JWT
        
    Returns:
        Usuário atual
        
    Raises:
        HTTPException: Se o token for inválido ou o usuário não for encontrado
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Não foi possível validar as credenciais",
        )
    
    user = await UserService.get_user_by_id(token_data.sub)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Usuário não encontrado"
        )
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Verifica se o usuário atual está ativo
    
    Args:
        current_user: Usuário atual
        
    Returns:
        Usuário atual ativo
        
    Raises:
        HTTPException: Se o usuário não estiver ativo
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Usuário inativo"
        )
    
    return current_user
