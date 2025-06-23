from typing import Optional, Dict, Any, Union
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import json
import urllib.parse

from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client() -> Client:
    """Retorna um cliente Supabase regular"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_supabase_admin_client() -> Client:
    """Retorna um cliente Supabase com permissões de administrador"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

# Verificar se estamos em ambiente Docker
def is_docker() -> bool:
    """Verifica se estamos rodando em um container Docker"""
    path = '/proc/self/cgroup'
    return (
        os.path.exists('/.dockerenv') or
        os.path.isfile(path) and any('docker' in line for line in open(path))
    )

# Classe para conexão direta com PostgreSQL
class PostgresConnection:
    """Conexão direta com o PostgreSQL do Supabase"""
    
    def __init__(self):
        self.conn = None
        self.connect()
    
    def connect(self):
        """Estabelece conexão com o banco de dados"""
        try:
            # Codifica a senha para lidar com caracteres especiais
            password = os.getenv('POSTGRES_PASSWORD')
            encoded_password = urllib.parse.quote_plus(password) if password else ''
            
            self.conn = psycopg2.connect(
                host=os.getenv('POSTGRES_HOST'),
                port=os.getenv('POSTGRES_PORT'),
                dbname=os.getenv('POSTGRES_DB'),
                user=os.getenv('POSTGRES_USER'),
                password=encoded_password,
                sslmode=os.getenv('POSTGRES_SSL', 'require')
            )
        except Exception as e:
            print(f"Erro ao conectar ao PostgreSQL: {e}")
            # Fallback para cliente Supabase
            self.conn = None
    
    def execute_query(self, query: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Executa uma consulta SQL e retorna os resultados"""
        if not self.conn:
            raise Exception("Conexão com PostgreSQL não estabelecida")
        
        try:
            with self.conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params or {})
                
                if query.strip().upper().startswith('SELECT'):
                    results = cursor.fetchall()
                    return {"data": [dict(row) for row in results], "count": len(results)}
                else:
                    self.conn.commit()
                    if cursor.rowcount > 0 and cursor.description:
                        return {"data": [dict(row) for row in cursor.fetchall()], "count": cursor.rowcount}
                    return {"data": [], "count": cursor.rowcount}
        except Exception as e:
            self.conn.rollback()
            raise Exception(f"Erro ao executar consulta: {e}")

# Singleton para conexão PostgreSQL
_postgres_connection = None

def get_postgres_connection() -> PostgresConnection:
    """Retorna uma conexão direta com o PostgreSQL (singleton)"""
    global _postgres_connection
    
    if _postgres_connection is None:
        _postgres_connection = PostgresConnection()
    
    return _postgres_connection

# Classe adaptadora para compatibilidade com código existente
class SupabaseAdapter:
    """Adaptador para manter compatibilidade com a API do cliente Supabase"""
    
    def __init__(self, pg_conn: PostgresConnection):
        self.pg_conn = pg_conn
    
    def table(self, table_name: str):
        return TableQuery(self.pg_conn, table_name)
    
    def rpc(self, function_name: str, params: Dict[str, Any] = None):
        return RPCQuery(self.pg_conn, function_name, params)

class TableQuery:
    """Classe para construir consultas SQL para tabelas"""
    
    def __init__(self, pg_conn: PostgresConnection, table_name: str):
        self.pg_conn = pg_conn
        self.table_name = table_name
        self.conditions = []
        self.order_column = None
        self.order_desc = False
        self.range_start = None
        self.range_end = None
        self.count_option = None
        self.select_columns = "*"
    
    def select(self, columns: str, count: Optional[str] = None):
        self.select_columns = columns
        self.count_option = count
        return self
    
    def eq(self, column: str, value: Any):
        self.conditions.append((column, '=', value))
        return self
    
    def neq(self, column: str, value: Any):
        self.conditions.append((column, '!=', value))
        return self
    
    def gt(self, column: str, value: Any):
        self.conditions.append((column, '>', value))
        return self
    
    def gte(self, column: str, value: Any):
        self.conditions.append((column, '>=', value))
        return self
    
    def lt(self, column: str, value: Any):
        self.conditions.append((column, '<', value))
        return self
    
    def lte(self, column: str, value: Any):
        self.conditions.append((column, '<=', value))
        return self
    
    def in_(self, column: str, values: list):
        if isinstance(values, list) and values:
            placeholders = ', '.join(['%s'] * len(values))
            self.conditions.append((column, f'IN ({placeholders})', values))
        return self
    
    def or_(self, conditions: str):
        # Implementação simplificada
        self.conditions.append((None, 'OR', conditions))
        return self
    
    def order(self, column: str, desc: bool = False):
        self.order_column = column
        self.order_desc = desc
        return self
    
    def range(self, start: int, end: int):
        self.range_start = start
        self.range_end = end
        return self
    
    def _build_query(self):
        query = f"SELECT {self.select_columns} FROM {self.table_name}"
        params = {}
        
        if self.conditions:
            query += " WHERE "
            where_clauses = []
            
            for i, (column, op, value) in enumerate(self.conditions):
                if op == 'OR':
                    where_clauses.append(f"({value})")
                else:
                    param_name = f"param_{i}"
                    if isinstance(value, list) and op.startswith('IN'):
                        where_clauses.append(f"{column} {op}")
                        for j, val in enumerate(value):
                            params[f"param_{i}_{j}"] = val
                    else:
                        where_clauses.append(f"{column} {op} %({param_name})s")
                        params[param_name] = value
            
            query += " AND ".join(where_clauses)
        
        if self.order_column:
            query += f" ORDER BY {self.order_column} {'DESC' if self.order_desc else 'ASC'}"
        
        if self.range_start is not None and self.range_end is not None:
            query += f" LIMIT {self.range_end - self.range_start + 1} OFFSET {self.range_start}"
        
        return query, params
    
    def insert(self, data: Dict[str, Any]):
        columns = ", ".join(data.keys())
        placeholders = ", ".join([f"%({key})s" for key in data.keys()])
        
        query = f"INSERT INTO {self.table_name} ({columns}) VALUES ({placeholders}) RETURNING *"
        return self.execute(query, data)
    
    def update(self, data: Dict[str, Any]):
        set_clause = ", ".join([f"{key} = %({key})s" for key in data.keys()])
        query = f"UPDATE {self.table_name} SET {set_clause}"
        
        params = data.copy()
        
        if self.conditions:
            query += " WHERE "
            where_clauses = []
            
            for i, (column, op, value) in enumerate(self.conditions):
                if op == 'OR':
                    where_clauses.append(f"({value})")
                else:
                    param_name = f"where_{i}"
                    where_clauses.append(f"{column} {op} %({param_name})s")
                    params[param_name] = value
            
            query += " AND ".join(where_clauses)
        
        query += " RETURNING *"
        return self.execute(query, params)
    
    def delete(self):
        query = f"DELETE FROM {self.table_name}"
        
        params = {}
        
        if self.conditions:
            query += " WHERE "
            where_clauses = []
            
            for i, (column, op, value) in enumerate(self.conditions):
                if op == 'OR':
                    where_clauses.append(f"({value})")
                else:
                    param_name = f"param_{i}"
                    where_clauses.append(f"{column} {op} %({param_name})s")
                    params[param_name] = value
            
            query += " AND ".join(where_clauses)
        
        query += " RETURNING *"
        return self.execute(query, params)
    
    def execute(self, query=None, params=None):
        if query is None:
            query, params = self._build_query()
        
        result = self.pg_conn.execute_query(query, params)
        return result

class RPCQuery:
    """Classe para chamadas de funções RPC"""
    
    def __init__(self, pg_conn: PostgresConnection, function_name: str, params: Dict[str, Any] = None):
        self.pg_conn = pg_conn
        self.function_name = function_name
        self.params = params or {}
    
    def execute(self):
        params_str = ", ".join([f"%({key})s" for key in self.params.keys()])
        query = f"SELECT * FROM {self.function_name}({params_str})"
        
        return self.pg_conn.execute_query(query, self.params)

def get_db_client() -> Union[Client, SupabaseAdapter]:
    """Retorna o cliente de banco de dados apropriado baseado no ambiente"""
    if is_docker() and os.getenv('POSTGRES_HOST'):
        # Em Docker, usar conexão direta com PostgreSQL
        try:
            pg_conn = get_postgres_connection()
            return SupabaseAdapter(pg_conn)
        except Exception as e:
            print(f"Erro ao conectar diretamente ao PostgreSQL: {e}")
            print("Usando cliente Supabase como fallback")
    
    # Usar cliente Supabase padrão
    return get_supabase_client()

def get_supabase_admin_client() -> Client:
    """
    Retorna um cliente Supabase com privilégios administrativos.
    Utiliza a chave de serviço para operações que requerem mais permissões.
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
