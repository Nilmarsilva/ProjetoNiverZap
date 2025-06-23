import os
import psycopg2
import urllib.parse
from dotenv import load_dotenv

# Carrega as variáveis de ambiente
load_dotenv()

def test_postgres_connection():
    """
    Testa a conexão direta com o PostgreSQL do Supabase
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
        
        # Tenta listar as tabelas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        # Obtém as tabelas
        tables = cursor.fetchall()
        
        # Exibe as tabelas
        print("\nTabelas disponíveis:")
        for table in tables:
            print(f"- {table[0]}")
        
        # Fecha o cursor e a conexão
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"\nErro ao conectar ao PostgreSQL: {e}")
        return False

if __name__ == "__main__":
    test_postgres_connection()
