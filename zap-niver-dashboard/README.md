# NiverZap Dashboard

O NiverZap é uma aplicação para automação de mensagens de aniversário via WhatsApp. Este repositório contém o código do dashboard administrativo e o backend da aplicação.

## Visão Geral

O NiverZap permite que usuários:

- Gerenciem contatos e seus aniversários
- Criem e personalizem templates de mensagens
- Agendem envios automáticos de mensagens de aniversário
- Gerenciem assinaturas e pagamentos via integração com Asaas

## Tecnologias Utilizadas

### Frontend
- React com TypeScript
- Vite como bundler
- Tailwind CSS para estilização
- shadcn/ui para componentes de interface
- Zustand para gerenciamento de estado
- React Hook Form + Zod para formulários e validação
- Axios para requisições HTTP

### Backend
- Node.js com Express
- JWT para autenticação
- PostgreSQL para banco de dados (arquitetura multi-tenant escalável)
- Knex.js como query builder SQL
- Redis para cache e gerenciamento de filas
- Integração com Asaas para pagamentos
- Integração com Z-API para envio de mensagens WhatsApp

## Estrutura do Projeto

```
/
├── public/              # Arquivos estáticos
├── server/              # Backend da aplicação
│   ├── src/
│   │   ├── config/      # Configurações (banco de dados, etc)
│   │   ├── controllers/ # Controladores da API
│   │   ├── database/    # Migrações e seeds do banco de dados
│   │   │   ├── migrations/ # Scripts de migração do PostgreSQL
│   │   │   └── seeds/     # Dados iniciais para o banco
│   │   ├── middleware/  # Middlewares (autenticação, etc)
│   │   ├── models/      # Modelos de dados
│   │   ├── routes/      # Rotas da API
│   │   ├── services/    # Serviços (Asaas, Z-API, etc)
│   │   └── utils/       # Utilitários
│   ├── .env             # Variáveis de ambiente
│   ├── knexfile.js      # Configuração do Knex.js
│   └── package.json     # Dependências do backend
├── src/                 # Frontend da aplicação
│   ├── components/      # Componentes React
│   ├── hooks/           # Hooks personalizados
│   ├── lib/             # Bibliotecas e utilitários
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços de API
│   └── stores/          # Stores Zustand
├── package.json         # Dependências do projeto
└── server.js           # Script para iniciar o backend junto com o frontend
```

## Funcionalidades Implementadas

### Autenticação e Perfil de Usuário
- Sistema de login e registro
- Perfil de usuário completo com dados para integração com Asaas
- Validação de perfil completo antes de permitir compra de planos

### Gerenciamento de Planos
- Visualização de planos disponíveis
- Compra de planos com integração ao Asaas
- Área administrativa para gerenciamento de planos

### Contatos e Templates
- Importação e gerenciamento de contatos
- Criação e personalização de templates de mensagens
- Agendamento de envios automáticos

## Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v16+)
- npm ou yarn
- PostgreSQL (v13+)
- Redis (para cache e filas)

### Instalação

```bash
# Clonar o repositório
git clone <URL_DO_REPOSITORIO>
cd zap-niver-dashboard

# Instalar dependências (frontend e backend)
npm run setup
```

### Configuração

1. Copie o arquivo `.env.example` para `.env` na pasta `server/`
2. Configure as variáveis de ambiente com suas credenciais:
   - Asaas API Key
   - Z-API Token
   - Configurações do banco de dados PostgreSQL
   - Configurações do Redis

### Configuração do Banco de Dados

1. Certifique-se de que o PostgreSQL está em execução
2. Crie um banco de dados para o NiverZap:

```sql
CREATE DATABASE niverzap;
```

3. Execute as migrações do banco de dados:

```bash
cd server
npx knex migrate:latest
```

4. (Opcional) Execute os seeds para popular o banco com dados iniciais:

```bash
npx knex seed:run
```

### Estrutura do Banco de Dados

O NiverZap utiliza uma arquitetura multi-tenant com as seguintes tabelas principais:

- **organizations**: Empresas/clientes do NiverZap
- **users**: Usuários das organizations
- **customers**: Contatos dos clientes (pessoas que receberão mensagens)
- **message_templates**: Templates de mensagens
- **messages**: Mensagens enviadas ou agendadas
- **plans**: Planos disponíveis
- **subscriptions**: Assinaturas dos clientes
- **events**: Log de eventos e auditoria

O modelo de dados completo está documentado no arquivo `planejamento.txt`.

3. Configure a chave JWT e outras variáveis de segurança:

### Execução

**Iniciar apenas o frontend:**
```bash
npm run dev:frontend
```

**Iniciar apenas o backend:**
```bash
npm run dev:backend
```

**Iniciar frontend e backend juntos:**
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:5000`.

## Status de Implementação

O projeto está migrando de um armazenamento em memória para um banco de dados PostgreSQL escalável. As migrações e modelos já foram criados e estão prontos para uso.

## Integração com Asaas

O projeto utiliza a API do Asaas para:

1. Criar clientes a partir dos dados do perfil do usuário
2. Gerar cobranças para compra de planos
3. Gerenciar assinaturas recorrentes
4. Receber notificações de pagamentos via webhooks

## Integração com Z-API

O Z-API é utilizado para:

1. Enviar mensagens automáticas de aniversário
2. Verificar status de entrega das mensagens
3. Gerenciar a conexão com o WhatsApp

## Próximos Passos

1. Implementar a persistência real de dados com PostgreSQL
2. Completar a integração com o Asaas para cobranças e assinaturas
3. Implementar a integração com Z-API para envio de mensagens
4. Desenvolver o sistema de agendamento de mensagens
5. Implementar a importação em massa de contatos

## Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova funcionalidade'`)
4. Faça push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request
