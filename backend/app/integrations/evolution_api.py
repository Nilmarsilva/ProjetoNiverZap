import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

class EvolutionAPIConnector:
    """
    Conector para a Evolution API (https://github.com/evolution-api/evolution-api)
    """
    
    def __init__(self):
        self.base_url = settings.EVOLUTION_API_URL
        self.headers = {
            "Content-Type": "application/json",
            "apikey": settings.EVOLUTION_API_KEY
        }
        self.instance_name = "niverzap"  # Nome padrão da instância
    
    async def send_text_message(self, phone: str, message: str) -> Dict[str, Any]:
        """
        Envia uma mensagem de texto via Evolution API
        
        Args:
            phone: Número de telefone no formato 5511999999999
            message: Texto da mensagem a ser enviada
            
        Returns:
            Resposta da API
        """
        url = f"{self.base_url}/message/sendText/{self.instance_name}"
        payload = {
            "number": phone,
            "options": {
                "delay": 1200,
                "presence": "composing"
            },
            "textMessage": {
                "text": message
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            return response.json()
    
    async def send_template_message(self, phone: str, template: str, params: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Envia uma mensagem baseada em template via Evolution API
        
        Args:
            phone: Número de telefone no formato 5511999999999
            template: Texto do template com placeholders {nome}, {data}, etc.
            params: Dicionário com os parâmetros para substituir no template
            
        Returns:
            Resposta da API
        """
        message = template
        if params:
            for key, value in params.items():
                placeholder = "{" + key + "}"
                message = message.replace(placeholder, value)
        
        return await self.send_text_message(phone, message)
    
    async def create_instance(self, instance_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Cria uma nova instância do WhatsApp
        
        Args:
            instance_name: Nome da instância (opcional)
            
        Returns:
            Resposta da API
        """
        if instance_name:
            self.instance_name = instance_name
            
        url = f"{self.base_url}/instance/create"
        payload = {
            "instanceName": self.instance_name,
            "webhook": f"{settings.API_V1_STR}/notificacoes/webhook/evolution",
            "webhook_by_events": True,
            "events": [
                "QRCODE_UPDATED",
                "MESSAGES_UPSERT",
                "MESSAGES_UPDATE",
                "CONNECTION_UPDATE"
            ]
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            return response.json()
    
    async def get_qr_code(self) -> Dict[str, Any]:
        """
        Obtém o QR Code para conexão com o WhatsApp
        
        Returns:
            Dados do QR Code
        """
        url = f"{self.base_url}/instance/connect/{self.instance_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
    
    async def check_connection_status(self) -> Dict[str, Any]:
        """
        Verifica o status da conexão com o WhatsApp
        
        Returns:
            Status da conexão
        """
        url = f"{self.base_url}/instance/connectionState/{self.instance_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
    
    async def logout(self) -> Dict[str, Any]:
        """
        Desconecta a instância do WhatsApp
        
        Returns:
            Resposta da API
        """
        url = f"{self.base_url}/instance/logout/{self.instance_name}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
