from datetime import date, datetime
from fastapi import APIRouter, Depends

from app.api.deps import get_current_active_user
from app.db.database import get_db_connection
from app.models.user import User
from app.services.message_service import MessageService
from app.services.contact_service import ContactService

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_active_user)):
    """Retorna dados agregados para o dashboard do usuário logado."""
    user_id = current_user.id

    async with await get_db_connection() as conn:
        # Total de contatos
        total_contacts = await conn.fetchval(
            "SELECT COUNT(*) FROM contacts WHERE user_id=$1 AND is_active=TRUE",
            user_id,
        ) or 0

        # Templates ativos
        total_templates = await conn.fetchval(
            "SELECT COUNT(*) FROM templates WHERE user_id=$1 AND is_active=TRUE",
            user_id,
        ) or 0

        # Mensagens enviadas hoje (reutiliza serviço)
        messages_today = await MessageService.get_messages_count_today(user_id)

        # Eventos de hoje (aniversários)
        today = date.today()
        birthdays_today = await conn.fetchval(
        "SELECT COUNT(*) FROM contacts WHERE user_id=$1 AND is_active=TRUE AND EXTRACT(MONTH FROM birthday)=$2 AND EXTRACT(DAY FROM birthday)=$3",
        user_id,
        today.month,
        today.day,
        ) or 0

        return {
        "stats": {
            "total_contacts": total_contacts,
            "events_today": birthdays_today,
            "messages_sent_today": messages_today,
            "active_templates": total_templates,
        }
    }

@router.get("/upcoming-events")
async def upcoming_events(current_user: User = Depends(get_current_active_user)):
    """Próximos aniversários nos próximos 30 dias"""
    user_id = current_user.id
    today = datetime.utcnow().date()
    
    async with await get_db_connection() as conn:
        # Buscar contatos com aniversário nos próximos 30 dias
        rows = await conn.fetch(
            """
            SELECT * FROM contacts 
            WHERE user_id = $1 AND is_active = TRUE
            AND EXTRACT(MONTH FROM birthday) = $2 AND EXTRACT(DAY FROM birthday) >= $3
            ORDER BY EXTRACT(DAY FROM birthday) ASC
            LIMIT 10
            """,
            user_id,
            today.month,
            today.day
        )
        
        return [dict(row) for row in rows]

@router.get("/recent-activity")
async def recent_activity(current_user: User = Depends(get_current_active_user)):
    """Últimas 10 mensagens do usuário"""
    async with await get_db_connection() as conn:
        rows = await conn.fetch(
            "SELECT id, contact_id, status, created_at FROM messages WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10",
            current_user.id,
        )
        return [dict(r) for r in rows]
