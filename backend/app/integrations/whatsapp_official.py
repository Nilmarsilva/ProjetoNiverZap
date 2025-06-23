import httpx
from typing import Dict, Any, Optional, List
from app.core.config import settings

class WhatsAppOfficialConnector:
    """
    Conector para a API Oficial do WhatsApp (Cloud API)
    https://developers.facebook.com/docs/whatsapp/cloud-api/
    """
    
    def __init__(self):
        self.base_url = f"https://graph.facebook.com/{settings.WHATSAPP_OFFICIAL_VERSION}/{settings.WHATSAPP_OFFICIAL_PHONE_ID}"
        self.headers = {
            "Authorization": f"Bearer {settings.WHATSAPP_OFFICIAL_TOKEN}",
            "Content-Type": "application/json"
        }
    
    async def send_text_message(self, phone: str, message: str) -> Dict[str, Any]:
        """
        Envia uma mensagem de texto via API Oficial do WhatsApp
        
        Args:
            phone: Número de telefone no formato 5511999999999
            message: Texto da mensagem a ser enviada
            
        Returns:
            Resposta da API
        """
        url = f"{self.base_url}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": message
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            return response.json()
    
    async def send_template_message(
        self, 
        phone: str, 
        template_name: str, 
        language_code: str = "pt_BR",
        components: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Envia uma mensagem baseada em template via API Oficial do WhatsApp
        
        Args:
            phone: Número de telefone no formato 5511999999999
            template_name: Nome do template registrado no WhatsApp Business
            language_code: Código do idioma do template
            components: Componentes do template (header, body, buttons)
            
        Returns:
            Resposta da API
        """
        url = f"{self.base_url}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": phone,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": language_code
                }
            }
        }
        
        if components:
            payload["template"]["components"] = components
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            return response.json()
    
    async def get_business_profile(self) -> Dict[str, Any]:
        """
        Obtém informações do perfil de negócios
        
        Returns:
            Dados do perfil
        """
        url = f"{self.base_url}"
        params = {
            "fields": "name,about,description,vertical"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=self.headers)
            response.raise_for_status()
            return response.json()
    
    async def mark_message_as_read(self, message_id: str) -> Dict[str, Any]:
        """
        Marca uma mensagem como lida
        
        Args:
            message_id: ID da mensagem a ser marcada como lida
            
        Returns:
            Resposta da API
        """
        url = f"{self.base_url}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            return response.json()
