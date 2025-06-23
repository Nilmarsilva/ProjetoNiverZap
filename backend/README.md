# NiverZap - Backend

Sistema de envio automático de mensagens de aniversário via WhatsApp.

## Tecnologias Utilizadas

- **FastAPI**: Framework web para construção de APIs
- **Supabase**: Banco de dados PostgreSQL como serviço
- **Redis**: Armazenamento em cache e filas de mensagens
- **Celery**: Processamento de tarefas em segundo plano
- **WhatsApp APIs**: Integração com diferentes provedores de API para WhatsApp

## O Que Foi Implementado

1. **Serviços para interação com o Supabase**:
   - `UserService`: gerenciamento de usuários, autenticação e planos
   - `ContactService`: gerenciamento de contatos e busca de aniversariantes
   - `TemplateService`: gerenciamento de templates de mensagens
   - `MessageService`: agendamento e gerenciamento de mensagens
   - `PlanService`: gerenciamento de planos de assinatura

2. **Tarefas Celery para processamento em segundo plano**:
   - Verificação diária de aniversários
   - Processamento de mensagens pendentes
   - Envio de mensagens agendadas

3. **Endpoints da API**:
   - Autenticação: login e registro de usuários
   - Usuários: gerenciamento de perfil e planos
   - Contatos: CRUD de contatos
   - Templates: CRUD de templates de mensagens
   - Mensagens: agendamento e envio de mensagens
   - Planos: listagem de planos disponíveis

4. **Scripts de Inicialização e Utilitários**:
   - `create_tables.sql`: criação das tabelas no Supabase
   - `init_db.py`: inicialização de planos padrão
   - `worker.py`: inicialização do worker do Celery
   - `beat.py`: inicialização do beat do Celery
   - `start.py`: inicialização da API FastAPI
   - `test_connection.py`: teste de conexão com Supabase e Redis
   - `run_dev.py`: script para iniciar todo o ambiente de desenvolvimento

## Estrutura do Projeto

```
backend/
├── app/
│   ├── api/              # Endpoints da API
│   │   └── v1/           # Versão 1 da API
│   │       ├── endpoints/# Endpoints específicos
│   │       └── api.py    # Roteador principal da API
│   ├── core/             # Configurações e utilitários
│   │   ├── celery_app.py # Configuração do Celery
│   │   ├── config.py     # Configurações da aplicação
│   │   └── security.py   # Funções de segurança
│   ├── db/               # Conexão com banco de dados
│   │   ├── create_tables.sql # Script SQL para criar tabelas
│   │   ├── init_db.py    # Script para inicializar o banco
│   │   └── supabase.py   # Cliente Supabase
│   ├── integrations/     # Integrações com APIs externas
│   │   ├── evolution_api.py # Conector Evolution API
│   │   ├── factory.py    # Fábrica de conectores
│   │   ├── whatsapp_official.py # Conector WhatsApp Official
│   │   └── zapi.py       # Conector Z-API
│   ├── models/           # Modelos de dados
│   │   ├── contact.py    # Modelos de contatos
│   │   ├── message.py    # Modelos de mensagens
│   │   ├── plan.py       # Modelos de planos
│   │   ├── template.py   # Modelos de templates
│   │   └── user.py       # Modelos de usuários
│   ├── services/         # Serviços de negócio
│   │   ├── contact_service.py  # Serviço de contatos
│   │   ├── message_service.py  # Serviço de mensagens
│   │   ├── plan_service.py     # Serviço de planos
│   │   ├── template_service.py # Serviço de templates
│   │   └── user_service.py     # Serviço de usuários
│   ├── tasks/            # Tarefas do Celery
│   │   ├── birthday_tasks.py  # Tarefas de verificação de aniversários
│   │   └── message_tasks.py   # Tarefas de processamento de mensagens
│   └── main.py           # Ponto de entrada da aplicação
├── .env                  # Variáveis de ambiente (não versionado)
├── .env.example          # Exemplo de variáveis de ambiente
├── beat.py               # Script para iniciar o beat do Celery
├── requirements.txt      # Dependências do projeto
├── run_dev.py            # Script para iniciar todo o ambiente
├── start.py              # Script para iniciar a API
├── test_connection.py    # Script para testar conexões
└── worker.py             # Script para iniciar o worker do Celery
```

## Próximos Passos

1. **Configurar o ambiente**:
   - Criar um arquivo `.env` baseado no `.env.example`
   - Configurar o Supabase com as tabelas necessárias
   - Configurar o Redis para processamento em segundo plano

