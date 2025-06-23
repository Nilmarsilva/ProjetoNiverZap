import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

class ZAPIConnector:
    """
    Conector para a Z-API (https://developer.z-api.io/)
    """
    
    def __init__(self):
        self.base_url = f"https://api.z-api.io/instances/{settings.ZAPI_INSTANCE}/token/{settings.ZAPI_TOKEN}"
        self.headers = {
            "Content-Type": "application/json"
        }
    
    async def send_text_message(self, phone: str, message: str) -> Dict[str, Any]:
        """
        Envia uma mensagem de texto via Z-API
        
        Args:
            phone: Número de telefone no formato 5511999999999
            message: Texto da mensagem a ser enviada
            
        Returns:
            Resposta da API
        """
        url = f"{self.base_url}/send-text"
        payload = {
            "phone": phone,
            "message": message
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            return response.json()
    
    async def send_template_message(self, phone: str, template: str, params: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Envia uma mensagem baseada em template via Z-API
        
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
    
    async def check_connection_status(self) -> Dict[str, Any]:
        """
        Verifica o status da conexão com o WhatsApp
        
        Returns:
            Status da conexão
        """
        url = f"{self.base_url}/status"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
    
    async def get_qr_code(self) -> Dict[str, Any]:
        """
        Obtém o QR Code para conexão com o WhatsApp
        
        Returns:
            Dados do QR Code
        """
        url = f"{self.base_url}/qr-code"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
