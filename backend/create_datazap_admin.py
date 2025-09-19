import os
import asyncio
import asyncpg
from datetime import datetime
from passlib.context import CryptContext
from dotenv import load_dotenv

# Carrega as variáveis de ambiente
load_dotenv()

# Configuração para hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """
    Cria um hash da senha
    """
    return pwd_context.hash(password)

async def get_db_connection():
    """
    Cria uma conexão com o banco de dados PostgreSQL
    """
    # Usar as credenciais corretas do arquivo .env
    db_host = "postgres"  # Nome do serviço no docker-compose
    db_port = "5432"
    db_name = "niverzap"
    db_user = "niverzap"
    db_password = "1TGY8BaXxUtwk74QLqJz65cf0REpvOVg"
    
    connection_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    return await asyncpg.connect(connection_string)

async def create_admin_user(email: str, password: str, full_name: str, is_admin: bool = True):
    """
    Cria um usuário administrador no sistema
    
    Args:
        email: Email do usuário
        password: Senha do usuário
        full_name: Nome completo do usuário
        is_admin: Se o usuário é administrador
    """
    try:
        # Conectar ao banco de dados
        conn = await get_db_connection()
        print("Conectado ao banco de dados PostgreSQL")
        
        # Verificar se o usuário já existe
        user = await conn.fetchrow("SELECT * FROM users WHERE email = $1", email)
        
        if user:
            print(f"\nUsuário com email {email} já existe!")
            
            # Atualizar o usuário para garantir que ele seja admin e esteja ativo
            hashed_password = get_password_hash(password)
            
            await conn.execute(
                """
                UPDATE users 
                SET hashed_password = $1, is_active = TRUE, updated_at = $2
                WHERE email = $3
                """,
                hashed_password, datetime.utcnow(), email
            )
            
            print("\nUsuário administrador atualizado com sucesso!")
            print(f"Email: {email}")
            print(f"Nome: {full_name}")
        else:
            # Gerar o hash da senha
            hashed_password = get_password_hash(password)
            
            # Obter o primeiro plano disponível
            plan = await conn.fetchrow("SELECT id FROM plans LIMIT 1")
            plan_id = plan["id"] if plan else None
            
            # Criar o usuário
            user_id = await conn.fetchval(
                """
                INSERT INTO users (
                    email, full_name, hashed_password, is_active, 
                    whatsapp_provider, created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $6)
                RETURNING id
                """,
                email, full_name, hashed_password, True, 
                "zapi", datetime.utcnow()
            )
            
            print("\nUsuário administrador criado com sucesso!")
            print(f"Email: {email}")
            print(f"Nome: {full_name}")
            print(f"ID: {user_id}")
        
        # Fechar a conexão
        await conn.close()
        return True
    except Exception as e:
        print(f"\nErro ao criar usuário administrador: {e}")
        return False

async def main():
    # Dados do usuário administrador DataZap
    admin_email = "admin@datazap.com"
    admin_password = "123456"
    admin_name = "Administrador DataZap"
    
    # Criar o usuário administrador
    await create_admin_user(admin_email, admin_password, admin_name, is_admin=True)
    
    # Criar também o usuário admin@niverzap.com para compatibilidade
    await create_admin_user("admin@niverzap.com", "Admin@123", "Administrador NiverZap", is_admin=True)

if __name__ == "__main__":
    asyncio.run(main())
