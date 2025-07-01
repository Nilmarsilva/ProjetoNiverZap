# Estratégia de Implantação em Produção para NiverZap

Este documento detalha a estratégia recomendada para implantar o NiverZap em ambiente de produção usando GitHub, DockerHub e Docker Swarm.

## Visão Geral da Arquitetura

A arquitetura de implantação segue o modelo GitOps com CI/CD automatizado:

```
GitHub (Código) → GitHub Actions (CI/CD) → DockerHub (Imagens) → VPS (Implantação)
```

## 1. Configuração do GitHub

### 1.1. Estrutura do Repositório

Mantenha a estrutura atual do repositório, com os seguintes diretórios importantes:

- `/stacks`: Arquivos YAML de configuração do Docker Swarm
- `/Dockerfile.niverzap-api`: Definição da imagem Docker da API
- `/nginx/conf`: Configurações do Nginx

### 1.2. Configuração do GitHub Actions

Crie um arquivo `.github/workflows/docker-build.yml` com o seguinte conteúdo:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [ main ]
    paths-ignore:
      - '**.md'
      - 'docs/**'
  workflow_dispatch:  # Permite execução manual

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push API image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile.niverzap-api
          push: true
          tags: |
            seuusuario/niverzap-api:latest
            seuusuario/niverzap-api:${{ github.sha }}
          cache-from: type=registry,ref=seuusuario/niverzap-api:buildcache
          cache-to: type=registry,ref=seuusuario/niverzap-api:buildcache,mode=max
```

### 1.3. Configuração de Secrets no GitHub

No repositório GitHub, adicione os seguintes secrets:

1. `DOCKERHUB_USERNAME`: Seu nome de usuário no DockerHub
2. `DOCKERHUB_TOKEN`: Token de acesso ao DockerHub (não use sua senha)

## 2. Configuração do DockerHub

### 2.1. Criar Conta e Repositório

1. Crie uma conta no DockerHub (se ainda não tiver)
2. Crie um repositório para a imagem da API: `niverzap-api`
3. Crie um token de acesso para o GitHub Actions

### 2.2. Configuração de Visibilidade

Você pode escolher entre:
- **Público**: Qualquer pessoa pode baixar as imagens (bom para projetos open source)
- **Privado**: Apenas usuários autorizados podem baixar (requer autenticação na VPS)

## 3. Preparação da VPS

### 3.1. Instalação do Docker e Docker Swarm

```bash
# Instalar Docker (se ainda não estiver instalado)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Inicializar Docker Swarm
docker swarm init --advertise-addr <IP_PÚBLICO_DA_VPS>

# Criar rede overlay
docker network create --driver overlay --attachable network_public
```

### 3.2. Estrutura de Diretórios na VPS

```bash
# Criar estrutura de diretórios
mkdir -p /opt/niverzap/{stacks,nginx/conf,scripts}

# Configurar permissões
chmod -R 755 /opt/niverzap
```

### 3.3. Login no DockerHub

```bash
# Login no DockerHub (necessário para imagens privadas)
docker login
# Digite seu nome de usuário e senha/token quando solicitado
```

## 4. Implantação na VPS

### 4.1. Transferência de Arquivos de Configuração

Transfira os arquivos de configuração para a VPS:

```bash
# Opção 1: Usando SCP
scp -r ./stacks user@vps-ip:/opt/niverzap/
scp -r ./nginx/conf user@vps-ip:/opt/niverzap/nginx/

# Opção 2: Usando Git (clone apenas os arquivos necessários)
# Na VPS:
cd /opt/niverzap
git clone --depth 1 https://github.com/seu-usuario/niverzap.git temp
cp -r temp/stacks ./stacks
cp -r temp/nginx/conf ./nginx/conf
rm -rf temp
```

### 4.2. Atualização dos Arquivos de Stack

Edite o arquivo `/opt/niverzap/stacks/niverzap.yaml` para usar as imagens do DockerHub:

```yaml
version: '3.8'

services:
  api:
    image: seuusuario/niverzap-api:latest  # Imagem do DockerHub
    # resto da configuração...
```

### 4.3. Implantação da Stack

```bash
# Puxar a imagem mais recente
docker pull seuusuario/niverzap-api:latest

# Implantar a stack
docker stack deploy -c /opt/niverzap/stacks/niverzap.yaml niverzap

# Verificar status
docker service ls
docker stack services niverzap
```

## 5. Automação de Atualizações

### 5.1. Script de Atualização

Crie um script `/opt/niverzap/scripts/update.sh`:

```bash
#!/bin/bash
# Script para atualizar a stack NiverZap

# Puxar novas imagens
docker pull seuusuario/niverzap-api:latest

# Forçar atualização dos serviços
docker service update --force niverzap_api

# Verificar status
echo "Status dos serviços:"
docker service ls --filter name=niverzap
```

Torne o script executável:
```bash
chmod +x /opt/niverzap/scripts/update.sh
```

### 5.2. Configuração do Watchtower (Opcional)

Para atualizações automáticas quando novas imagens forem publicadas:

```bash
docker run -d \
  --name watchtower \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower \
  --interval 3600 \
  --cleanup \
  niverzap_api
```

## 6. Monitoramento e Logs

### 6.1. Visualização de Logs

```bash
# Logs da API
docker service logs niverzap_api --tail 100

# Logs do Nginx
docker service logs niverzap_nginx --tail 100
```

### 6.2. Configuração de Monitoramento (Próximos Passos)

Para monitoramento avançado, considere implementar:
- Prometheus para coleta de métricas
- Grafana para visualização
- ELK Stack (Elasticsearch, Logstash, Kibana) para centralização de logs

## 7. Backup e Recuperação

### 7.1. Backup de Configurações

```bash
# Backup dos arquivos de configuração
tar -czf niverzap-config-$(date +%Y%m%d).tar.gz /opt/niverzap
```

### 7.2. Backup do Banco de Dados

```bash
# Backup do PostgreSQL
docker exec -t postgres_postgres pg_dump -U postgres niverzap > niverzap-db-$(date +%Y%m%d).sql
```

## 8. Considerações de Segurança

1. **Rede**: Configure o firewall para expor apenas as portas necessárias (80/443)
2. **Secrets**: Use Docker Secrets para gerenciar senhas e chaves
3. **SSL/TLS**: Configure HTTPS com Let's Encrypt e Traefik/Nginx
4. **Atualizações**: Mantenha as imagens base atualizadas para corrigir vulnerabilidades

## 9. Fluxo de Trabalho Completo

1. Desenvolvedores fazem commit no GitHub
2. GitHub Actions constrói e publica imagens no DockerHub
3. Na VPS, as novas imagens são puxadas (manualmente ou via Watchtower)
4. Os serviços são atualizados sem downtime

Este fluxo permite uma separação clara entre desenvolvimento e operações, seguindo as melhores práticas de DevOps e CI/CD.
