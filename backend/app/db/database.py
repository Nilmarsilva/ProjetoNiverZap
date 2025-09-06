import asyncpg
from typing import Optional
from app.core.config import settings

class DatabaseConnection:
    """Gerenciador de conexão com PostgreSQL"""
    
    _pool: Optional[asyncpg.Pool] = None
    
    @classmethod
    async def get_pool(cls) -> asyncpg.Pool:
        """Obtém o pool de conexões"""
        if cls._pool is None:
            cls._pool = await asyncpg.create_pool(
                host=settings.POSTGRES_HOST,
                port=settings.POSTGRES_PORT,
                user=settings.POSTGRES_USER,
                password=settings.POSTGRES_PASSWORD,
                database=settings.POSTGRES_DB,
                min_size=1,
                max_size=10
            )
        return cls._pool
    
    @classmethod
    async def close_pool(cls):
        """Fecha o pool de conexões"""
        if cls._pool:
            await cls._pool.close()
            cls._pool = None

async def get_db_connection():
    """Obtém uma conexão do pool"""
    pool = await DatabaseConnection.get_pool()
    return pool.acquire()
