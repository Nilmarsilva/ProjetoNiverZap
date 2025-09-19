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
        async with await get_db_connection() as conn:
            contact_data = contact_in.dict()
            contact_id = await conn.fetchval(
                """
                INSERT INTO contacts (user_id, name, phone, birthday, is_active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, TRUE, $5, $5)
                RETURNING id
                """,
                user_id,
                contact_data["name"],
                contact_data["phone"],
                contact_data["birthday"],
                datetime.utcnow()
            )
            row = await conn.fetchrow("SELECT * FROM contacts WHERE id=$1", contact_id)
            row_dict = dict(row)
            # Garantir que o id seja uma string
            row_dict['id'] = str(row_dict['id'])
            return Contact(**row_dict)
    
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
        async with await get_db_connection() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM contacts WHERE id=$1 AND user_id=$2 AND is_active=TRUE",
                contact_id,
                user_id
            )
            if not row:
                return None
            row_dict = dict(row)
            # Garantir que o id seja uma string
            row_dict['id'] = str(row_dict['id'])
            return Contact(**row_dict)
    
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
        async with await get_db_connection() as conn:
            where_clauses = ["user_id=$1", "is_active=TRUE"]
            params = [user_id]
            if search:
                where_clauses.append("(name ILIKE $2 OR phone ILIKE $2)")
                params.append(f"%{search}%")
            where_sql = " AND ".join(where_clauses)

            query_sql = f"SELECT * FROM contacts WHERE {where_sql} ORDER BY name OFFSET {skip} LIMIT {limit}"
            rows = await conn.fetch(query_sql, *params)
            count_sql = f"SELECT COUNT(*) FROM contacts WHERE {where_sql}"
            total = await conn.fetchval(count_sql, *params)
            contacts = []
            for r in rows:
                row_dict = dict(r)
                # Garantir que o id seja uma string
                row_dict['id'] = str(row_dict['id'])
                contacts.append(Contact(**row_dict))
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
        async with await get_db_connection() as conn:
            existing = await conn.fetchrow(
                "SELECT id FROM contacts WHERE id=$1 AND user_id=$2 AND is_active=TRUE",
                contact_id,
                user_id
            )
            if not existing:
                raise ValueError(f"Contato não encontrado: {contact_id}")
            update_data = contact_in.dict(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow()
            set_parts = []
            values = []
            idx = 1
            for k, v in update_data.items():
                set_parts.append(f"{k}=${idx}")
                values.append(v)
                idx += 1
            values.extend([contact_id, user_id])
            set_sql = ", ".join(set_parts)
            query = f"UPDATE contacts SET {set_sql} WHERE id=${idx} AND user_id=${idx+1} RETURNING *"
            row = await conn.fetchrow(query, *values)
            row_dict = dict(row)
            # Garantir que o id seja uma string
            row_dict['id'] = str(row_dict['id'])
            return Contact(**row_dict)
    
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
        async with await get_db_connection() as conn:
            row = await conn.fetchrow(
                "UPDATE contacts SET is_active=FALSE, updated_at=$1 WHERE id=$2 AND user_id=$3 RETURNING id",
                datetime.utcnow(),
                contact_id,
                user_id
            )
            if not row:
                raise ValueError(f"Contato não encontrado: {contact_id}")
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
        async with await get_db_connection() as conn:
            month = date_today.month
            day = date_today.day
            rows = await conn.fetch(
                """
                SELECT c.*, u.email as user_email, u.whatsapp_provider, u.plan_id, p.message_limit, p.allowed_providers
                FROM contacts c
                JOIN users u ON c.user_id = u.id
                JOIN plans p ON u.plan_id = p.id
                WHERE 
                    EXTRACT(MONTH FROM c.birthday) = $1 AND 
                    EXTRACT(DAY FROM c.birthday) = $2 AND
                    c.is_active = TRUE AND
                    u.is_active = TRUE
                """,
                month,
                day
            )
            return [dict(r) for r in rows]
