from typing import Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.message import Message, MessageCreate, MessageUpdate, MessageList, MessageStatus
from app.services.message_service import MessageService
from app.tasks.message_tasks import send_message

router = APIRouter()

@router.post("", response_model=Message)
async def create_message(
    message_in: MessageCreate,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cria uma nova mensagem agendada
    """
    try:
        # Usar o provedor configurado no perfil do usuário
        message = await MessageService.create_message(current_user.id, message_in, current_user.whatsapp_provider)
        return message
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

@router.get("", response_model=MessageList)
async def read_messages(
    skip: int = 0,
    limit: int = 100,
    status: Optional[MessageStatus] = None,
    contact_id: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtém a lista de mensagens do usuário atual
    """
    messages = await MessageService.get_messages(
        current_user.id, 
        skip=skip, 
        limit=limit, 
        status=status,
        contact_id=contact_id,
        start_date=start_date,
        end_date=end_date
    )
    return messages

@router.get("/{message_id}", response_model=Message)
async def read_message(
    message_id: str,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Obtém uma mensagem específica
    """
    message = await MessageService.get_message(current_user.id, message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensagem não encontrada",
        )
    return message

@router.post("/{message_id}/send", response_model=dict)
async def send_message_now(
    message_id: str,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Envia uma mensagem imediatamente
    """
    # Verificar se a mensagem existe e pertence ao usuário
    message = await MessageService.get_message(current_user.id, message_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensagem não encontrada",
        )
    
    # Verificar se a mensagem já foi enviada
    if message.status not in [MessageStatus.SCHEDULED, MessageStatus.ERROR]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não é possível enviar uma mensagem com status {message.status}",
        )
    
    # Agendar tarefa para envio da mensagem
    send_message.delay(message_id)
    
    return {"success": True, "message": "Mensagem agendada para envio imediato"}

@router.delete("/{message_id}", response_model=dict)
async def cancel_message(
    message_id: str,
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Cancela uma mensagem agendada
    """
    try:
        result = await MessageService.cancel_message(current_user.id, message_id)
        return {"success": result}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
