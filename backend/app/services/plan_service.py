from typing import Optional, List, Dict, Any
from datetime import datetime

from app.db.supabase import get_supabase_client
from app.models.plan import PlanCreate, PlanUpdate, Plan, PlanList, PlanType

class PlanService:
    """Serviço para gerenciar planos de assinatura no Supabase"""
    
    @staticmethod
    async def create_plan(plan_in: PlanCreate) -> Plan:
        """
        Cria um novo plano
        
        Args:
            plan_in: Dados do plano a ser criado
            
        Returns:
            Plano criado
        """
        supabase = get_supabase_client()
        
        plan_data = plan_in.dict()
        plan_data["created_at"] = datetime.utcnow().isoformat()
        plan_data["updated_at"] = datetime.utcnow().isoformat()
        
        response = supabase.table("plans").insert(plan_data).execute()
        
        if not response.data:
            raise ValueError("Erro ao criar plano")
        
        return Plan(**response.data[0])
    
    @staticmethod
    async def get_plan(plan_id: int) -> Optional[Plan]:
        """
        Obtém um plano pelo ID
        
        Args:
            plan_id: ID do plano
            
        Returns:
            Plano ou None se não encontrado
        """
        supabase = get_supabase_client()
        
        response = supabase.table("plans").select("*").eq("id", plan_id).execute()
        if not response.data:
            return None
        
        return Plan(**response.data[0])
    
    @staticmethod
    async def get_plans(skip: int = 0, limit: int = 100) -> PlanList:
        """
        Obtém a lista de planos
        
        Args:
            skip: Número de registros para pular
            limit: Número máximo de registros para retornar
            
        Returns:
            Lista de planos
        """
        supabase = get_supabase_client()
        
        response = supabase.table("plans").select("*", count="exact").order("price").range(skip, skip + limit - 1).execute()
        
        plans = [Plan(**item) for item in response.data]
        total = response.count or 0
        
        return PlanList(plans=plans, total=total)
    
    @staticmethod
    async def update_plan(plan_id: int, plan_in: PlanUpdate) -> Plan:
        """
        Atualiza um plano
        
        Args:
            plan_id: ID do plano
            plan_in: Dados a serem atualizados
            
        Returns:
            Plano atualizado
            
        Raises:
            ValueError: Se o plano não for encontrado
        """
        supabase = get_supabase_client()
        
        # Verificar se o plano existe
        response = supabase.table("plans").select("*").eq("id", plan_id).execute()
        if not response.data:
            raise ValueError(f"Plano não encontrado: {plan_id}")
        
        # Preparar dados para atualização
        update_data = plan_in.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Atualizar plano
        response = supabase.table("plans").update(update_data).eq("id", plan_id).execute()
        
        if not response.data:
            raise ValueError("Erro ao atualizar plano")
        
        return Plan(**response.data[0])
    
    @staticmethod
    async def delete_plan(plan_id: int) -> bool:
        """
        Remove um plano (soft delete)
        
        Args:
            plan_id: ID do plano
            
        Returns:
            True se o plano foi removido com sucesso
            
        Raises:
            ValueError: Se o plano não for encontrado
        """
        supabase = get_supabase_client()
        
        # Verificar se o plano existe
        response = supabase.table("plans").select("*").eq("id", plan_id).execute()
        if not response.data:
            raise ValueError(f"Plano não encontrado: {plan_id}")
        
        # Desativar plano (soft delete)
        update_data = {
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("plans").update(update_data).eq("id", plan_id).execute()
        
        if not response.data:
            raise ValueError("Erro ao remover plano")
        
        return True
    
    @staticmethod
    async def get_default_plans() -> List[Dict[str, Any]]:
        """
        Obtém a lista de planos padrão para inicialização
        
        Returns:
            Lista de planos padrão
        """
        return [
            {
                "name": "Gratuito",
                "description": "Plano gratuito com limite de 10 mensagens por dia",
                "type": PlanType.FREE,
                "price": 0.0,
                "message_limit": 10,
                "allowed_providers": ["zapi"],
                "is_active": True
            },
            {
                "name": "Profissional",
                "description": "Plano profissional com limite de 100 mensagens por dia",
                "type": PlanType.PROFESSIONAL,
                "price": 29.90,
                "message_limit": 100,
                "allowed_providers": ["zapi", "evolution_api"],
                "is_active": True
            },
            {
                "name": "Avançado",
                "description": "Plano avançado com limite de 1000 mensagens por dia",
                "type": PlanType.ADVANCED,
                "price": 99.90,
                "message_limit": 1000,
                "allowed_providers": ["zapi", "evolution_api", "whatsapp_official"],
                "is_active": True
            }
        ]
