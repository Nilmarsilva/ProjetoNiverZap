from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta

from app.db.database import get_db_connection
from app.models.message import MessageCreate, MessageUpdate, Message, MessageList, MessageStatus
from app.integrations.factory import WhatsAppProvider
from app.services.contact_service import ContactService

class MessageService:
    """Serviço para gerenciar mensagens no PostgreSQL"""
    
    @staticmethod
    async def create_message(user_id: str, message_in: MessageCreate, provider: str) -> Message:
        """
        Cria uma nova mensagem agendada
        
        Args:
            user_id: ID do usuário proprietário da mensagem
            message_in: Dados da mensagem a ser criada
            provider: Provedor de WhatsApp a ser usado
            
        Returns:
            Mensagem criada
        """
        supabase = get_supabase_client()
        
        # Verificar se o contato existe e pertence ao usuário
        contact = await ContactService.get_contact(user_id, message_in.contact_id)
        if not contact:
            raise ValueError(f"Contato não encontrado: {message_in.contact_id}")
        
        message_data = message_in.dict()
        message_data["user_id"] = user_id
        message_data["created_at"] = datetime.utcnow().isoformat()
        message_data["updated_at"] = datetime.utcnow().isoformat()
        message_data["status"] = MessageStatus.SCHEDULED
        message_data["provider"] = provider
        
        # Converter datetime para string ISO
        if isinstance(message_data["scheduled_date"], datetime):
            message_data["scheduled_date"] = message_data["scheduled_date"].isoformat()
        
        response = supabase.table("messages").insert(message_data).execute()
        
        if not response.data:
            raise ValueError("Erro ao criar mensagem")
        
        return Message(**response.data[0])
    
    @staticmethod
    async def get_message(user_id: str, message_id: str) -> Optional[Message]:
        """
        Obtém uma mensagem pelo ID
        
        Args:
            user_id: ID do usuário proprietário da mensagem
            message_id: ID da mensagem
            
        Returns:
            Mensagem ou None se não encontrada
        """
        supabase = get_supabase_client()
        
        response = supabase.table("messages").select("*").eq("id", message_id).eq("user_id", user_id).execute()
        if not response.data:
            return None
        
        return Message(**response.data[0])
    
    @staticmethod
    async def get_messages(
        user_id: str, 
        skip: int = 0, 
        limit: int = 100, 
        status: Optional[MessageStatus] = None,
        contact_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> MessageList:
        """
        Obtém a lista de mensagens de um usuário
        
        Args:
            user_id: ID do usuário proprietário das mensagens
            skip: Número de registros para pular
            limit: Número máximo de registros para retornar
            status: Filtro por status
            contact_id: Filtro por contato
            start_date: Filtro por data inicial
            end_date: Filtro por data final
            
        Returns:
            Lista de mensagens
        """
        supabase = get_supabase_client()
        
        query = supabase.table("messages").select("*", count="exact").eq("user_id", user_id)
        
        if status:
            query = query.eq("status", status)
        
        if contact_id:
            query = query.eq("contact_id", contact_id)
        
        if start_date:
            start_date_str = start_date.isoformat()
            query = query.gte("scheduled_date", start_date_str)
        
        if end_date:
            end_date_str = end_date.isoformat()
            query = query.lte("scheduled_date", end_date_str)
        
        response = query.order("scheduled_date", desc=False).range(skip, skip + limit - 1).execute()
        
        messages = [Message(**item) for item in response.data]
        total = response.count or 0
        
        return MessageList(messages=messages, total=total)
    
    @staticmethod
    async def update_message_status(message_id: str, status: MessageStatus, error_message: Optional[str] = None, delivery_data: Optional[Dict[str, Any]] = None) -> Message:
        """
        Atualiza o status de uma mensagem
        
        Args:
            message_id: ID da mensagem
            status: Novo status
            error_message: Mensagem de erro (opcional)
            delivery_data: Dados de entrega (opcional)
            
        Returns:
            Mensagem atualizada
            
        Raises:
            ValueError: Se a mensagem não for encontrada
        """
        supabase = get_supabase_client()
        
        # Verificar se a mensagem existe
        response = supabase.table("messages").select("*").eq("id", message_id).execute()
        if not response.data:
            raise ValueError(f"Mensagem não encontrada: {message_id}")
        
        # Preparar dados para atualização
        update_data = {
            "status": status,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        if error_message:
            update_data["error_message"] = error_message
        
        if delivery_data:
            update_data["delivery_data"] = delivery_data
        
        # Atualizar mensagem
        response = supabase.table("messages").update(update_data).eq("id", message_id).execute()
        
        if not response.data:
            raise ValueError("Erro ao atualizar status da mensagem")
        
        return Message(**response.data[0])
    
    @staticmethod
    async def cancel_message(user_id: str, message_id: str) -> bool:
        """
        Cancela uma mensagem agendada
        
        Args:
            user_id: ID do usuário proprietário da mensagem
            message_id: ID da mensagem
            
        Returns:
            True se a mensagem foi cancelada com sucesso
            
        Raises:
            ValueError: Se a mensagem não for encontrada ou já tiver sido enviada
        """
        supabase = get_supabase_client()
        
        # Verificar se a mensagem existe e pertence ao usuário
        response = supabase.table("messages").select("*").eq("id", message_id).eq("user_id", user_id).execute()
        if not response.data:
            raise ValueError(f"Mensagem não encontrada: {message_id}")
        
        message = Message(**response.data[0])
        
        # Verificar se a mensagem já foi enviada
        if message.status not in [MessageStatus.SCHEDULED, MessageStatus.PROCESSING]:
            raise ValueError("Não é possível cancelar uma mensagem que já foi enviada")
        
        # Atualizar status para cancelado
        update_data = {
            "status": "canceled",
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("messages").update(update_data).eq("id", message_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise ValueError("Erro ao cancelar mensagem")
        
        return True
    
    @staticmethod
    async def get_pending_messages(limit: int = 10) -> List[Dict[str, Any]]:
        """
        Obtém a lista de mensagens pendentes para envio
        
        Args:
            limit: Número máximo de mensagens para retornar
            
        Returns:
            Lista de mensagens pendentes
        """
        supabase = get_supabase_client()
        
        now = datetime.utcnow().isoformat()
        
        # Buscar mensagens agendadas para envio
        query = f"""
        SELECT m.*, c.phone, c.name, u.whatsapp_provider, u.whatsapp_config
        FROM messages m
        JOIN contacts c ON m.contact_id = c.id
        JOIN users u ON m.user_id = u.id
        WHERE 
            m.status = 'scheduled' AND 
            m.scheduled_date <= '{now}' AND
            c.is_active = true AND
            u.is_active = true
        ORDER BY m.scheduled_date
        LIMIT {limit}
        """
        
        response = supabase.rpc("run_sql", {"query": query}).execute()
        
        if not response.data:
            return []
        
        return response.data
    
    @staticmethod
    async def get_messages_count_today(user_id: str) -> int:
        """
        Obtém o número de mensagens enviadas hoje por um usuário
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Número de mensagens enviadas hoje
        """
        supabase = get_supabase_client()
        
        today_start = datetime.combine(date.today(), datetime.min.time()).isoformat()
        today_end = datetime.combine(date.today(), datetime.max.time()).isoformat()
        
        response = supabase.table("messages").select("id", count="exact") \
            .eq("user_id", user_id) \
            .in_("status", ["sent", "delivered", "read"]) \
            .gte("updated_at", today_start) \
            .lte("updated_at", today_end) \
            .execute()
        
        return response.count or 0
