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
        # Verificar contato existente
        contact = await ContactService.get_contact(user_id, message_in.contact_id)
        if not contact:
            raise ValueError(f"Contato não encontrado: {message_in.contact_id}")
        async with await get_db_connection() as conn:
            data = message_in.dict()
            msg_id = await conn.fetchval(
                """
                INSERT INTO messages (user_id, contact_id, template_id, scheduled_date, status, provider, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
                RETURNING id
                """,
                user_id,
                data["contact_id"],
                data.get("template_id"),
                data["scheduled_date"],
                MessageStatus.SCHEDULED,
                provider,
                datetime.utcnow()
            )
            row = await conn.fetchrow("SELECT * FROM messages WHERE id=$1", msg_id)
            return Message(**dict(row))
    
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
        async with await get_db_connection() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM messages WHERE id=$1 AND user_id=$2",
                message_id,
                user_id
            )
            if not row:
                return None
            return Message(**dict(row))
    
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
        async with await get_db_connection() as conn:
            where = ["user_id=$1"]
            params = [user_id]
        
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
        
            if status:
                where.append(f"status = $${len(params)+1}")
                params.append(status)
            if contact_id:
                where.append(f"contact_id = $${len(params)+1}")
                params.append(contact_id)
            if start_date:
                where.append(f"scheduled_date >= $${len(params)+1}")
                params.append(start_date)
            if end_date:
                where.append(f"scheduled_date <= $${len(params)+1}")
                params.append(end_date)
            where_sql = " AND ".join(where)
            query_sql = f"SELECT * FROM messages WHERE {where_sql} ORDER BY scheduled_date OFFSET {skip} LIMIT {limit}"
            rows = await conn.fetch(query_sql, *params)
            count_sql = f"SELECT COUNT(*) FROM messages WHERE {where_sql}"
            total = await conn.fetchval(count_sql, *params)
            messages = [Message(**dict(r)) for r in rows]
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
        async with await get_db_connection() as conn:
            row = await conn.fetchrow("SELECT id FROM messages WHERE id=$1", message_id)
            if not row:
                raise ValueError(f"Mensagem não encontrada: {message_id}")
            update_data = {"status": status, "updated_at": datetime.utcnow()}
            if error_message:
                update_data["error_message"] = error_message
            if delivery_data:
                update_data["delivery_data"] = delivery_data
        
        if error_message:
            update_data["error_message"] = error_message
        
        if delivery_data:
            update_data["delivery_data"] = delivery_data
        
            set_parts = []
            values = []
            idx=1
            for k,v in update_data.items():
                set_parts.append(f"{k}=${idx}")
                values.append(v)
                idx+=1
            values.append(message_id)
            sql = f"UPDATE messages SET {', '.join(set_parts)} WHERE id=${idx} RETURNING *"
            row = await conn.fetchrow(sql,*values)
            return Message(**dict(row))
    
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
        async with await get_db_connection() as conn:
            row = await conn.fetchrow("SELECT status FROM messages WHERE id=$1 AND user_id=$2", message_id, user_id)
            if not row:
                raise ValueError(f"Mensagem não encontrada: {message_id}")
            if row["status"] not in [MessageStatus.SCHEDULED, MessageStatus.PROCESSING]:
                raise ValueError("Não é possível cancelar uma mensagem que já foi enviada")
            res = await conn.execute(
                "UPDATE messages SET status='canceled', updated_at=$1 WHERE id=$2 AND user_id=$3",
                datetime.utcnow(),
                message_id,
                user_id
            )
            return res[-1] != '0'
    
    @staticmethod
    async def get_pending_messages(limit: int = 10) -> List[Dict[str, Any]]:
        """
        Obtém a lista de mensagens pendentes para envio
        
        Args:
            limit: Número máximo de mensagens para retornar
            
        Returns:
            Lista de mensagens pendentes
        """
        async with await get_db_connection() as conn:
            rows = await conn.fetch(
                """
                SELECT m.*, c.phone, c.name, u.whatsapp_provider, u.whatsapp_config
                FROM messages m
                JOIN contacts c ON m.contact_id = c.id
                JOIN users u ON m.user_id = u.id
                WHERE 
                    m.status = 'scheduled' AND 
                    m.scheduled_date <= NOW() AND
                    c.is_active = TRUE AND
                    u.is_active = TRUE
                ORDER BY m.scheduled_date
                LIMIT $1
                """,
                limit
            )
            return [dict(r) for r in rows]
    
    @staticmethod
    async def get_messages_count_today(user_id: str) -> int:
        """
        Obtém o número de mensagens enviadas hoje por um usuário
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Número de mensagens enviadas hoje
        """
        async with await get_db_connection() as conn:
            today_start = datetime.combine(date.today(), datetime.min.time())
            today_end = datetime.combine(date.today(), datetime.max.time())
            count = await conn.fetchval(
                """
                SELECT COUNT(*) FROM messages
                WHERE user_id=$1 AND status IN ('sent','delivered','read')
                AND updated_at BETWEEN $2 AND $3
                """,
                user_id,
                today_start,
                today_end
            )
            return count or 0