2. **Testar a aplicação**:
   - Executar `python test_connection.py` para verificar as conexões
   - Executar `python run_dev.py` para iniciar todo o ambiente de desenvolvimento
   - Acessar a documentação da API em http://localhost:8000/docs

3. **Integrar com o frontend**:
   - Conectar o frontend React com os endpoints da API
   - Implementar as telas de gerenciamento de contatos, templates e mensagens

## Configuração

1. Clone o repositório
2. Crie um arquivo `.env` baseado no `.env.example`
3. Instale as dependências:

```bash
pip install -r requirements.txt
```

4. Configure o banco de dados Supabase:
   - Crie um projeto no Supabase
   - Execute o script SQL em `app/db/create_tables.sql` no SQL Editor do Supabase
   - Atualize as variáveis `SUPABASE_URL` e `SUPABASE_KEY` no arquivo `.env`

5. Configure o Redis:
   - Instale o Redis localmente ou use um serviço como Redis Labs
   - Atualize as variáveis `REDIS_HOST`, `REDIS_PORT` e `REDIS_DB` no arquivo `.env`

6. Configure as APIs de WhatsApp:
   - Obtenha as credenciais para as APIs que deseja utilizar (Z-API, WhatsApp Official API, Evolution API)
   - Atualize as variáveis correspondentes no arquivo `.env`

## Inicialização do Banco de Dados

Para inicializar o banco de dados com os planos padrão, execute:

```bash
python -m app.db.init_db
```

## Executando a Aplicação

### Método Simples (Recomendado)

Para iniciar todo o ambiente de desenvolvimento com um único comando:

```bash
python run_dev.py
```

Este script irá:
1. Testar as conexões com Supabase e Redis
2. Iniciar a API FastAPI
3. Iniciar o worker do Celery
4. Iniciar o beat do Celery

### Método Manual

Se preferir iniciar os componentes separadamente:

1. Inicie a API:

```bash
python start.py
```

2. Inicie o worker do Celery:

```bash
python worker.py
```

3. Inicie o beat do Celery para tarefas agendadas:

```bash
python beat.py
```

## Endpoints da API

A documentação completa da API está disponível em:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Principais Endpoints

- **Autenticação**:
  - `POST /api/v1/auth/login`: Obter token de acesso
  - `POST /api/v1/auth/register`: Registrar novo usuário

- **Usuários**:
  - `GET /api/v1/users/me`: Obter dados do usuário atual
  - `PUT /api/v1/users/me`: Atualizar dados do usuário atual
  - `GET /api/v1/users/me/plan`: Obter plano do usuário atual

- **Contatos**:
  - `GET /api/v1/contacts`: Listar contatos
  - `POST /api/v1/contacts`: Criar novo contato
  - `GET /api/v1/contacts/{contact_id}`: Obter contato específico
  - `PUT /api/v1/contacts/{contact_id}`: Atualizar contato
  - `DELETE /api/v1/contacts/{contact_id}`: Remover contato

- **Templates**:
  - `GET /api/v1/templates`: Listar templates
  - `POST /api/v1/templates`: Criar novo template
  - `GET /api/v1/templates/{template_id}`: Obter template específico
  - `PUT /api/v1/templates/{template_id}`: Atualizar template
  - `DELETE /api/v1/templates/{template_id}`: Remover template

- **Mensagens**:
  - `GET /api/v1/messages`: Listar mensagens
  - `POST /api/v1/messages`: Criar nova mensagem
  - `GET /api/v1/messages/{message_id}`: Obter mensagem específica
  - `POST /api/v1/messages/{message_id}/send`: Enviar mensagem imediatamente
  - `DELETE /api/v1/messages/{message_id}`: Cancelar mensagem

- **Planos**:
  - `GET /api/v1/plans`: Listar planos disponíveis
  - `GET /api/v1/plans/{plan_id}`: Obter plano específico

## Tarefas Agendadas

- Verificação diária de aniversários
- Processamento de mensagens pendentes a cada minuto

## Integrações com WhatsApp

O sistema suporta diferentes provedores de API para WhatsApp:

- **Z-API**: Provedor padrão, disponível em todos os planos
- **Evolution API**: Disponível nos planos Profissional e Avançado
- **WhatsApp Official API**: Disponível apenas no plano Avançado

## Melhorias Futuras

- Implementar testes automatizados
- Adicionar monitoramento e logging avançado
- Implementar mais provedores de WhatsApp
- Adicionar recursos de análise e relatórios
