import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Carrega as variáveis de ambiente
load_dotenv()

def test_supabase_connection():
    """
    Testa a conexão com o Supabase usando o SDK oficial
    """
    try:
        # Obtém as variáveis de ambiente
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        # Exibe as informações de conexão (sem a chave completa)
        print(f"Conectando ao Supabase em {url}")
        if key:
            masked_key = key[:5] + "..." + key[-5:] if len(key) > 10 else "***"
            print(f"Usando chave: {masked_key}")
        
        # Cria o cliente Supabase
        supabase = create_client(url, key)
        
        # Tenta fazer uma consulta simples
        print("\nTestando consulta...")
        response = supabase.table('users').select('*').limit(5).execute()
        
        # Verifica se a consulta foi bem-sucedida
        if hasattr(response, 'data'):
            print("\nConexão bem-sucedida!")
            print(f"Número de usuários encontrados: {len(response.data)}")
            
            # Lista as tabelas disponíveis
            print("\nListando tabelas disponíveis...")
            
            # Esta é uma abordagem alternativa para listar tabelas
            # usando uma consulta SQL direta via função RPC
            try:
                tables_response = supabase.rpc(
                    'list_tables'
                ).execute()
                
                if hasattr(tables_response, 'data') and tables_response.data:
                    print("\nTabelas disponíveis:")
                    for table in tables_response.data:
                        print(f"- {table}")
                else:
                    print("Não foi possível listar as tabelas usando RPC.")
                    print("Isso pode acontecer se a função RPC 'list_tables' não estiver definida.")
            except Exception as e:
                print(f"Erro ao listar tabelas via RPC: {e}")
                print("Isso é esperado se a função RPC 'list_tables' não estiver definida.")
            
            return True
        else:
            print(f"\nErro na consulta: {response}")
            return False
    except Exception as e:
        print(f"\nErro ao conectar ao Supabase: {e}")
        return False

if __name__ == "__main__":
    test_supabase_connection()
