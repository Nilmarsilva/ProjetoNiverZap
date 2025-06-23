from enum import Enum
from typing import Union, Dict, Any

from app.integrations.zapi import ZAPIConnector
from app.integrations.whatsapp_official import WhatsAppOfficialConnector
from app.integrations.evolution_api import EvolutionAPIConnector

class WhatsAppProvider(str, Enum):
    ZAPI = "zapi"
    OFFICIAL = "official"
    EVOLUTION = "evolution"

class WhatsAppConnectorFactory:
    """
    Fábrica para criar conectores de WhatsApp baseados no provedor escolhido
    """
    
    @staticmethod
    def get_connector(provider: WhatsAppProvider) -> Union[ZAPIConnector, WhatsAppOfficialConnector, EvolutionAPIConnector]:
        """
        Retorna o conector apropriado baseado no provedor
        
        Args:
            provider: Tipo de provedor de WhatsApp
            
        Returns:
            Instância do conector apropriado
            
        Raises:
            ValueError: Se o provedor não for suportado
        """
        if provider == WhatsAppProvider.ZAPI:
            return ZAPIConnector()
        elif provider == WhatsAppProvider.OFFICIAL:
            return WhatsAppOfficialConnector()
        elif provider == WhatsAppProvider.EVOLUTION:
            return EvolutionAPIConnector()
        else:
            raise ValueError(f"Provedor não suportado: {provider}")
    
    @staticmethod
    async def send_message(
        provider: WhatsAppProvider, 
        phone: str, 
        message: str
    ) -> Dict[str, Any]:
        """
        Envia uma mensagem usando o provedor especificado
        
        Args:
            provider: Tipo de provedor de WhatsApp
            phone: Número de telefone no formato 5511999999999
            message: Texto da mensagem a ser enviada
            
        Returns:
            Resposta da API
        """
        connector = WhatsAppConnectorFactory.get_connector(provider)
        return await connector.send_text_message(phone, message)
    
    @staticmethod
    async def send_template_message(
        provider: WhatsAppProvider,
        phone: str,
        template: str,
        params: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """
        Envia uma mensagem de template usando o provedor especificado
        
        Args:
            provider: Tipo de provedor de WhatsApp
            phone: Número de telefone no formato 5511999999999
            template: Template ou nome do template
            params: Parâmetros para o template
            
        Returns:
            Resposta da API
        """
        connector = WhatsAppConnectorFactory.get_connector(provider)
        
        # Tratamento especial para API oficial que usa formato diferente
        if provider == WhatsAppProvider.OFFICIAL:
            components = []
            if params:
                body_params = []
                for value in params.values():
                    body_params.append({"type": "text", "text": value})
                
                if body_params:
                    components.append({
                        "type": "body",
                        "parameters": body_params
                    })
            
            return await connector.send_template_message(
                phone=phone,
                template_name=template,
                components=components if components else None
            )
        else:
            # Para Z-API e Evolution API
            return await connector.send_template_message(phone, template, params)
