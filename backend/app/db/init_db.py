import asyncio
import logging

from app.services.plan_service import PlanService
from app.models.plan import PlanCreate

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db() -> None:
    """
    Inicializa o banco de dados com dados padrão
    """
    logger.info("Inicializando banco de dados")
    
    # Criar planos padrão
    await create_default_plans()
    
    logger.info("Banco de dados inicializado com sucesso")

async def create_default_plans() -> None:
    """
    Cria os planos padrão
    """
    logger.info("Criando planos padrão")
    
    default_plans = await PlanService.get_default_plans()
    
    for plan_data in default_plans:
        try:
            plan_create = PlanCreate(**plan_data)
            await PlanService.create_plan(plan_create)
            logger.info(f"Plano criado: {plan_data['name']}")
        except Exception as e:
            logger.error(f"Erro ao criar plano {plan_data['name']}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(init_db())
