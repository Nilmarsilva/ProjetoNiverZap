from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field

class ContactBase(BaseModel):
    """Modelo base para contatos"""
    name: str
    phone: str
    birthday: date
    notes: Optional[str] = None
    
class ContactCreate(ContactBase):
    """Modelo para criação de contatos"""
    pass

class ContactUpdate(BaseModel):
    """Modelo para atualização de contatos"""
    name: Optional[str] = None
    phone: Optional[str] = None
    birthday: Optional[date] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class ContactInDB(ContactBase):
    """Modelo de contato como armazenado no banco de dados"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    
    class Config:
        from_attributes = True

class Contact(ContactBase):
    """Modelo de contato para retorno na API"""
    id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class ContactList(BaseModel):
    """Modelo para lista de contatos"""
    contacts: List[Contact]
    total: int
