@echo off
echo Atualizando arquivos de configuração para conexão direta com PostgreSQL...

echo.
echo Atualizando docker-compose.yml...
copy /Y docker-compose.yml.new docker-compose.yml
if %ERRORLEVEL% EQU 0 (
    echo docker-compose.yml atualizado com sucesso!
) else (
    echo Erro ao atualizar docker-compose.yml!
)

echo.
echo Atualizando docker-compose.swarm.yml...
copy /Y docker-compose.swarm.yml.new docker-compose.swarm.yml
if %ERRORLEVEL% EQU 0 (
    echo docker-compose.swarm.yml atualizado com sucesso!
) else (
    echo Erro ao atualizar docker-compose.swarm.yml!
)

echo.
echo Atualizando .env.example...
copy /Y backend\.env.example.new backend\.env.example
if %ERRORLEVEL% EQU 0 (
    echo .env.example atualizado com sucesso!
) else (
    echo Erro ao atualizar .env.example!
)

echo.
echo Todos os arquivos foram atualizados!
echo Agora você precisa atualizar seu arquivo .env com as informações de conexão do PostgreSQL.
echo.
echo Exemplo:
echo POSTGRES_HOST=db.sua-url-do-supabase.supabase.co
echo POSTGRES_PORT=5432
echo POSTGRES_DB=postgres
echo POSTGRES_USER=postgres
echo POSTGRES_PASSWORD=sua_senha_do_postgres
echo POSTGRES_SSL=require
echo.
echo Para testar a conexão com o PostgreSQL, execute:
echo cd backend
echo python test_postgres_connection.py
echo.
echo Para criar as tabelas no banco de dados, execute:
echo cd backend
echo python execute_sql_script.py
echo.
pause
