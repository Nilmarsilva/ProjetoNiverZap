import asyncio
from app.services.user_service import UserService
from passlib.context import CryptContext

# Configuração para hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def test_authentication():
    # Testar autenticação do usuário admin@datazap.com
    print("\nTestando autenticação para admin@datazap.com...")
    user = await UserService.authenticate(email="admin@datazap.com", password="123456")
    
    if user:
        print("Autenticação bem-sucedida!")
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Nome: {user.full_name}")
        print(f"Ativo: {user.is_active}")
        print(f"Admin: {user.is_admin}")
    else:
        print("Falha na autenticação!")
    
    # Testar autenticação do usuário admin@niverzap.com
    print("\nTestando autenticação para admin@niverzap.com...")
    user = await UserService.authenticate(email="admin@niverzap.com", password="Admin@123")
    
    if user:
        print("Autenticação bem-sucedida!")
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Nome: {user.full_name}")
        print(f"Ativo: {user.is_active}")
        print(f"Admin: {user.is_admin}")
    else:
        print("Falha na autenticação!")

if __name__ == "__main__":
    asyncio.run(test_authentication())
