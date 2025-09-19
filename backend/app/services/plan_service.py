from typing import Optional, List, Dict, Any
from datetime import datetime

from app.db.database import get_db_connection
from app.models.plan import PlanCreate, PlanUpdate, Plan, PlanList, PlanType

class PlanService:
    """Serviço para gerenciar planos de assinatura no PostgreSQL"""
    
    @staticmethod
    async def create_plan(plan_in: PlanCreate) -> Plan:
        """
        Cria um novo plano
        
        Args:
            plan_in: Dados do plano a ser criado
            
        Returns:
            Plano criado
        """
        async with await get_db_connection() as conn:
            plan_data = plan_in.dict()
            plan_id = await conn.fetchval(
                """
                INSERT INTO plans (name, description, type, price, message_limit, allowed_providers, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, $7)
                RETURNING id
                """,
                plan_data["name"],
                plan_data["description"],
                plan_data["type"],
                plan_data["price"],
                plan_data["message_limit"],
                plan_data["allowed_providers"],
                datetime.utcnow()
            )
            row = await conn.fetchrow("SELECT * FROM plans WHERE id=$1", plan_id)
            return Plan(**dict(row))
    
    @staticmethod
    async def get_plan(plan_id: int) -> Optional[Plan]:
        """
        Obtém um plano pelo ID
        
        Args:
            plan_id: ID do plano
            
        Returns:
            Plano ou None se não encontrado
        """
        async with await get_db_connection() as conn:
            row = await conn.fetchrow("SELECT * FROM plans WHERE id=$1 AND is_active=TRUE", plan_id)
            if not row:
                return None
            return Plan(**dict(row))
    
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
        async with await get_db_connection() as conn:
            rows = await conn.fetch(
                "SELECT * FROM plans WHERE is_active=TRUE ORDER BY price OFFSET $1 LIMIT $2",
                skip,
                limit
            )
            total = await conn.fetchval("SELECT COUNT(*) FROM plans WHERE is_active=TRUE")
            plans = [Plan(**dict(r)) for r in rows]
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
        async with await get_db_connection() as conn:
            exists = await conn.fetchrow("SELECT id FROM plans WHERE id=$1 AND is_active=TRUE", plan_id)
            if not exists:
                raise ValueError(f"Plano não encontrado: {plan_id}")
            update_data = plan_in.dict(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow()
            set_parts = []
            values = []
            idx = 1
            for k, v in update_data.items():
                set_parts.append(f"{k}=${idx}")
                values.append(v)
                idx += 1
            values.append(plan_id)
            set_sql = ", ".join(set_parts)
            query = f"UPDATE plans SET {set_sql} WHERE id=${idx} RETURNING *"
            row = await conn.fetchrow(query, *values)
            return Plan(**dict(row))
    
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
        async with await get_db_connection() as conn:
            row = await conn.fetchrow(
                "UPDATE plans SET is_active=FALSE, updated_at=$1 WHERE id=$2 RETURNING id",
                datetime.utcnow(),
                plan_id
            )
            if not row:
                raise ValueError(f"Plano não encontrado: {plan_id}")
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
