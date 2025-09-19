from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    """Modelo base para usuários"""
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_admin: bool = False

class UserCreate(UserBase):
    """Modelo para criação de usuários"""
    password: str

class UserUpdate(BaseModel):
    """Modelo para atualização de usuários"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
    plan_id: Optional[int] = None
    whatsapp_provider: Optional[str] = None
    whatsapp_config: Optional[dict] = None

class UserInDB(UserBase):
    """Modelo de usuário como armazenado no banco de dados"""
    id: str
    hashed_password: str
    created_at: datetime
    plan_id: Optional[int] = 1
    whatsapp_provider: str = "zapi"  # Provedor padrão
    whatsapp_config: Optional[dict] = None
    
    class Config:
        from_attributes = True

class User(UserBase):
    """Modelo de usuário para retorno na API"""
    id: str
    created_at: datetime
    plan_id: Optional[int] = None
    whatsapp_provider: str
    whatsapp_config: Optional[dict] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """Modelo para token de acesso"""
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    """Modelo para payload do token JWT"""
    sub: Optional[str] = None
