import asyncio
import asyncpg
from passlib.context import CryptContext

# Configuração para hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def test_authentication():
    conn = await asyncpg.connect('postgresql://niverzap:1TGY8BaXxUtwk74QLqJz65cf0REpvOVg@postgres:5432/niverzap')
    
    # Testar autenticação do usuário admin@datazap.com
    print("\nTestando autenticação para admin@datazap.com...")
    user_data = await conn.fetchrow("SELECT * FROM users WHERE email = 'admin@datazap.com'")
    
    if user_data:
        password_valid = verify_password("123456", user_data['hashed_password'])
        print(f"Senha válida: {password_valid}")
        if password_valid:
            print("Autenticação bem-sucedida!")
            print(f"ID: {user_data['id']}")
            print(f"Email: {user_data['email']}")
            print(f"Nome: {user_data['full_name']}")
            print(f"Ativo: {user_data['is_active']}")
            print(f"Admin: {user_data.get('is_admin', 'Coluna não existe')}")
        else:
            print("Senha incorreta!")
    else:
        print("Usuário não encontrado!")
    
    # Testar autenticação do usuário admin@niverzap.com
    print("\nTestando autenticação para admin@niverzap.com...")
    user_data = await conn.fetchrow("SELECT * FROM users WHERE email = 'admin@niverzap.com'")
    
    if user_data:
        password_valid = verify_password("Admin@123", user_data['hashed_password'])
        print(f"Senha válida: {password_valid}")
        if password_valid:
            print("Autenticação bem-sucedida!")
            print(f"ID: {user_data['id']}")
            print(f"Email: {user_data['email']}")
            print(f"Nome: {user_data['full_name']}")
            print(f"Ativo: {user_data['is_active']}")
            print(f"Admin: {user_data.get('is_admin', 'Coluna não existe')}")
        else:
            print("Senha incorreta!")
    else:
        print("Usuário não encontrado!")
    
    await conn.close()

if __name__ == "__main__":
    asyncio.run(test_authentication())
