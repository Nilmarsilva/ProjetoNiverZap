import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Carrega as variáveis de ambiente
load_dotenv()

def get_supabase_client() -> Client:
    """Retorna um cliente Supabase"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return create_client(url, key)

def get_supabase_admin_client() -> Client:
    """Retorna um cliente Supabase com permissões de administrador"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    return create_client(url, key)

def verify_tables():
    """
    Verifica se as tabelas foram criadas no Supabase
    """
    try:
        # Obtém o cliente Supabase com permissões de administrador
        supabase = get_supabase_admin_client()
        
        print(f"Conectando ao Supabase em {os.getenv('SUPABASE_URL')}")
        
        # Lista de tabelas a serem verificadas
        tables = ["plans", "users", "contacts", "templates", "messages"]
        
        for table in tables:
            print(f"\nVerificando tabela {table}...")
            try:
                response = supabase.table(table).select("*").limit(5).execute()
                
                if hasattr(response, 'data'):
                    print(f"Tabela {table} existe!")
                    print(f"Número de registros: {len(response.data)}")
                    
                    # Se for a tabela de planos, vamos inserir um plano padrão se não existir
                    if table == "plans" and len(response.data) == 0:
                        print("\nInserindo plano padrão...")
                        
                        # Plano gratuito
                        free_plan = {
                            "name": "Plano Gratuito",
                            "description": "Plano gratuito com limite de 10 mensagens por mês",
                            "type": "free",
                            "price": 0,
                            "message_limit": 10,
                            "allowed_providers": ["zapi"],
                            "is_active": True
                        }
                        
                        # Plano básico
                        basic_plan = {
                            "name": "Plano Básico",
                            "description": "Plano básico com limite de 50 mensagens por mês",
                            "type": "basic",
                            "price": 29.90,
                            "message_limit": 50,
                            "allowed_providers": ["zapi", "whatsapp_official"],
                            "is_active": True
                        }
                        
                        # Plano premium
                        premium_plan = {
                            "name": "Plano Premium",
                            "description": "Plano premium com mensagens ilimitadas",
                            "type": "premium",
                            "price": 99.90,
                            "message_limit": 1000,
                            "allowed_providers": ["zapi", "whatsapp_official", "evolution"],
                            "is_active": True
                        }
                        
                        # Insere os planos
                        plans = [free_plan, basic_plan, premium_plan]
                        for plan in plans:
                            response = supabase.table("plans").insert(plan).execute()
                            if hasattr(response, 'error') and response.error:
                                print(f"Erro ao inserir plano {plan['name']}: {response.error}")
                            else:
                                print(f"Plano {plan['name']} inserido com sucesso!")
                        
                        # Verifica os planos inseridos
                        response = supabase.table("plans").select("*").execute()
                        if hasattr(response, 'data'):
                            print(f"\nPlanos inseridos: {len(response.data)}")
                            for plan in response.data:
                                print(f"- {plan['name']}: {plan['description']}")
                
                else:
                    print(f"Erro ao verificar tabela {table}: {response}")
            except Exception as e:
                print(f"Erro ao verificar tabela {table}: {e}")
        
        print("\nVerificação de tabelas concluída!")
        return True
    except Exception as e:
        print(f"\nErro ao verificar tabelas: {e}")
        return False

if __name__ == "__main__":
    verify_tables()
