from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

class PlanType(str, Enum):
    """Enum para tipos de planos"""
    FREE = "free"
    PROFESSIONAL = "professional"
    ADVANCED = "advanced"

class PlanBase(BaseModel):
    """Modelo base para planos de assinatura"""
    name: str
    type: PlanType
    description: str
    price: float
    message_limit: int  # Limite diário de mensagens
    allowed_providers: List[str]  # Lista de provedores permitidos

class PlanCreate(PlanBase):
    """Modelo para criação de planos"""
    pass

class PlanUpdate(BaseModel):
    """Modelo para atualização de planos"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    message_limit: Optional[int] = None
    allowed_providers: Optional[List[str]] = None
    is_active: Optional[bool] = None

class PlanInDB(PlanBase):
    """Modelo de plano como armazenado no banco de dados"""
    id: int
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    
    class Config:
        from_attributes = True

class Plan(PlanBase):
    """Modelo de plano para retorno na API"""
    id: int
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class PlanList(BaseModel):
    """Modelo para lista de planos"""
    plans: List[Plan]
    total: int
