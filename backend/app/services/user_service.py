from typing import Optional, List, Dict, Any
from datetime import datetime

from app.db.supabase import get_supabase_client, get_supabase_admin_client, get_db_client
from app.core.security import get_password_hash, verify_password
from app.models.user import UserCreate, UserUpdate, UserInDB, User

class UserService:
    """Serviço para gerenciar usuários no Supabase"""
    
    @staticmethod
    async def create_user(user_in: UserCreate) -> User:
        """
        Cria um novo usuário
        
        Args:
            user_in: Dados do usuário a ser criado
            
        Returns:
            Usuário criado
            
        Raises:
            ValueError: Se o email já estiver em uso
        """
        supabase = get_db_client()
        
        # Verificar se o email já está em uso
        response = supabase.table("users").select("*").eq("email", user_in.email).execute()
        if response.data:
            raise ValueError(f"Email já está em uso: {user_in.email}")
        
        # Criar usuário
        hashed_password = get_password_hash(user_in.password)
        user_data = {
            "email": user_in.email,
            "full_name": user_in.full_name,
            "hashed_password": hashed_password,
            "is_active": user_in.is_active,
            "plan_id": 1,  # Plano gratuito por padrão
            "whatsapp_provider": "zapi",  # Provedor padrão
            "created_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("users").insert(user_data).execute()
        
        if not response.data:
            raise ValueError("Erro ao criar usuário")
        
        return User(**response.data[0])
    
    @staticmethod
    async def authenticate(email: str, password: str) -> Optional[User]:
        """
        Autentica um usuário
        
        Args:
            email: Email do usuário
            password: Senha do usuário
            
        Returns:
            Usuário autenticado ou None se a autenticação falhar
        """
        supabase = get_db_client()
        
        response = supabase.table("users").select("*").eq("email", email).execute()
        if not response.data:
            return None
        
        user = UserInDB(**response.data[0])
        
        if not verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active:
            return None
        
        return User(**response.data[0])
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """
        Obtém um usuário pelo ID
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Usuário ou None se não encontrado
        """
        supabase = get_db_client()
        
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        if not response.data:
            return None
        
        return User(**response.data[0])
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """
        Obtém um usuário pelo email
        
        Args:
            email: Email do usuário
            
        Returns:
            Usuário ou None se não encontrado
        """
        supabase = get_db_client()
        
        response = supabase.table("users").select("*").eq("email", email).execute()
        if not response.data:
            return None
        
        return User(**response.data[0])
    
    @staticmethod
    async def update_user(user_id: str, user_in: UserUpdate) -> User:
        """
        Atualiza um usuário
        
        Args:
            user_id: ID do usuário
            user_in: Dados a serem atualizados
            
        Returns:
            Usuário atualizado
            
        Raises:
            ValueError: Se o usuário não for encontrado
        """
        supabase = get_db_client()
        
        # Verificar se o usuário existe
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        if not response.data:
            raise ValueError(f"Usuário não encontrado: {user_id}")
        
        current_user = UserInDB(**response.data[0])
        
        # Preparar dados para atualização
        update_data = user_in.dict(exclude_unset=True)
        
        # Se a senha for atualizada, hash ela
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Atualizar usuário
        response = supabase.table("users").update(update_data).eq("id", user_id).execute()
        
        if not response.data:
            raise ValueError("Erro ao atualizar usuário")
        
        return User(**response.data[0])
    
    @staticmethod
    async def delete_user(user_id: str) -> bool:
        """
        Desativa um usuário (soft delete)
        
        Args:
            user_id: ID do usuário
            
        Returns:
            True se o usuário foi desativado com sucesso
            
        Raises:
            ValueError: Se o usuário não for encontrado
        """
        supabase = get_db_client()
        
        # Verificar se o usuário existe
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        if not response.data:
            raise ValueError(f"Usuário não encontrado: {user_id}")
        
        # Desativar usuário
        update_data = {
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        }
        
        response = supabase.table("users").update(update_data).eq("id", user_id).execute()
        
        if not response.data:
            raise ValueError("Erro ao desativar usuário")
        
        return True
    
    @staticmethod
    async def get_user_plan(user_id: str) -> Dict[str, Any]:
        """
        Obtém o plano de um usuário
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Dados do plano do usuário
            
        Raises:
            ValueError: Se o usuário não for encontrado
        """
        supabase = get_db_client()
        
        # Obter usuário com seu plano
        response = supabase.table("users").select("*, plans(*)").eq("id", user_id).execute()
        if not response.data:
            raise ValueError(f"Usuário não encontrado: {user_id}")
        
        user_data = response.data[0]
        plan_data = user_data.get("plans", {})
        
        return plan_data
