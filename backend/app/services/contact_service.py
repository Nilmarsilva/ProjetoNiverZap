from typing import Optional, List, Dict, Any
from datetime import datetime, date

from app.db.database import get_db_connection
from app.models.contact import ContactCreate, ContactUpdate, Contact, ContactList

class ContactService:
    """Serviço para gerenciar contatos no PostgreSQL"""
    
    @staticmethod
    async def create_contact(user_id: str, contact_in: ContactCreate) -> Contact:
        """
        Cria um novo contato
        
        Args:
            user_id: ID do usuário proprietário do contato
            contact_in: Dados do contato a ser criado
            
        Returns:
            Contato criado
        """
        supabase = get_supabase_client()
        
        contact_data = contact_in.dict()
        contact_data["user_id"] = user_id
        contact_data["created_at"] = datetime.utcnow().isoformat()
        contact_data["updated_at"] = datetime.utcnow().isoformat()
        contact_data["birthday"] = contact_data["birthday"].isoformat()
        
        response = supabase.table("contacts").insert(contact_data).execute()
        
        if not response.data:
            raise ValueError("Erro ao criar contato")
        
        return Contact(**response.data[0])
    
    @staticmethod
    async def get_contact(user_id: str, contact_id: str) -> Optional[Contact]:
        """
        Obtém um contato pelo ID
        
        Args:
            user_id: ID do usuário proprietário do contato
            contact_id: ID do contato
            
        Returns:
            Contato ou None se não encontrado
        """
        supabase = get_supabase_client()
        
        response = supabase.table("contacts").select("*").eq("id", contact_id).eq("user_id", user_id).execute()
        if not response.data:
            return None
        
        return Contact(**response.data[0])
    
    @staticmethod
    async def get_contacts(user_id: str, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> ContactList:
        """
        Obtém a lista de contatos de um usuário
        
        Args:
            user_id: ID do usuário proprietário dos contatos
            skip: Número de registros para pular
            limit: Número máximo de registros para retornar
            search: Termo de busca opcional
            
        Returns:
            Lista de contatos
        """
        supabase = get_supabase_client()
        
        query = supabase.table("contacts").select("*", count="exact").eq("user_id", user_id)
        
        if search:
            query = query.or_(f"name.ilike.%{search}%,phone.ilike.%{search}%")
        
        response = query.order("name").range(skip, skip + limit - 1).execute()
        
        contacts = [Contact(**item) for item in response.data]
        total = response.count or 0
        
        return ContactList(contacts=contacts, total=total)
    
    @staticmethod
    async def update_contact(user_id: str, contact_id: str, contact_in: ContactUpdate) -> Contact:
        """
        Atualiza um contato
        
        Args:
            user_id: ID do usuário proprietário do contato
            contact_id: ID do contato
            contact_in: Dados a serem atualizados
            
        Returns:
            Contato atualizado
            
        Raises:
            ValueError: Se o contato não for encontrado
        """
        supabase = get_supabase_client()
        
        # Verificar se o contato existe e pertence ao usuário
        response = supabase.table("contacts").select("*").eq("id", contact_id).eq("user_id", user_id).execute()
        if not response.data:
            raise ValueError(f"Contato não encontrado: {contact_id}")
        
        # Preparar dados para atualização
        update_data = contact_in.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Converter data de aniversário para string ISO se presente
        if "birthday" in update_data and isinstance(update_data["birthday"], date):
            update_data["birthday"] = update_data["birthday"].isoformat()
        
        # Atualizar contato
        response = supabase.table("contacts").update(update_data).eq("id", contact_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise ValueError("Erro ao atualizar contato")
        
        return Contact(**response.data[0])
    
    @staticmethod
    async def delete_contact(user_id: str, contact_id: str) -> bool:
        """
        Remove um contato (soft delete)
        
        Args:
            user_id: ID do usuário proprietário do contato
            contact_id: ID do contato
            
        Returns:
            True se o contato foi removido com sucesso
            
        Raises:
            ValueError: Se o contato não for encontrado
        """
        supabase = get_supabase_client()
        
        # Verificar se o contato existe e pertence ao usuário
        response = supabase.table("contacts").select("*").eq("id", contact_id).eq("user_id", user_id).execute()
        if not response.data:
            raise ValueError(f"Contato não encontrado: {contact_id}")
        
        # Desativar contato (soft delete)
        update_data = {
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("contacts").update(update_data).eq("id", contact_id).eq("user_id", user_id).execute()
        
        if not response.data:
            raise ValueError("Erro ao remover contato")
        
        return True
    
    @staticmethod
    async def get_birthdays_today(date_today: date) -> List[Dict[str, Any]]:
        """
        Obtém a lista de contatos que fazem aniversário hoje
        
        Args:
            date_today: Data de hoje
            
        Returns:
            Lista de contatos com aniversário hoje
        """
        supabase = get_supabase_client()
        
        # Extrair mês e dia da data de hoje
        month = date_today.month
        day = date_today.day
        
        # Buscar contatos com aniversário hoje
        # Nota: Esta é uma consulta específica para PostgreSQL que extrai mês e dia da data
        query = f"""
        SELECT c.*, u.email as user_email, u.whatsapp_provider, u.plan_id, p.message_limit, p.allowed_providers
        FROM contacts c
        JOIN users u ON c.user_id = u.id
        JOIN plans p ON u.plan_id = p.id
        WHERE 
            EXTRACT(MONTH FROM c.birthday::date) = {month} AND 
            EXTRACT(DAY FROM c.birthday::date) = {day} AND
            c.is_active = true AND
            u.is_active = true
        """
        
        response = supabase.rpc("run_sql", {"query": query}).execute()
        
        if not response.data:
            return []
        
        return response.data
