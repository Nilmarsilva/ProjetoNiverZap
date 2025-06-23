from datetime import date, datetime
import logging
from typing import Dict, Any, List

from app.core.celery_app import celery_app
from app.services.contact_service import ContactService
from app.services.message_service import MessageService
from app.integrations.factory import WhatsAppConnectorFactory, WhatsAppProvider
from app.models.message import MessageStatus

logger = logging.getLogger(__name__)

@celery_app.task
def check_birthdays() -> Dict[str, Any]:
    """
    Verifica os aniversários do dia e agenda mensagens para envio
    
    Returns:
        Informações sobre as mensagens agendadas
    """
    today = date.today()
    logger.info(f"Verificando aniversários para o dia {today}")
    
    # Executar de forma assíncrona
    return _check_birthdays_async(today)

async def _check_birthdays_async(today: date) -> Dict[str, Any]:
    """
    Implementação assíncrona da verificação de aniversários
    
    Args:
        today: Data de hoje
        
    Returns:
        Informações sobre as mensagens agendadas
    """
    try:
        # Obter contatos que fazem aniversário hoje
        contacts = await ContactService.get_birthdays_today(today)
        
        if not contacts:
            logger.info("Nenhum aniversário encontrado para hoje")
            return {"status": "success", "messages_scheduled": 0}
        
        logger.info(f"Encontrados {len(contacts)} aniversários para hoje")
        
        # Agendar mensagens para cada contato
        messages_scheduled = 0
        
        for contact in contacts:
            try:
                # Verificar limite de mensagens do usuário
                user_id = contact.get("user_id")
                message_limit = contact.get("message_limit", 0)
                
                # Contar mensagens enviadas hoje
                messages_count = await MessageService.get_messages_count_today(user_id)
                
                if messages_count >= message_limit:
                    logger.warning(f"Limite de mensagens atingido para o usuário {user_id}: {messages_count}/{message_limit}")
                    continue
                
                # Obter provedor de WhatsApp
                provider_str = contact.get("whatsapp_provider", "zapi")
                allowed_providers = contact.get("allowed_providers", ["zapi"])
                
                if provider_str not in allowed_providers:
                    logger.warning(f"Provedor {provider_str} não permitido para o usuário {user_id}. Usando o primeiro provedor permitido.")
                    provider_str = allowed_providers[0]
                
                # Criar mensagem de aniversário
                message_content = f"Feliz aniversário, {contact.get('name')}! 🎂🎉"
                
                message_data = {
                    "contact_id": contact.get("id"),
                    "content": message_content,
                    "scheduled_date": datetime.now().isoformat()
                }
                
                # Agendar mensagem
                await MessageService.create_message(user_id, message_data, provider_str)
                messages_scheduled += 1
                
                logger.info(f"Mensagem agendada para {contact.get('name')} (ID: {contact.get('id')})")
                
            except Exception as e:
                logger.error(f"Erro ao agendar mensagem para contato {contact.get('id')}: {str(e)}")
        
        return {
            "status": "success",
            "messages_scheduled": messages_scheduled,
            "total_birthdays": len(contacts)
        }
        
    except Exception as e:
        logger.error(f"Erro ao verificar aniversários: {str(e)}")
        return {"status": "error", "error": str(e)}
