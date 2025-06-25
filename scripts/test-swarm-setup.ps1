# Script para testar a configuração do Docker Swarm com load balancer e Redis
# Autor: Equipe NiverZap
# Data: 25/06/2025

# Cores para output
$Green = @{ForegroundColor = "Green"}
$Red = @{ForegroundColor = "Red"}
$Yellow = @{ForegroundColor = "Yellow"}

Write-Host "Iniciando testes da configuração do Docker Swarm com load balancer e Redis..." @Yellow

# Verificar se o Docker está rodando
Write-Host "`nVerificando se o Docker está rodando..." @Yellow
try {
    docker info | Out-Null
    Write-Host "✓ Docker está rodando" @Green
} catch {
    Write-Host "✗ Docker não está rodando. Por favor, inicie o Docker e tente novamente." @Red
    exit 1
}

# Verificar se o Docker Swarm está inicializado
Write-Host "`nVerificando se o Docker Swarm está inicializado..." @Yellow
try {
    docker node ls | Out-Null
    Write-Host "✓ Docker Swarm já está inicializado" @Green
} catch {
    Write-Host "Docker Swarm não está inicializado. Inicializando..." @Yellow
    docker swarm init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Docker Swarm inicializado com sucesso" @Green
    } else {
        Write-Host "✗ Falha ao inicializar Docker Swarm" @Red
        exit 1
    }
}

# Verificar se a rede niverzap-network existe
Write-Host "`nVerificando se a rede niverzap-network existe..." @Yellow
$networkExists = docker network ls | Select-String -Pattern "niverzap-network"
if ($networkExists) {
    Write-Host "✓ Rede niverzap-network já existe" @Green
} else {
    Write-Host "Criando rede niverzap-network..." @Yellow
    docker network create --driver overlay --attachable niverzap-network
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Rede niverzap-network criada com sucesso" @Green
    } else {
        Write-Host "✗ Falha ao criar rede niverzap-network" @Red
        exit 1
    }
}

# Mudar para o diretório raiz do projeto
$projectRoot = "D:\SOFTWARES\ProjetoNiverZap"
Set-Location $projectRoot

# Implantar a stack
Write-Host "`nImplantando a stack NiverZap..." @Yellow
docker stack deploy -c docker-compose.swarm.yml niverzap
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Stack NiverZap implantada com sucesso" @Green
} else {
    Write-Host "✗ Falha ao implantar stack NiverZap" @Red
    exit 1
}

# Aguardar serviços iniciarem
Write-Host "`nAguardando serviços iniciarem (30 segundos)..." @Yellow
Start-Sleep -Seconds 30

# Verificar status dos serviços
Write-Host "`nVerificando status dos serviços..." @Yellow
docker service ls --filter name=niverzap

# Testar conexão com o Redis
Write-Host "`nTestando conexão com o Redis..." @Yellow
$redisContainer = docker ps --filter name=niverzap_redis --format "{{.ID}}" | Select-Object -First 1
if ($redisContainer) {
    Write-Host "✓ Container Redis encontrado: $redisContainer" @Green
    Write-Host "Executando teste de ping no Redis..." @Yellow
    $pingResult = docker exec $redisContainer redis-cli -a "niverzap_redis_password" ping
    if ($pingResult -eq "PONG") {
        Write-Host "✓ Redis respondeu com PONG" @Green
    } else {
        Write-Host "✗ Redis não respondeu corretamente" @Red
    }
} else {
    Write-Host "✗ Container Redis não encontrado" @Red
}

# Testar load balancer Nginx
Write-Host "`nTestando load balancer Nginx..." @Yellow
$nginxContainer = docker ps --filter name=niverzap_nginx --format "{{.ID}}" | Select-Object -First 1
if ($nginxContainer) {
    Write-Host "✓ Container Nginx encontrado: $nginxContainer" @Green
    Write-Host "Verificando configuração do Nginx..." @Yellow
    docker exec $nginxContainer nginx -t
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Configuração do Nginx está correta" @Green
    } else {
        Write-Host "✗ Configuração do Nginx tem erros" @Red
    }
} else {
    Write-Host "✗ Container Nginx não encontrado" @Red
}

# Testar réplicas da API
Write-Host "`nVerificando réplicas da API..." @Yellow
$apiReplicas = docker service ls --filter name=niverzap_api --format "{{.Replicas}}"
Write-Host "Status das réplicas da API: $apiReplicas" @Green

# Testar acesso à API através do load balancer
Write-Host "`nTestando acesso à API através do load balancer..." @Yellow
for ($i = 1; $i -le 5; $i++) {
    Write-Host "Requisição ${i}:" @Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:80/api/health" -Method Head -ErrorAction SilentlyContinue
    Write-Host $response.StatusCode $response.StatusDescription
    Start-Sleep -Seconds 1
}

Write-Host "`nTestes concluídos!" @Green
Write-Host "Para visualizar logs da API:" @Yellow -NoNewline; Write-Host " docker service logs niverzap_api"
Write-Host "Para visualizar logs do Nginx:" @Yellow -NoNewline; Write-Host " docker service logs niverzap_nginx"
Write-Host "Para visualizar logs do Redis:" @Yellow -NoNewline; Write-Host " docker service logs niverzap_redis"
Write-Host "Para remover a stack:" @Yellow -NoNewline; Write-Host " docker stack rm niverzap"
