from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

class MessageStatus(str, Enum):
    """Enum para status de mensagens"""
    SCHEDULED = "scheduled"
    PROCESSING = "processing"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

class MessageBase(BaseModel):
    """Modelo base para mensagens"""
    contact_id: str
    content: str
    scheduled_date: datetime
    template_id: Optional[str] = None
    template_params: Optional[Dict[str, str]] = None

class MessageCreate(MessageBase):
    """Modelo para criação de mensagens"""
    pass

class MessageUpdate(BaseModel):
    """Modelo para atualização de mensagens"""
    status: Optional[MessageStatus] = None
    error_message: Optional[str] = None
    delivery_data: Optional[Dict[str, Any]] = None

class MessageInDB(MessageBase):
    """Modelo de mensagem como armazenado no banco de dados"""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    status: MessageStatus = MessageStatus.SCHEDULED
    error_message: Optional[str] = None
    delivery_data: Optional[Dict[str, Any]] = None
    provider: str
    
    class Config:
        from_attributes = True

class Message(MessageBase):
    """Modelo de mensagem para retorno na API"""
    id: str
    created_at: datetime
    updated_at: datetime
    status: MessageStatus
    error_message: Optional[str] = None
    delivery_data: Optional[Dict[str, Any]] = None
    provider: str
    
    class Config:
        from_attributes = True

class MessageList(BaseModel):
    """Modelo para lista de mensagens"""
    messages: List[Message]
    total: int
