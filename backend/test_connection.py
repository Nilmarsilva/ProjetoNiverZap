import os
import sys
import asyncio
import logging
from datetime import datetime

# Adicionar o diretório raiz ao PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.supabase import get_supabase_client
from app.core.config import settings
import redis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_supabase_connection():
    """Testa a conexão com o Supabase"""
    try:
        logger.info("Testando conexão com o Supabase...")
        supabase = get_supabase_client()
        
        # Tenta executar uma consulta simples
        response = supabase.table("plans").select("count", count="exact").execute()
        count = response.count or 0
        
        logger.info(f"Conexão com Supabase bem-sucedida. Número de planos: {count}")
        return True
    except Exception as e:
        logger.error(f"Erro ao conectar com Supabase: {str(e)}")
        return False

def test_redis_connection():
    """Testa a conexão com o Redis"""
    try:
        logger.info("Testando conexão com o Redis...")
        redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True
        )
        
        # Tenta definir e obter um valor
        test_key = "test_connection"
        test_value = f"Connection test at {datetime.now().isoformat()}"
        
        redis_client.set(test_key, test_value)
        retrieved_value = redis_client.get(test_key)
        
        if retrieved_value == test_value:
            logger.info("Conexão com Redis bem-sucedida")
            return True
        else:
            logger.error(f"Erro ao verificar valor no Redis. Esperado: {test_value}, Obtido: {retrieved_value}")
            return False
    except Exception as e:
        logger.error(f"Erro ao conectar com Redis: {str(e)}")
        return False

async def main():
    """Função principal para testar as conexões"""
    supabase_ok = await test_supabase_connection()
    redis_ok = test_redis_connection()
    
    if supabase_ok and redis_ok:
        logger.info("Todas as conexões estão funcionando corretamente!")
        return 0
    else:
        logger.error("Há problemas com as conexões. Verifique as configurações.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
