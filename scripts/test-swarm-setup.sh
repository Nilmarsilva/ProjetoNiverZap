#!/bin/bash
# Script para testar a configuração do Docker Swarm com load balancer e Redis
# Autor: Equipe NiverZap
# Data: 25/06/2025

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando testes da configuração do Docker Swarm com load balancer e Redis...${NC}"

# Verificar se o Docker está rodando
echo -e "\n${YELLOW}Verificando se o Docker está rodando...${NC}"
if docker info > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Docker está rodando${NC}"
else
  echo -e "${RED}✗ Docker não está rodando. Por favor, inicie o Docker e tente novamente.${NC}"
  exit 1
fi

# Verificar se o Docker Swarm está inicializado
echo -e "\n${YELLOW}Verificando se o Docker Swarm está inicializado...${NC}"
if docker node ls > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Docker Swarm já está inicializado${NC}"
else
  echo -e "${YELLOW}Docker Swarm não está inicializado. Inicializando...${NC}"
  docker swarm init
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker Swarm inicializado com sucesso${NC}"
  else
    echo -e "${RED}✗ Falha ao inicializar Docker Swarm${NC}"
    exit 1
  fi
fi

# Verificar se a rede niverzap-network existe
echo -e "\n${YELLOW}Verificando se a rede niverzap-network existe...${NC}"
if docker network ls | grep niverzap-network > /dev/null; then
  echo -e "${GREEN}✓ Rede niverzap-network já existe${NC}"
else
  echo -e "${YELLOW}Criando rede niverzap-network...${NC}"
  docker network create --driver overlay --attachable niverzap-network
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Rede niverzap-network criada com sucesso${NC}"
  else
    echo -e "${RED}✗ Falha ao criar rede niverzap-network${NC}"
    exit 1
  fi
fi

# Implantar a stack
echo -e "\n${YELLOW}Implantando a stack NiverZap...${NC}"
docker stack deploy -c docker-compose.swarm.yml niverzap
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Stack NiverZap implantada com sucesso${NC}"
else
  echo -e "${RED}✗ Falha ao implantar stack NiverZap${NC}"
  exit 1
fi

# Aguardar serviços iniciarem
echo -e "\n${YELLOW}Aguardando serviços iniciarem (30 segundos)...${NC}"
sleep 30

# Verificar status dos serviços
echo -e "\n${YELLOW}Verificando status dos serviços...${NC}"
docker service ls --filter name=niverzap

# Testar conexão com o Redis
echo -e "\n${YELLOW}Testando conexão com o Redis...${NC}"
REDIS_CONTAINER=$(docker ps --filter name=niverzap_redis --format "{{.ID}}" | head -1)
if [ -n "$REDIS_CONTAINER" ]; then
  echo -e "${GREEN}✓ Container Redis encontrado: $REDIS_CONTAINER${NC}"
  echo -e "${YELLOW}Executando teste de ping no Redis...${NC}"
  if docker exec $REDIS_CONTAINER redis-cli -a "niverzap_redis_password" ping | grep "PONG" > /dev/null; then
    echo -e "${GREEN}✓ Redis respondeu com PONG${NC}"
  else
    echo -e "${RED}✗ Redis não respondeu corretamente${NC}"
  fi
else
  echo -e "${RED}✗ Container Redis não encontrado${NC}"
fi

# Testar load balancer Nginx
echo -e "\n${YELLOW}Testando load balancer Nginx...${NC}"
NGINX_CONTAINER=$(docker ps --filter name=niverzap_nginx --format "{{.ID}}" | head -1)
if [ -n "$NGINX_CONTAINER" ]; then
  echo -e "${GREEN}✓ Container Nginx encontrado: $NGINX_CONTAINER${NC}"
  echo -e "${YELLOW}Verificando configuração do Nginx...${NC}"
  docker exec $NGINX_CONTAINER nginx -t
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Configuração do Nginx está correta${NC}"
  else
    echo -e "${RED}✗ Configuração do Nginx tem erros${NC}"
  fi
else
  echo -e "${RED}✗ Container Nginx não encontrado${NC}"
fi

# Testar réplicas da API
echo -e "\n${YELLOW}Verificando réplicas da API...${NC}"
API_REPLICAS=$(docker service ls --filter name=niverzap_api --format "{{.Replicas}}")
echo -e "${GREEN}Status das réplicas da API: $API_REPLICAS${NC}"

# Testar acesso à API através do load balancer
echo -e "\n${YELLOW}Testando acesso à API através do load balancer...${NC}"
for i in {1..5}; do
  echo -e "${YELLOW}Requisição $i:${NC}"
  curl -s -I http://localhost:80/api/health | head -1
  sleep 1
done

echo -e "\n${GREEN}Testes concluídos!${NC}"
echo -e "${YELLOW}Para visualizar logs da API:${NC} docker service logs niverzap_api"
echo -e "${YELLOW}Para visualizar logs do Nginx:${NC} docker service logs niverzap_nginx"
echo -e "${YELLOW}Para visualizar logs do Redis:${NC} docker service logs niverzap_redis"
echo -e "${YELLOW}Para remover a stack:${NC} docker stack rm niverzap"
