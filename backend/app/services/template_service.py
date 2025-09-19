from typing import Optional, List, Dict, Any
from datetime import datetime

from app.db.database import get_db_connection
from app.models.template import TemplateCreate, TemplateUpdate, Template, TemplateList

class TemplateService:
    """Serviço para gerenciar templates de mensagem no PostgreSQL"""
    
    @staticmethod
    async def create_template(user_id: str, template_in: TemplateCreate) -> Template:
        """
        Cria um novo template
        
        Args:
            user_id: ID do usuário proprietário do template
            template_in: Dados do template a ser criado
            
        Returns:
            Template criado
        """
        async with await get_db_connection() as conn:
            data = template_in.dict()
            template_id = await conn.fetchval(
                """
                INSERT INTO templates (user_id, name, content, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, TRUE, $4, $4)
                RETURNING id
                """,
                user_id,
                data["name"],
                data["content"],
                datetime.utcnow()
            )
            row = await conn.fetchrow("SELECT * FROM templates WHERE id=$1", template_id)
            return Template(**dict(row))
    
    @staticmethod
    async def get_template(user_id: str, template_id: str) -> Optional[Template]:
        """
        Obtém um template pelo ID
        
        Args:
            user_id: ID do usuário proprietário do template
            template_id: ID do template
            
        Returns:
            Template ou None se não encontrado
        """
        async with await get_db_connection() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM templates WHERE id=$1 AND user_id=$2 AND is_active=TRUE",
                template_id,
                user_id
            )
            if not row:
                return None
            return Template(**dict(row))
    
    @staticmethod
    async def get_templates(user_id: str, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> TemplateList:
        """
        Obtém a lista de templates de um usuário
        
        Args:
            user_id: ID do usuário proprietário dos templates
            skip: Número de registros para pular
            limit: Número máximo de registros para retornar
            search: Termo de busca opcional
            
        Returns:
            Lista de templates
        """
        async with await get_db_connection() as conn:
            where = ["user_id=$1", "is_active=TRUE"]
            params = [user_id]
            if search:
                where.append("(name ILIKE $2 OR content ILIKE $2)")
                params.append(f"%{search}%")
            where_sql = " AND ".join(where)
            query_sql = f"SELECT * FROM templates WHERE {where_sql} ORDER BY name OFFSET {skip} LIMIT {limit}"
            rows = await conn.fetch(query_sql, *params)
            count_sql = f"SELECT COUNT(*) FROM templates WHERE {where_sql}"
            total = await conn.fetchval(count_sql, *params)
            templates = [Template(**dict(r)) for r in rows]
            return TemplateList(templates=templates, total=total)
    
    @staticmethod
    async def update_template(user_id: str, template_id: str, template_in: TemplateUpdate) -> Template:
        """
        Atualiza um template
        
        Args:
            user_id: ID do usuário proprietário do template
            template_id: ID do template
            template_in: Dados a serem atualizados
            
        Returns:
            Template atualizado
            
        Raises:
            ValueError: Se o template não for encontrado
        """
        async with await get_db_connection() as conn:
            exists = await conn.fetchrow(
                "SELECT id FROM templates WHERE id=$1 AND user_id=$2 AND is_active=TRUE",
                template_id,
                user_id
            )
            if not exists:
                raise ValueError(f"Template não encontrado: {template_id}")
            data = template_in.dict(exclude_unset=True)
            data["updated_at"] = datetime.utcnow()
            set_parts = []
            values = []
            idx = 1
            for k, v in data.items():
                set_parts.append(f"{k}=${idx}")
                values.append(v)
                idx += 1
            values.extend([template_id, user_id])
            set_sql = ", ".join(set_parts)
            query = f"UPDATE templates SET {set_sql} WHERE id=${idx} AND user_id=${idx+1} RETURNING *"
            row = await conn.fetchrow(query, *values)
            return Template(**dict(row))
    
    @staticmethod
    async def delete_template(user_id: str, template_id: str) -> bool:
        """
        Remove um template (soft delete)
        
        Args:
            user_id: ID do usuário proprietário do template
            template_id: ID do template
            
        Returns:
            True se o template foi removido com sucesso
            
        Raises:
            ValueError: Se o template não for encontrado
        """
        async with await get_db_connection() as conn:
            row = await conn.fetchrow(
                "UPDATE templates SET is_active=FALSE, updated_at=$1 WHERE id=$2 AND user_id=$3 RETURNING id",
                datetime.utcnow(),
                template_id,
                user_id
            )
            if not row:
                raise ValueError(f"Template não encontrado: {template_id}")
            return True
