Write-Host "===== INICIANDO AMBIENTE DE DESENVOLVIMENTO DO NIVERZAP =====" -ForegroundColor Green
Write-Host ""

# Verifica se o Redis está instalado
$redisInstalled = $null -ne (Get-Command redis-server -ErrorAction SilentlyContinue)
if (-not $redisInstalled) {
    Write-Host "Redis não encontrado! Certifique-se de que o Redis ou Memurai está instalado." -ForegroundColor Yellow
    Write-Host "Para Windows, recomendamos usar o Memurai: https://www.memurai.com/" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($continue -ne "s") {
        exit
    }
} else {
    Write-Host "Redis encontrado!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Iniciando o backend..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd backend && python -m uvicorn app.main:app --reload --port 8000"

Write-Host ""
Write-Host "Iniciando o worker do Celery..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd backend && python -m celery -A app.worker worker --loglevel=info"

Write-Host ""
Write-Host "Iniciando o beat do Celery..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd backend && python -m celery -A app.worker beat --loglevel=info"

Write-Host ""
Write-Host "Iniciando o frontend..." -ForegroundColor Cyan
Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd zap-niver-dashboard && npm run dev"

Write-Host ""
Write-Host "===== AMBIENTE DE DESENVOLVIMENTO INICIADO =====" -ForegroundColor Green
Write-Host ""
Write-Host "Serviços:" -ForegroundColor Cyan
Write-Host "- Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "- Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "- Documentação da API: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Para encerrar, feche as janelas de terminal ou pressione Ctrl+C em cada uma delas." -ForegroundColor Yellow
Write-Host ""
Read-Host "Pressione Enter para continuar..."
