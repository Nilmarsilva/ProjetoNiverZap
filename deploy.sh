#!/bin/bash

# Script para implantação do NiverZap em produção usando Docker Swarm

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o Swarm está inicializado
if ! docker info | grep -q "Swarm: active"; then
    echo "Docker Swarm não está ativo. Inicializando..."
    docker swarm init
fi

# Construir as imagens
echo "Construindo imagens Docker..."
docker build -t niverzap-api:latest ./backend
docker build -t niverzap-worker:latest -f ./backend/Dockerfile.worker ./backend
docker build -t niverzap-beat:latest -f ./backend/Dockerfile.beat ./backend
docker build -t niverzap-frontend:latest ./zap-niver-dashboard

# Criar rede overlay se não existir
if ! docker network ls | grep -q "niverzap-network"; then
    echo "Criando rede overlay niverzap-network..."
    docker network create --driver overlay --attachable niverzap-network
fi

# Criar volume para o Redis se não existir
if ! docker volume ls | grep -q "redis-data"; then
    echo "Criando volume para o Redis..."
    docker volume create redis-data
fi

# Implantar a stack
echo "Implantando a stack NiverZap..."
docker stack deploy -c docker-compose.swarm.yml niverzap

echo "Implantação concluída! A aplicação estará disponível em breve."
echo "API: http://seu-dominio.com:8000"
echo "Frontend: http://seu-dominio.com:3000"
echo "Documentação da API: http://seu-dominio.com:8000/docs"
