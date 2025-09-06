from typing import Optional, List, Dict, Any
from datetime import datetime

from app.db.database import get_db_connection
from app.core.security import get_password_hash, verify_password
from app.models.user import UserCreate, UserUpdate, UserInDB, User

class UserService:
    """Serviço para gerenciar usuários no PostgreSQL"""
    
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
        async with await get_db_connection() as conn:
            # Verificar se o email já está em uso
            existing_user = await conn.fetchrow(
                "SELECT id FROM users WHERE email = $1", user_in.email
            )
            if existing_user:
                raise ValueError(f"Email já está em uso: {user_in.email}")
            
            # Criar usuário
            hashed_password = get_password_hash(user_in.password)
            
            user_id = await conn.fetchval(
                """
                INSERT INTO users (email, full_name, hashed_password, is_active, whatsapp_provider)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
                """,
                user_in.email,
                user_in.full_name,
                hashed_password,
                user_in.is_active,
                "zapi"  # Provedor padrão
            )
            
            # Buscar o usuário criado
            user_data = await conn.fetchrow(
                "SELECT * FROM users WHERE id = $1", user_id
            )
            
            return User(
                id=str(user_data['id']),
                email=user_data['email'],
                full_name=user_data['full_name'],
                is_active=user_data['is_active'],
                plan_id=user_data.get('plan_id'),
                whatsapp_provider=user_data['whatsapp_provider'],
                whatsapp_config=user_data['whatsapp_config'],
                created_at=user_data['created_at'],
                updated_at=user_data['updated_at']
            )
    
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
        async with await get_db_connection() as conn:
            user_data = await conn.fetchrow(
                "SELECT * FROM users WHERE email = $1", email
            )
            if not user_data:
                return None
            
            if not verify_password(password, user_data['hashed_password']):
                return None
            
            if not user_data['is_active']:
                return None
            
            return User(
                id=str(user_data['id']),
                email=user_data['email'],
                full_name=user_data['full_name'],
                is_active=user_data['is_active'],
                plan_id=user_data.get('plan_id'),
                whatsapp_provider=user_data['whatsapp_provider'],
                whatsapp_config=user_data['whatsapp_config'],
                created_at=user_data['created_at'],
                updated_at=user_data['updated_at']
            )
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """
        Obtém um usuário pelo ID
        
        Args:
            user_id: ID do usuário
            
        Returns:
            Usuário ou None se não encontrado
        """
        async with await get_db_connection() as conn:
            user_data = await conn.fetchrow(
                "SELECT * FROM users WHERE id = $1", user_id
            )
            if not user_data:
                return None
            
            return User(
                id=str(user_data['id']),
                email=user_data['email'],
                full_name=user_data['full_name'],
                is_active=user_data['is_active'],
                plan_id=user_data.get('plan_id'),
                whatsapp_provider=user_data['whatsapp_provider'],
                whatsapp_config=user_data['whatsapp_config'],
                created_at=user_data['created_at'],
                updated_at=user_data['updated_at']
            )
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """
        Obtém um usuário pelo email
        
        Args:
            email: Email do usuário
            
        Returns:
            Usuário ou None se não encontrado
        """
        async with await get_db_connection() as conn:
            user_data = await conn.fetchrow(
                "SELECT * FROM users WHERE email = $1", email
            )
            if not user_data:
                return None
            
            return User(
                id=str(user_data['id']),
                email=user_data['email'],
                full_name=user_data['full_name'],
                is_active=user_data['is_active'],
                plan_id=user_data.get('plan_id'),
                whatsapp_provider=user_data['whatsapp_provider'],
                whatsapp_config=user_data['whatsapp_config'],
                created_at=user_data['created_at'],
                updated_at=user_data['updated_at']
            )
    
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
        async with await get_db_connection() as conn:
            # Verificar se o usuário existe
            existing_user = await conn.fetchrow(
                "SELECT * FROM users WHERE id = $1", user_id
            )
            if not existing_user:
                raise ValueError(f"Usuário não encontrado: {user_id}")
            
            # Preparar dados para atualização
            update_data = user_in.dict(exclude_unset=True)
            
            # Se a senha for atualizada, hash ela
            if "password" in update_data:
                update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
            
            # Construir query de atualização dinamicamente
            set_clauses = []
            values = []
            param_count = 1
            
            for key, value in update_data.items():
                set_clauses.append(f"{key} = ${param_count}")
                values.append(value)
                param_count += 1
            
            # Adicionar updated_at
            set_clauses.append(f"updated_at = ${param_count}")
            values.append(datetime.utcnow())
            param_count += 1
            
            # Adicionar user_id para WHERE
            values.append(user_id)
            
            query = f"""
                UPDATE users 
                SET {', '.join(set_clauses)}
                WHERE id = ${param_count}
                RETURNING *
            """
            
            user_data = await conn.fetchrow(query, *values)
            
            if not user_data:
                raise ValueError("Erro ao atualizar usuário")
            
            return User(
                id=str(user_data['id']),
                email=user_data['email'],
                full_name=user_data['full_name'],
                is_active=user_data['is_active'],
                plan_id=user_data.get('plan_id'),
                whatsapp_provider=user_data['whatsapp_provider'],
                whatsapp_config=user_data['whatsapp_config'],
                created_at=user_data['created_at'],
                updated_at=user_data['updated_at']
            )
    
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
        async with await get_db_connection() as conn:
            # Verificar se o usuário existe
            existing_user = await conn.fetchrow(
                "SELECT id FROM users WHERE id = $1", user_id
            )
            if not existing_user:
                raise ValueError(f"Usuário não encontrado: {user_id}")
            
            # Desativar usuário
            result = await conn.fetchrow(
                """
                UPDATE users 
                SET is_active = FALSE, updated_at = $1
                WHERE id = $2
                RETURNING id
                """,
                datetime.utcnow(),
                user_id
            )
            
            if not result:
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
        async with await get_db_connection() as conn:
            # Obter usuário com seu plano
            user_data = await conn.fetchrow(
                """
                SELECT u.*, p.* FROM users u 
                LEFT JOIN plans p ON u.plan_id = p.id 
                WHERE u.id = $1
                """, 
                user_id
            )
            if not user_data:
                raise ValueError(f"Usuário não encontrado: {user_id}")
            
            plan_data = {
                "id": user_data.get("plan_id"),
                "name": user_data.get("name"),
                "description": user_data.get("description"),
                "type": user_data.get("type"),
                "price": user_data.get("price"),
                "message_limit": user_data.get("message_limit")
            }
            
            return plan_data
