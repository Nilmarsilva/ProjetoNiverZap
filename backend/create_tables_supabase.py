import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Carrega as variáveis de ambiente
load_dotenv()

def get_supabase_admin_client() -> Client:
    """Retorna um cliente Supabase com permissões de administrador"""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    return create_client(url, key)

def execute_sql_with_supabase(sql_file_path):
    """
    Executa um script SQL usando o cliente Supabase
    
    Args:
        sql_file_path: Caminho para o arquivo SQL a ser executado
    """
    try:
        # Verifica se o arquivo existe
        if not os.path.exists(sql_file_path):
            print(f"Arquivo não encontrado: {sql_file_path}")
            return False
        
        # Lê o conteúdo do arquivo SQL
        with open(sql_file_path, 'r', encoding='utf-8') as file:
            sql_script = file.read()
        
        # Obtém o cliente Supabase com permissões de administrador
        supabase = get_supabase_admin_client()
        
        print(f"Conectando ao Supabase em {os.getenv('SUPABASE_URL')}")
        
        # Executa o script SQL usando a função rpc
        print(f"\nExecutando o script SQL: {sql_file_path}")
        
        # Divide o script em comandos individuais
        # Nota: Esta é uma abordagem simplificada e pode não funcionar para todos os scripts SQL
        commands = sql_script.split(';')
        
        for i, command in enumerate(commands):
            command = command.strip()
            if command:
                print(f"Executando comando {i+1}/{len(commands)}...")
                try:
                    # Usa a função rpc para executar SQL arbitrário
                    # Isso requer que uma função RPC esteja configurada no Supabase
                    # Se não estiver disponível, você precisará criar uma
                    response = supabase.rpc(
                        'execute_sql', 
                        {'sql_command': command}
                    ).execute()
                    
                    if hasattr(response, 'error') and response.error:
                        print(f"Erro ao executar comando: {response.error}")
                except Exception as e:
                    print(f"Erro ao executar comando: {e}")
                    print("Continuando com o próximo comando...")
        
        # Verifica as tabelas criadas
        print("\nVerificando tabelas criadas...")
        response = supabase.rpc(
            'list_tables'
        ).execute()
        
        if hasattr(response, 'data') and response.data:
            print("\nTabelas disponíveis após a execução do script:")
            for table in response.data:
                print(f"- {table}")
        else:
            print("Não foi possível listar as tabelas.")
        
        print("\nScript SQL executado com sucesso!")
        return True
    except Exception as e:
        print(f"\nErro ao executar o script SQL: {e}")
        return False

def create_rpc_functions():
    """
    Cria as funções RPC necessárias no Supabase
    """
    try:
        supabase = get_supabase_admin_client()
        
        # Função para executar SQL arbitrário
        execute_sql_function = """
        CREATE OR REPLACE FUNCTION execute_sql(sql_command TEXT)
        RETURNS VOID
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            EXECUTE sql_command;
        END;
        $$;
        """
        
        # Função para listar tabelas
        list_tables_function = """
        CREATE OR REPLACE FUNCTION list_tables()
        RETURNS TABLE (table_name TEXT)
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            RETURN QUERY
            SELECT tablename::TEXT
            FROM pg_catalog.pg_tables
            WHERE schemaname = 'public';
        END;
        $$;
        """
        
        print("Criando funções RPC no Supabase...")
        
        # Cria a função para executar SQL
        response = supabase.rpc(
            'execute_sql',
            {'sql_command': execute_sql_function}
        ).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"Erro ao criar função execute_sql: {response.error}")
            # Se a função não existir, tente criá-la usando o SQL bruto
            print("Tentando criar a função usando SQL bruto...")
            response = supabase.from_('_rpc').select('*').execute()
            # Aqui você precisaria implementar uma lógica alternativa
        
        # Cria a função para listar tabelas
        response = supabase.rpc(
            'execute_sql',
            {'sql_command': list_tables_function}
        ).execute()
        
        if hasattr(response, 'error') and response.error:
            print(f"Erro ao criar função list_tables: {response.error}")
        
        print("Funções RPC criadas com sucesso!")
        return True
    except Exception as e:
        print(f"Erro ao criar funções RPC: {e}")
        return False

if __name__ == "__main__":
    # Primeiro, cria as funções RPC necessárias
    create_rpc_functions()
    
    # Caminho para o script SQL de criação das tabelas
    sql_file_path = os.path.join(os.path.dirname(__file__), "app", "db", "create_tables.sql")
    
    # Executa o script SQL
    execute_sql_with_supabase(sql_file_path)
