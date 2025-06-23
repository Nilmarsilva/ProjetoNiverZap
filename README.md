# NiverZap - Sistema de Mensagens Automáticas de Aniversário

Sistema completo para envio automático de mensagens de aniversário via WhatsApp, com backend em FastAPI, banco de dados Supabase, processamento assíncrono com Celery e Redis, e frontend em React.

## Estrutura do Projeto

```
niverzap/
├── backend/               # Backend FastAPI
│   ├── app/               # Código da aplicação
│   │   ├── api/           # Endpoints da API
│   │   ├── core/          # Configurações centrais
│   │   ├── db/            # Conexões com banco de dados
│   │   ├── integrations/  # Integrações com WhatsApp
│   │   ├── models/        # Modelos de dados
│   │   ├── services/      # Serviços de negócio
│   │   └── tasks/         # Tarefas Celery
│   ├── Dockerfile         # Dockerfile para API
│   ├── Dockerfile.worker  # Dockerfile para worker Celery
│   └── Dockerfile.beat    # Dockerfile para beat Celery
├── zap-niver-dashboard/   # Frontend React
│   ├── src/               # Código fonte do frontend
│   │   ├── components/    # Componentes React
│   │   │   ├── admin/     # Componentes de administração
│   │   │   ├── layout/    # Componentes de layout
│   │   │   └── ui/        # Componentes de UI
│   │   ├── lib/           # Bibliotecas e utilitários
│   │   └── pages/         # Páginas da aplicação
│   ├── Dockerfile         # Dockerfile para frontend
│   └── nginx.conf         # Configuração do Nginx
├── docker-compose.yml     # Configuração Docker Compose para desenvolvimento
├── docker-compose.swarm.yml # Configuração Docker Swarm para produção
├── .env                   # Variáveis de ambiente para desenvolvimento
├── .env.production        # Variáveis de ambiente para produção
└── deploy.sh              # Script de implantação
```

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Python 3.9+ instalado
- Node.js 16+ instalado
- Redis instalado (ou Memurai para Windows)
- Conta no Supabase com banco de dados configurado

### Configuração do Backend

1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```

2. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   # No Windows
   venv\Scripts\activate
   # No Linux/Mac
   source venv/bin/activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Copie o arquivo `.env.example` para `.env` e configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas credenciais do Supabase
   ```

5. Inicialize o banco de dados no Supabase:
   ```bash
   # Execute o script SQL no painel do Supabase ou use o script
   python execute_sql_script.py
   ```

6. Crie um usuário administrador:
   ```bash
   python create_admin_user.py
   ```

### Configuração do Frontend

1. Navegue até a pasta do frontend:
   ```bash
   cd zap-niver-dashboard
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Copie o arquivo `.env.example` para `.env.local` e configure as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   # Edite o arquivo .env.local com suas credenciais do Supabase
   ```

### Iniciando o Ambiente de Desenvolvimento

Para facilitar o início de todos os serviços, use o script `start-dev-environment.bat` (Windows) na raiz do projeto:

```bash
# No Windows
start-dev-environment.bat

# Manualmente (em terminais separados)
# Terminal 1 - API
cd backend && python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 - Worker Celery
cd backend && python -m celery -A app.worker worker --loglevel=info

# Terminal 3 - Beat Celery
cd backend && python -m celery -A app.worker beat --loglevel=info

# Terminal 4 - Frontend
cd zap-niver-dashboard && npm run dev
```

Após iniciar todos os serviços, você pode acessar:
- Frontend: http://localhost:5173
- API Backend: http://localhost:8000
- Documentação da API: http://localhost:8000/docs

## Interface de Administração

O NiverZap inclui uma interface de administração completa para gerenciar planos, usuários e configurações do sistema. Para acessar esta interface:

1. Faça login como administrador (email: admin@niverzap.com, senha: Admin@123)
2. Acesse a opção "Administração" no menu lateral

A interface de administração permite:
- Gerenciar planos: criar, editar, ativar/desativar e excluir planos
- Gerenciar usuários: visualizar, ativar/desativar usuários e alterar planos
- Configurações do sistema (em breve)

## Implantação em Produção com Docker Swarm e Portainer

### Pré-requisitos

- Servidor VPS com Docker instalado
- Portainer instalado e configurado no modo Swarm
- Domínio configurado (opcional, mas recomendado)

### Passos para Implantação

#### 1. Preparação do Ambiente

1. Acesse sua VPS via SSH:
   ```bash
   ssh usuario@seu-servidor
   ```

2. Instale o Docker (se ainda não estiver instalado):
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```

3. Inicialize o Docker Swarm:
   ```bash
   docker swarm init
   ```

4. Instale o Portainer:
   ```bash
   docker volume create portainer_data
   docker run -d -p 8000:8000 -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
   ```

5. Acesse o Portainer em `http://seu-servidor:9000` e configure o modo Swarm.

#### 2. Configuração do Projeto

1. Clone o repositório na VPS:
   ```bash
   git clone https://github.com/seu-usuario/niverzap.git
   cd niverzap
   ```

2. Configure as variáveis de ambiente para produção:
   ```bash
   cp .env.example .env.production
   # Edite o arquivo .env.production com suas configurações
   ```

#### 3. Implantação via Portainer

1. Acesse o Portainer e vá para "Stacks" > "Add stack"
2. Dê um nome à stack (ex: "niverzap")
3. Carregue o arquivo `docker-compose.swarm.yml`
4. Clique em "Deploy the stack"

#### 4. Implantação via Linha de Comando

Alternativamente, você pode implantar usando o script `deploy.sh`:

```bash
chmod +x deploy.sh
./deploy.sh
```

#### 5. Configuração do Traefik (opcional, para HTTPS)

Para configurar HTTPS com Traefik:

1. Crie uma rede para o Traefik:
   ```bash
   docker network create --driver=overlay traefik-public
   ```

2. Atualize as configurações dos serviços frontend e api para usar o Traefik:
   ```yaml
   frontend:
     # ... outras configurações ...
     deploy:
       labels:
         - "traefik.enable=true"
         - "traefik.http.routers.frontend.rule=Host(`seu-dominio.com`)"
         - "traefik.http.routers.frontend.entrypoints=websecure"
         - "traefik.http.routers.frontend.tls.certresolver=myresolver"
   ```

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Suporte

Para suporte, entre em contato através do email: suporte@niverzap.com
