import os
import psycopg2
import urllib.parse
from dotenv import load_dotenv

# Carrega as variáveis de ambiente
load_dotenv()

def execute_sql_script(sql_file_path):
    """
    Executa um script SQL diretamente no PostgreSQL do Supabase
    
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
        
        # Obtém as variáveis de ambiente
        host = os.getenv("POSTGRES_HOST")
        port = os.getenv("POSTGRES_PORT")
        dbname = os.getenv("POSTGRES_DB")
        user = os.getenv("POSTGRES_USER")
        password = os.getenv("POSTGRES_PASSWORD")
        sslmode = os.getenv("POSTGRES_SSL", "require")
        
        # Exibe as informações de conexão (sem a senha)
        print(f"Conectando ao PostgreSQL em {host}:{port}/{dbname} como {user}")
        
        # Codifica a senha para lidar com caracteres especiais
        encoded_password = urllib.parse.quote_plus(password)
        
        print(f"Senha codificada: {encoded_password}")
        
        # Cria a string de conexão
        conn_string = f"host={host} port={port} dbname={dbname} user={user} password={encoded_password} sslmode={sslmode}"
        
        print(f"String de conexão (sem senha): host={host} port={port} dbname={dbname} user={user} sslmode={sslmode}")
        
        # Tenta conectar ao banco de dados
        conn = psycopg2.connect(conn_string)
        
        # Configura o autocommit
        conn.autocommit = True
        print("Conexão estabelecida com sucesso!")
        
        # Cria um cursor
        cursor = conn.cursor()
        
        # Executa o script SQL
        print(f"\nExecutando o script SQL: {sql_file_path}")
        cursor.execute(sql_script)
        
        # Exibe mensagem de sucesso
        print("\nScript SQL executado com sucesso!")
        
        # Verifica as tabelas criadas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        # Obtém as tabelas
        tables = cursor.fetchall()
        
        # Exibe as tabelas
        print("\nTabelas disponíveis após a execução do script:")
        for table in tables:
            print(f"- {table[0]}")
        
        # Fecha o cursor e a conexão
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"\nErro ao executar o script SQL: {e}")
        return False

def test_connection():
    """
    Testa a conexão com o PostgreSQL
    """
    try:
        # Obtém as variáveis de ambiente
        host = os.getenv("POSTGRES_HOST")
        port = os.getenv("POSTGRES_PORT")
        dbname = os.getenv("POSTGRES_DB")
        user = os.getenv("POSTGRES_USER")
        password = os.getenv("POSTGRES_PASSWORD")
        sslmode = os.getenv("POSTGRES_SSL", "require")
        
        # Exibe as informações de conexão (sem a senha)
        print(f"Conectando ao PostgreSQL em {host}:{port}/{dbname} como {user}")
        
        # Codifica a senha para lidar com caracteres especiais
        encoded_password = urllib.parse.quote_plus(password)
        
        # Cria a string de conexão
        conn_string = f"host={host} port={port} dbname={dbname} user={user} password={encoded_password} sslmode={sslmode}"
        
        # Tenta conectar ao banco de dados
        conn = psycopg2.connect(conn_string)
        
        # Cria um cursor
        cursor = conn.cursor()
        
        # Executa uma consulta simples
        cursor.execute("SELECT current_database(), current_user, version();")
        
        # Obtém o resultado
        result = cursor.fetchone()
        
        # Exibe o resultado
        print("\nConexão bem-sucedida!")
        print(f"Database: {result[0]}")
        print(f"User: {result[1]}")
        print(f"Version: {result[2]}")
        
        # Fecha o cursor e a conexão
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"\nErro ao conectar ao PostgreSQL: {e}")
        return False

if __name__ == "__main__":
    # Primeiro, testa a conexão
    if test_connection():
        # Caminho para o script SQL de criação das tabelas
        sql_file_path = os.path.join(os.path.dirname(__file__), "app", "db", "create_tables.sql")
        
        # Pergunta ao usuário se deseja executar o script SQL
        response = input("\nDeseja executar o script SQL para criar as tabelas? (s/n): ")
        if response.lower() == 's':
            # Executa o script SQL
            execute_sql_script(sql_file_path)
        else:
            print("\nOperação cancelada pelo usuário.")
    else:
        print("\nNão foi possível estabelecer conexão com o PostgreSQL. Verifique as credenciais.")
