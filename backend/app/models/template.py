from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field

class TemplateBase(BaseModel):
    """Modelo base para templates de mensagem"""
    name: str
    content: str
    description: Optional[str] = None
    parameters: Optional[List[str]] = None  # Lista de parâmetros como "nome", "data", etc.

class TemplateCreate(TemplateBase):
    """Modelo para criação de templates"""
    pass

class TemplateUpdate(BaseModel):
    """Modelo para atualização de templates"""
    name: Optional[str] = None
    content: Optional[str] = None
    description: Optional[str] = None
    parameters: Optional[List[str]] = None
    is_active: Optional[bool] = None

class TemplateInDB(TemplateBase):
    """Modelo de template como armazenado no banco de dados"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    
    class Config:
        from_attributes = True

class Template(TemplateBase):
    """Modelo de template para retorno na API"""
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class TemplateList(BaseModel):
    """Modelo para lista de templates"""
    templates: List[Template]
    total: int
