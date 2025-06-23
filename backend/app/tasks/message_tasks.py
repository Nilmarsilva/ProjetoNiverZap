import logging
from typing import Dict, Any, List, Optional
import asyncio
from datetime import datetime

from app.core.celery_app import celery_app
from app.services.message_service import MessageService
from app.integrations.factory import WhatsAppConnectorFactory, WhatsAppProvider
from app.models.message import MessageStatus

logger = logging.getLogger(__name__)

@celery_app.task
def process_pending_messages(limit: int = 10) -> Dict[str, Any]:
    """
    Processa mensagens pendentes para envio
    
    Args:
        limit: Número máximo de mensagens para processar
        
    Returns:
        Informações sobre as mensagens processadas
    """
    logger.info(f"Processando até {limit} mensagens pendentes")
    
    # Executar de forma assíncrona
    return asyncio.run(_process_pending_messages_async(limit))

async def _process_pending_messages_async(limit: int = 10) -> Dict[str, Any]:
    """
    Implementação assíncrona do processamento de mensagens pendentes
    
    Args:
        limit: Número máximo de mensagens para processar
        
    Returns:
        Informações sobre as mensagens processadas
    """
    try:
        # Obter mensagens pendentes
        messages = await MessageService.get_pending_messages(limit)
        
        if not messages:
            logger.info("Nenhuma mensagem pendente encontrada")
            return {"status": "success", "messages_processed": 0}
        
        logger.info(f"Encontradas {len(messages)} mensagens pendentes para processamento")
        
        # Processar cada mensagem
        messages_processed = 0
        messages_sent = 0
        messages_failed = 0
        
        for message in messages:
            try:
                # Atualizar status para processando
                message_id = message.get("id")
                await MessageService.update_message_status(message_id, MessageStatus.PROCESSING)
                
                # Obter dados necessários para envio
                provider_str = message.get("whatsapp_provider", "zapi")
                phone = message.get("phone")
                content = message.get("content")
                
                # Converter string do provedor para enum
                provider = _get_provider_from_string(provider_str)
                
                # Obter conector WhatsApp apropriado
                connector = WhatsAppConnectorFactory.get_connector(provider)
                
                # Enviar mensagem
                result = await connector.send_text_message(phone, content)
                
                # Atualizar status da mensagem
                if result.get("success", False):
                    await MessageService.update_message_status(
                        message_id, 
                        MessageStatus.SENT, 
                        delivery_data=result
                    )
                    messages_sent += 1
                    logger.info(f"Mensagem {message_id} enviada com sucesso")
                else:
                    error_message = result.get("error", "Erro desconhecido ao enviar mensagem")
                    await MessageService.update_message_status(
                        message_id, 
                        MessageStatus.ERROR, 
                        error_message=error_message,
                        delivery_data=result
                    )
                    messages_failed += 1
                    logger.error(f"Erro ao enviar mensagem {message_id}: {error_message}")
                
                messages_processed += 1
                
            except Exception as e:
                logger.error(f"Erro ao processar mensagem {message.get('id')}: {str(e)}")
                
                try:
                    # Atualizar status para erro
                    await MessageService.update_message_status(
                        message.get("id"), 
                        MessageStatus.ERROR, 
                        error_message=str(e)
                    )
                except Exception as update_error:
                    logger.error(f"Erro ao atualizar status da mensagem {message.get('id')}: {str(update_error)}")
                
                messages_failed += 1
                messages_processed += 1
        
        return {
            "status": "success",
            "messages_processed": messages_processed,
            "messages_sent": messages_sent,
            "messages_failed": messages_failed
        }
        
    except Exception as e:
        logger.error(f"Erro ao processar mensagens pendentes: {str(e)}")
        return {"status": "error", "error": str(e)}

@celery_app.task
def send_message(message_id: str) -> Dict[str, Any]:
    """
    Envia uma mensagem específica
    
    Args:
        message_id: ID da mensagem a ser enviada
        
    Returns:
        Informações sobre o envio da mensagem
    """
    logger.info(f"Enviando mensagem {message_id}")
    
    # Executar de forma assíncrona
    return asyncio.run(_send_message_async(message_id))

async def _send_message_async(message_id: str) -> Dict[str, Any]:
    """
    Implementação assíncrona do envio de mensagem
    
    Args:
        message_id: ID da mensagem a ser enviada
        
    Returns:
        Informações sobre o envio da mensagem
    """
    try:
        # Obter mensagem
        message = await MessageService.get_message(None, message_id)
        
        if not message:
            error_msg = f"Mensagem {message_id} não encontrada"
            logger.error(error_msg)
            return {"status": "error", "error": error_msg}
        
        # Atualizar status para processando
        await MessageService.update_message_status(message_id, MessageStatus.PROCESSING)
        
        # Obter dados necessários para envio
        provider_str = message.provider
        
        # Converter string do provedor para enum
        provider = _get_provider_from_string(provider_str)
        
        # Obter conector WhatsApp apropriado
        connector = WhatsAppConnectorFactory.get_connector(provider)
        
        # Enviar mensagem
        result = await connector.send_text_message(message.phone, message.content)
        
        # Atualizar status da mensagem
        if result.get("success", False):
            await MessageService.update_message_status(
                message_id, 
                MessageStatus.SENT, 
                delivery_data=result
            )
            logger.info(f"Mensagem {message_id} enviada com sucesso")
            return {"status": "success", "message_id": message_id, "result": result}
        else:
            error_message = result.get("error", "Erro desconhecido ao enviar mensagem")
            await MessageService.update_message_status(
                message_id, 
                MessageStatus.ERROR, 
                error_message=error_message,
                delivery_data=result
            )
            logger.error(f"Erro ao enviar mensagem {message_id}: {error_message}")
            return {"status": "error", "message_id": message_id, "error": error_message, "result": result}
        
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem {message_id}: {str(e)}")
        
        try:
            # Atualizar status para erro
            await MessageService.update_message_status(
                message_id, 
                MessageStatus.ERROR, 
                error_message=str(e)
            )
        except Exception as update_error:
            logger.error(f"Erro ao atualizar status da mensagem {message_id}: {str(update_error)}")
        
        return {"status": "error", "message_id": message_id, "error": str(e)}

def _get_provider_from_string(provider_str: str) -> WhatsAppProvider:
    """
    Converte uma string de provedor para o enum correspondente
    
    Args:
        provider_str: String do provedor
        
    Returns:
        Enum do provedor
    """
    provider_map = {
        "zapi": WhatsAppProvider.ZAPI,
        "whatsapp_official": WhatsAppProvider.WHATSAPP_OFFICIAL,
        "evolution_api": WhatsAppProvider.EVOLUTION_API
    }
    
    return provider_map.get(provider_str.lower(), WhatsAppProvider.ZAPI)
