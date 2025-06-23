import os
from dotenv import load_dotenv
from supabase import create_client, Client
from passlib.context import CryptContext

# Carrega as variáveis de ambiente
load_dotenv()

# Configuração para hash de senha
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """
    Cria um hash da senha
    """
    return pwd_context.hash(password)

def get_supabase_admin_client() -> Client:
    """Retorna um cliente Supabase com permissões de administrador"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    return create_client(url, key)

def create_admin_user(email: str, password: str, full_name: str, plan_id: int = 3):
    """
    Cria um usuário administrador no sistema
    
    Args:
        email: Email do usuário
        password: Senha do usuário
        full_name: Nome completo do usuário
        plan_id: ID do plano (padrão: 3 - Plano Premium)
    """
    try:
        # Obtém o cliente Supabase com permissões de administrador
        supabase = get_supabase_admin_client()
        
        print(f"Conectando ao Supabase em {os.getenv('SUPABASE_URL')}")
        
        # Verifica se o usuário já existe
        response = supabase.table("users").select("*").eq("email", email).execute()
        
        if hasattr(response, 'data') and len(response.data) > 0:
            print(f"\nUsuário com email {email} já existe!")
            return False
        
        # Gera o hash da senha
        hashed_password = get_password_hash(password)
        
        # Verifica se o plano existe
        response = supabase.table("plans").select("*").eq("id", plan_id).execute()
        
        if not hasattr(response, 'data') or len(response.data) == 0:
            print(f"\nPlano com ID {plan_id} não existe!")
            
            # Lista os planos disponíveis
            response = supabase.table("plans").select("*").execute()
            if hasattr(response, 'data') and len(response.data) > 0:
                print("\nPlanos disponíveis:")
                for plan in response.data:
                    print(f"- ID: {plan['id']}, Nome: {plan['name']}")
            
            return False
        
        # Cria o usuário
        user_data = {
            "email": email,
            "full_name": full_name,
            "hashed_password": hashed_password,
            "is_active": True,
            "plan_id": plan_id,
            "whatsapp_provider": "zapi",
            "whatsapp_config": {}
        }
        
        print("\nCriando usuário administrador...")
        response = supabase.table("users").insert(user_data).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"Erro ao criar usuário: {response.error}")
            return False
        
        print("\nUsuário administrador criado com sucesso!")
        print(f"Email: {email}")
        print(f"Nome: {full_name}")
        print(f"Plano: {plan_id}")
        
        # Exibe os dados do usuário criado
        if hasattr(response, 'data') and len(response.data) > 0:
            user = response.data[0]
            print(f"\nID do usuário: {user['id']}")
            print(f"Data de criação: {user['created_at']}")
        
        return True
    except Exception as e:
        print(f"\nErro ao criar usuário administrador: {e}")
        return False

if __name__ == "__main__":
    # Dados do usuário administrador
    admin_email = "admin@niverzap.com"
    admin_password = "Admin@123"
    admin_name = "Administrador NiverZap"
    
    # Cria o usuário administrador
    create_admin_user(admin_email, admin_password, admin_name)
    
    # Opção para criar um usuário personalizado
    create_custom = input("\nDeseja criar um usuário personalizado? (s/n): ")
    
    if create_custom.lower() == 's':
        email = input("Email: ")
        password = input("Senha: ")
        name = input("Nome completo: ")
        plan_id = int(input("ID do plano (1-Gratuito, 2-Básico, 3-Premium): "))
        
        create_admin_user(email, password, name, plan_id)
