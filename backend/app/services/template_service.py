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
        supabase = get_supabase_client()
        
        template_data = template_in.dict()
        template_data["user_id"] = user_id
        template_data["created_at"] = datetime.utcnow().isoformat()
        template_data["updated_at"] = datetime.utcnow().isoformat()
        
        response = supabase.table("templates").insert(template_data).execute()
        
        if not response.data:
            raise ValueError("Erro ao criar template")
        
        return Template(**response.data[0])
    
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
        supabase = get_supabase_client()
        
        response = supabase.table("templates").select("*").eq("id", template_id).eq("user_id", user_id).execute()
        if not response.data:
            return None
        
        return Template(**response.data[0])
    
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
        supabase = get_supabase_client()
        
        query = supabase.table("templates").select("*", count="exact").eq("user_id", user_id)
        
        if search:
            query = query.or_(f"name.ilike.%{search}%,content.ilike.%{search}%")
        
        response = query.order("name").range(skip, skip + limit - 1).execute()
        
        templates = [Template(**item) for item in response.data]
        total = response.count or 0
        
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
        supabase = get_supabase_client()
        
        # Verificar se o template existe e pertence ao usuário
        response = supabase.table("templates").select("*").eq("id", template_id).eq("user_id", user_id).execute()
        if not response.data:
            raise ValueError(f"Template não encontrado: {template_id}")
        
        # Preparar dados para atualização
        update_data = template_in.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Atualizar template
        response = supabase.table("templates").update(update_data).eq("id", template_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise ValueError("Erro ao atualizar template")
        
        return Template(**response.data[0])
    
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
        supabase = get_supabase_client()
        
        # Verificar se o template existe e pertence ao usuário
        response = supabase.table("templates").select("*").eq("id", template_id).eq("user_id", user_id).execute()
        if not response.data:
            raise ValueError(f"Template não encontrado: {template_id}")
        
        # Desativar template (soft delete)
        update_data = {
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("templates").update(update_data).eq("id", template_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise ValueError("Erro ao remover template")
        
        return True
