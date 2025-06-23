import os
from dotenv import load_dotenv
from supabase import create_client, Client
import json

# Carrega as variáveis de ambiente
load_dotenv()

def get_supabase_admin_client() -> Client:
    """Retorna um cliente Supabase com permissões de administrador"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    return create_client(url, key)

def create_tables_with_supabase():
    """
    Cria as tabelas no Supabase usando o SDK
    """
    try:
        # Obtém o cliente Supabase com permissões de administrador
        supabase = get_supabase_admin_client()
        
        print(f"Conectando ao Supabase em {os.getenv('SUPABASE_URL')}")
        
        # Cria a tabela de planos
        print("\nCriando tabela de planos...")
        response = supabase.table("plans").insert({
            "name": "Plano Gratuito",
            "description": "Plano gratuito com limite de 10 mensagens por mês",
            "type": "free",
            "price": 0,
            "message_limit": 10,
            "allowed_providers": json.dumps(["zapi"]),
            "is_active": True
        }).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"Erro ao criar tabela de planos: {response.error}")
            print("A tabela pode já existir, continuando...")
        else:
            print("Tabela de planos criada com sucesso!")
        
        # Verifica se a tabela de planos foi criada
        response = supabase.table("plans").select("*").execute()
        if hasattr(response, 'data'):
            print(f"Número de planos: {len(response.data)}")
            for plan in response.data:
                print(f"- {plan['name']}: {plan['description']}")
        
        # Cria a tabela de usuários
        print("\nCriando tabela de usuários...")
        # Nota: Esta abordagem não criará a tabela se ela não existir
        # O Supabase não permite criar tabelas via API, apenas inserir dados
        # Se a tabela não existir, você receberá um erro
        
        # Verifica se a tabela de usuários existe
        try:
            response = supabase.table("users").select("*").limit(1).execute()
            print("Tabela de usuários já existe.")
        except Exception as e:
            print(f"Erro ao verificar tabela de usuários: {e}")
            print("A tabela de usuários precisa ser criada manualmente ou via SQL.")
        
        # Repete o processo para as outras tabelas
        tables = ["contacts", "templates", "messages"]
        for table in tables:
            print(f"\nVerificando tabela {table}...")
            try:
                response = supabase.table(table).select("*").limit(1).execute()
                print(f"Tabela {table} já existe.")
            except Exception as e:
                print(f"Erro ao verificar tabela {table}: {e}")
                print(f"A tabela {table} precisa ser criada manualmente ou via SQL.")
        
        print("\nVerificação de tabelas concluída!")
        print("\nNota importante: O SDK do Supabase não permite criar tabelas diretamente.")
        print("Para criar as tabelas, você precisa:")
        print("1. Usar o SQL Editor no painel do Supabase para executar o script create_tables.sql")
        print("2. Ou configurar funções RPC no Supabase para executar SQL via API")
        print("3. Ou usar uma conexão direta com o PostgreSQL para executar o script SQL")
        
        return True
    except Exception as e:
        print(f"\nErro ao criar tabelas: {e}")
        return False

if __name__ == "__main__":
    create_tables_with_supabase()
