@echo off
echo ===== INICIANDO AMBIENTE DE DESENVOLVIMENTO DO NIVERZAP =====
echo.

REM Verifica se o Redis está instalado
where redis-server >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Redis não encontrado! Certifique-se de que o Redis ou Memurai está instalado.
    echo Para Windows, recomendamos usar o Memurai: https://www.memurai.com/
    echo.
    set /p CONTINUE=Deseja continuar mesmo assim? (s/n): 
    if /i "%CONTINUE%" NEQ "s" goto :EOF
) else (
    echo Redis encontrado!
)

echo.
echo Iniciando o backend...
start cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"

echo.
echo Iniciando o worker do Celery...
start cmd /k "cd backend && python -m celery -A app.worker worker --loglevel=info"

echo.
echo Iniciando o beat do Celery...
start cmd /k "cd backend && python -m celery -A app.worker beat --loglevel=info"

echo.
echo Iniciando o frontend...
start cmd /k "cd zap-niver-dashboard && npm run dev"

echo.
echo ===== AMBIENTE DE DESENVOLVIMENTO INICIADO =====
echo.
echo Serviços:
echo - Backend API: http://localhost:8000
echo - Frontend: http://localhost:5173
echo - Documentação da API: http://localhost:8000/docs
echo.
echo Para encerrar, feche as janelas de terminal ou pressione Ctrl+C em cada uma delas.
echo.
pause
