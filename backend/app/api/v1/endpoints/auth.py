from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.security import create_access_token
from app.models.user import Token, User, UserCreate
from pydantic import BaseModel
from app.services.user_service import UserService

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
async def login_user(credentials: LoginRequest) -> Any:
    """
    Login de usuário
    """
    email = credentials.email
    password = credentials.password
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email e senha são obrigatórios"
        )
    
    user = await UserService.authenticate(email=email, password=password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciais inválidas"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(user.id, expires_delta=access_token_expires)
    
    return {
        "message": "Login bem-sucedido",
        "token": token,
        "user": user
    }

@router.post("/register")
async def register_user(user_in: UserCreate) -> Any:
    """
    Registra um novo usuário
    """
    try:
        user = await UserService.create_user(user_in)
        
        # Gerar token JWT
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token = create_access_token(
            user.id, expires_delta=access_token_expires
        )
        
        return {
            "message": "Usuário registrado com sucesso",
            "user": user,
            "token": token
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.post("/verify-token")
async def verify_token(token_data: dict) -> Any:
    """
    Verifica se o token JWT é válido
    """
    token = token_data.get("token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token não fornecido"
        )
    
    try:
        from jose import jwt, JWTError
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        user = await UserService.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        return {
            "message": "Token válido",
            "valid": True,
            "user": user
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado"
        )
