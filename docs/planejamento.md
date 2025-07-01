
# PLANEJAMENTO DO BANCO DE DADOS ESCALÁVEL

## PROGRESSO DE IMPLEMENTAÇÃO (Atualizado em 23/06/2025)

### 0. Configuração da Infraestrutura
- [x] Configurar Docker Swarm na VPS
  * Serviços implantados: PostgreSQL, Redis, Traefik, Portainer, pgAdmin, MinIO
  * Arquivos de configuração adicionados na pasta `/stacks`
- [x] Configurar DNS para o domínio authbrasil.app.br
  * Registro A para server.authbrasil.app.br (89.116.186.161)
  * Registros CNAME para subdomínios (api, app, pg, etc.)
- [x] Configurar repositório Git unificado
  * Resolvido problema de repositórios Git aninhados
  * Configurado repositório único com estrutura organizada

### 1. Configurar Knex.js e Criar Migrações
- [x] Instalar Knex.js e driver pg (já estavam instalados no projeto)
  * Commit: N/A - Já existente no package.json
- [x] Criar arquivo de configuração para conexão com PostgreSQL
  * Commit: "feat(database): Adicionar configuração do Knex.js para PostgreSQL"
  * Arquivo criado: server/knexfile.js
- [x] Criar migrações para as tabelas principais
  * Commit: "feat(database): Adicionar migrações para todas as tabelas do banco de dados"
  * Migrações criadas:
    - 20250623_enable_uuid_extension.js
    - 20250623_create_plans_table.js
    - 20250623_create_organizations_table.js
    - 20250623_create_users_table.js
    - 20250623_create_customers_table.js
    - 20250623_create_message_templates_table.js
    - 20250623_create_messages_table.js
    - 20250623_create_subscriptions_table.js
    - 20250623_create_events_table.js

### 2. Implementar Modelos Básicos
- [x] Criar modelo Organization
  * Commit: "feat(models): Implementar modelo Organization com métodos CRUD"
  * Arquivo criado: server/src/models/organizationModel.js
- [x] Atualizar modelo User para PostgreSQL
  * Commit: "refactor(models): Migrar userModel de Map para PostgreSQL"
  * Arquivo atualizado: server/src/models/userModel.js
- [x] Criar modelo Customer
  * Commit: "feat(models): Implementar modelo Customer com métodos CRUD"
  * Arquivo criado: server/src/models/customerModel.js
- [x] Implementar métodos CRUD para cada modelo
  * Todos os modelos implementam métodos CRUD completos

### 3. Implementar Cache Distribuído com Redis
- [x] Configurar serviço de conexão com Redis
  * Commit: "feat(cache): Implementar serviço de cache Redis para ambiente distribuído"
  * Arquivo criado: server/src/services/cacheService.js
- [x] Integrar cache Redis no authController
  * Commit: "feat(auth): Integrar cache Redis no authController para otimização de autenticação"
  * Arquivo atualizado: server/src/controllers/authController.js
  * Implementado cache para verificação de token e dados de usuário
- [x] Integrar cache Redis no contactController
  * Commit: "feat(contacts): Implementar cache Redis no contactController para otimização de consultas"
  * Arquivo atualizado: server/src/controllers/contactController.js
  * Implementado cache para listagem, contagem e busca de contatos
  * Implementado cache para aniversariantes do dia e próximos aniversariantes
- [x] Implementar invalidação de cache
  * Commit: "feat: implementação completa de cache Redis e load balancing"
  * Implementado invalidação de cache no createContact, updateContact e deleteContact
  * Configurado TTL apropriado para diferentes tipos de dados

### 4. Configurar Load Balancing e Escalabilidade
- [x] Configurar Nginx como load balancer
  * Commit: "feat(infra): Configurar Nginx como load balancer para múltiplas réplicas da API"
  * Arquivo criado: nginx/conf/default.conf
  * Configurado balanceamento usando algoritmo least_conn
  * Implementado health checks para garantir disponibilidade
- [x] Configurar Docker Swarm para orquestração
  * Commit: "feat(infra): Configurar Docker Swarm para orquestração de contêineres"
  * Arquivo criado: stacks/niverzap.yaml
  * Configurado serviços para API e Nginx com integração aos serviços existentes (Redis e PostgreSQL)
  * Implementado Dockerfile personalizado para a API (Dockerfile.niverzap-api)
- [x] Criar scripts de teste para validação
  * Commit: "feat: implementação completa de cache Redis e load balancing"
  * Arquivos criados: scripts/test-swarm-setup.ps1 e scripts/test-swarm-setup.sh
  * Implementado testes para verificação de Docker Swarm, Redis e Nginx
- [x] Resolver problemas de comunicação entre serviços
  * Implementado solução para garantir que a API permaneça ativa no container
  * Configurado DNS correto para comunicação entre Nginx e API
  * Documentado comandos Docker em docker-commands.txt

### 5. Atualizar README
- [x] Documentar estrutura do banco de dados
  * Commit: "docs: Atualizar README com informações do banco de dados PostgreSQL"
- [x] Adicionar instruções para configuração do ambiente
  * Adicionadas instruções para configuração do PostgreSQL e execução das migrações
- [ ] Documentar API e endpoints
  * Pendente para próxima fase

## PRÓXIMOS PASSOS IMEDIATOS

### 1. Monitoramento e Logs
- [x] Implementar sistema de monitoramento para Docker Swarm
  * Commit: "feat(monitoring): Implementar sistema de monitoramento com Prometheus e Grafana"
  * Configurado Prometheus para coleta de métricas do host e containers
  * Implementado Grafana com dashboard para visualização de métricas
  * Criado arquivo de stack `monitoring-stack.yaml` para implantação
  * Documentado acesso e uso em `docs/acesso-monitoramento.md`
  * Adaptado para compatibilidade com Docker Desktop no Windows
- [ ] Centralizar logs da aplicação
  * Implementar ELK Stack (Elasticsearch, Logstash, Kibana) ou alternativa
  * Configurar retenção e rotação de logs
  * Implementar alertas para erros críticos

### 2. Expandir Funcionalidades da API
- [ ] Implementar endpoints adicionais para gerenciamento de mensagens
  * Criar endpoint para agendamento em massa
  * Implementar endpoint para relatórios de entrega
  * Adicionar suporte para mensagens multimídia
- [ ] Melhorar integração com WhatsApp Business API
  * Implementar webhook para recebimento de status de mensagens
  * Adicionar suporte para mensagens interativas (botões, listas)

### 3. Testes de Carga
- [ ] Preparar ambiente de teste isolado
  * Configurar réplica da infraestrutura em ambiente de teste
  * Preparar dados de teste realistas
- [ ] Realizar testes de carga com diferentes cenários
  * Simular carga normal de operação
  * Testar picos de tráfego (ex: datas comemorativas)
  * Avaliar limites de escalabilidade horizontal

### 4. Documentação Completa
- [ ] Documentar arquitetura do sistema
  * Criar diagrama de arquitetura completo
  * Documentar fluxos de dados entre componentes
  * Descrever estratégias de escala e recuperação
- [ ] Documentar API com Swagger/OpenAPI
  * Implementar documentação interativa para endpoints
  * Adicionar exemplos de uso para cada endpoint
  * Documentar códigos de erro e respostas

### 5. Executar Migrações e Criar Seeds
- [x] Executar migrações no banco de dados PostgreSQL
  * Migrações executadas manualmente via pgAdmin em 24/06/2025
  * Todas as tabelas criadas com sucesso: plans, organizations, users, customers, message_templates, messages, subscriptions, events
- [x] Criar seeds para planos padrão
  * Arquivo criado: server/src/database/seeds/01_plans.js
  * Implementa 4 planos: Gratuito, Básico, Profissional e Empresarial
- [x] Criar seed para usuário administrador
  * Arquivo criado: server/src/database/seeds/02_admin_user.js
  * Cria organização admin e usuário admin@niverzap.com
- [x] Executar seeds
  * Seeds executados manualmente via pgAdmin em 24/06/2025
  * Inseridos 4 planos padrão: Gratuito, Básico, Profissional e Empresarial
  * Inserida organização admin e usuário administrador

### 2. Atualizar Controladores
- [x] Atualizar authController.js para usar os novos modelos (25/06/2025)
  * Adaptados métodos register, login e verifyToken
  * Adicionado suporte para associar usuário a uma organização
  * Implementado registro de último login
- [x] Atualizar contactController.js para usar o modelo Customer (25/06/2025)
  * Migrado de modelo em memória para PostgreSQL
  * Adaptado para usar organization_id em vez de user_id
  * Implementadas validações de segurança
- [] Atualizar userController.js para usar os novos modelos Customer
  * Adaptar métodos para buscar contatos e aniversariantes
- [ ] Implementar organizationController.js
  * Criar endpoints para gerenciamento de organizações

### 3. Implementar Cache com Redis
- [ ] Criar serviço de cache
  * Criar arquivo: server/src/services/cacheService.js
- [ ] Implementar cache para templates de mensagens
- [ ] Implementar cache para configurações

## 1. Estrutura do Banco de Dados PostgreSQL

### Princípios de Design para Escalabilidade
- Particionamento de tabelas para dados que crescem rapidamente (contatos, mensagens)
- Índices otimizados para consultas frequentes
- Estrutura multi-tenant com isolamento de dados
- Preparação para sharding futuro
- Normalização adequada com desnormalização estratégica

### Modelo de Entidade-Relacionamento

#### Hierarquia de Entidades
1. **Organizations** (Empresas/Clientes do NiverZap)
2. **Users** (Usuários das Organizations)
3. **Customers** (Contatos dos clientes - pessoas que receberão mensagens)

### Tabelas Principais

#### 1. organizations
```
id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
email VARCHAR(255) UNIQUE
phone VARCHAR(20)
plan_id UUID REFERENCES plans(id)
asaas_customer_id VARCHAR(255)
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP
status VARCHAR(20) DEFAULT 'active'
```

#### 2. users
```
id UUID PRIMARY KEY
organization_id UUID REFERENCES organizations(id)
name VARCHAR(255) NOT NULL
email VARCHAR(255) UNIQUE NOT NULL
password VARCHAR(255) NOT NULL
role VARCHAR(50) DEFAULT 'user'
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP
last_login TIMESTAMP
is_active BOOLEAN DEFAULT true
```

#### 3. customers (contatos dos clientes)
```
id UUID PRIMARY KEY
organization_id UUID REFERENCES organizations(id)
name VARCHAR(255) NOT NULL
phone VARCHAR(20) NOT NULL
email VARCHAR(255)
birth_date DATE
tags JSONB
custom_fields JSONB
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP
status VARCHAR(20) DEFAULT 'active'
```

#### 4. message_templates
```
id UUID PRIMARY KEY
organization_id UUID REFERENCES organizations(id)
name VARCHAR(255) NOT NULL
content TEXT NOT NULL
variables JSONB
type VARCHAR(50) DEFAULT 'birthday'
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP
```

#### 5. messages
```
id UUID PRIMARY KEY
organization_id UUID REFERENCES organizations(id)
customer_id UUID REFERENCES customers(id)
template_id UUID REFERENCES message_templates(id)
content TEXT NOT NULL
status VARCHAR(50) DEFAULT 'pending'
sent_at TIMESTAMP
scheduled_for TIMESTAMP
metadata JSONB
created_at TIMESTAMP DEFAULT NOW()
```

#### 6. plans
```
id UUID PRIMARY KEY
name VARCHAR(255) NOT NULL
description TEXT
price DECIMAL(10,2) NOT NULL
billing_cycle VARCHAR(20) DEFAULT 'monthly'
max_contacts INTEGER
max_templates INTEGER
features JSONB
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP
```

#### 7. subscriptions
```
id UUID PRIMARY KEY
organization_id UUID REFERENCES organizations(id)
plan_id UUID REFERENCES plans(id)
asaas_subscription_id VARCHAR(255)
status VARCHAR(50) DEFAULT 'active'
start_date TIMESTAMP DEFAULT NOW()
end_date TIMESTAMP
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP
```

#### 8. events (para logging e auditoria)
```
id UUID PRIMARY KEY
organization_id UUID REFERENCES organizations(id)
user_id UUID REFERENCES users(id)
event_type VARCHAR(100) NOT NULL
entity_type VARCHAR(100)
entity_id UUID
details JSONB
created_at TIMESTAMP DEFAULT NOW()
```

## 2. Estratégia de Implementação

### Fase 1: Configuração Inicial (1-2 semanas)
- [x] Configurar PostgreSQL na VPS (já concluído - PostgreSQL instalado em container Docker)
- [x] Criar scripts de migração usando Knex.js
  * Mensagem de commit: "feat(database): Adicionar configuração do Knex.js para PostgreSQL"
  * Mensagem de commit: "feat(database): Adicionar migrações para todas as tabelas do banco de dados"
  * Descrição: Implementação do Knex.js como query builder para PostgreSQL e criação dos scripts de migração para as tabelas principais.
  * Status: CONCLUÍDO em 23/06/2025
- [x] Implementar modelos básicos (organizations, users, customers)
  * Mensagem de commit: "feat(models): Implementar modelo Organization com métodos CRUD"
  * Mensagem de commit: "refactor(models): Migrar userModel de Map para PostgreSQL"
  * Mensagem de commit: "feat(models): Implementar modelo Customer com métodos CRUD"
  * Descrição: Criação dos modelos para organizations, users e customers com métodos CRUD básicos.
  * Status: CONCLUÍDO em 23/06/2025
- [ ] Configurar backup automático
  * Mensagem de commit: "feat(ops): Adicionar scripts de backup automático para PostgreSQL"
  * Descrição: Implementação de scripts para backup diário do banco de dados com retenção configurável.

### Fase 2: Implementação de Funcionalidades Core (2-3 semanas)

#### PRÓXIMOS PASSOS IMEDIATOS:
- [ ] Criar e executar seeds para dados iniciais
  * Mensagem de commit: "feat(database): Adicionar seeds para planos e usuário admin"
  * Descrição: Criação de seeds para popular o banco com planos padrão e usuário administrador.
  * Arquivos a criar:
    - server/src/database/seeds/01_plans.js
    - server/src/database/seeds/02_admin_user.js

#### TAREFAS RESTANTES:
- [ ] Implementar autenticação com o novo modelo de dados
  * Mensagem de commit: "feat(auth): Atualizar sistema de autenticação para novo modelo de dados"
  * Descrição: Adaptação do sistema de autenticação JWT para trabalhar com o novo modelo multi-tenant.
  * Arquivos a atualizar: server/src/controllers/authController.js
- [ ] Migrar gerenciamento de contatos para o novo banco
  * Mensagem de commit: "feat(contacts): Migrar sistema de contatos para PostgreSQL"
  * Descrição: Migração do gerenciamento de contatos do modelo em memória para o PostgreSQL com suporte a organizações.
  * Arquivos a atualizar: server/src/controllers/contactController.js
- [ ] Implementar sistema de templates de mensagens
  * Mensagem de commit: "feat(messaging): Adicionar sistema de templates de mensagens"
  * Descrição: Implementação do CRUD de templates de mensagens com suporte a variáveis dinâmicas.
  * Arquivos a criar: 
    - server/src/models/messageTemplateModel.js
    - server/src/controllers/templateController.js
- [ ] Integrar com Asaas usando o novo modelo
  * Mensagem de commit: "feat(billing): Atualizar integração Asaas para novo modelo de dados"
  * Descrição: Adaptação da integração com Asaas para trabalhar com organizations e subscriptions.

### Fase 3: Otimização e Escalabilidade (2-3 semanas)

#### PRÓXIMOS PASSOS IMEDIATOS:
- [ ] Implementar cache com Redis
  * Mensagem de commit: "feat(cache): Adicionar serviço de cache com Redis"
  * Descrição: Implementação de um serviço de cache usando Redis para melhorar performance e reduzir carga no banco de dados.
  * Arquivos a criar:
    - server/src/services/cacheService.js
  * Priorizar cache para:
    - Templates de mensagens
    - Configurações de organizações
    - Listas de aniversariantes do dia

#### TAREFAS RESTANTES:
- [ ] Implementar índices otimizados
  * Mensagem de commit: "perf(database): Adicionar índices otimizados para consultas frequentes"
  * Descrição: Criação de índices estratégicos para melhorar performance de consultas de aniversariantes e busca por organização.
- [ ] Configurar connection pooling
  * Mensagem de commit: "perf(database): Implementar connection pooling para PostgreSQL"
  * Descrição: Configuração de pool de conexões para otimizar o uso de recursos do banco de dados.
- [x] Implementar cache com Redis para dados frequentes (Redis já disponível em container Docker)
  * Mensagem de commit: "feat(cache): Adicionar camada de cache com Redis"
  * Descrição: Implementação de cache para templates, configurações e dados frequentemente acessados.
- [ ] Configurar monitoramento de performance
  * Mensagem de commit: "ops(monitoring): Adicionar monitoramento de performance com Prometheus/Grafana"
  * Descrição: Configuração de dashboards para monitorar performance do banco de dados e da aplicação.

## 3. Considerações de Escalabilidade

### Particionamento
- Particionar tabela `messages` por mês
- Particionar tabela `customers` por organization_id

### Índices Estratégicos
```sql
-- Índices para busca rápida de aniversariantes
CREATE INDEX idx_customers_birth_date ON customers (EXTRACT(MONTH FROM birth_date), EXTRACT(DAY FROM birth_date));

-- Índice para busca por organização
CREATE INDEX idx_customers_organization ON customers (organization_id);

-- Índice para busca de mensagens por status
CREATE INDEX idx_messages_status ON messages (status, scheduled_for);
```

### Preparação para Sharding
- Usar UUIDs como chaves primárias
- Incluir organization_id em todas as tabelas principais
- Desenhar queries para funcionar com sharding futuro

## 4. Migração de Dados

### Estratégia de Migração
- [ ] Criar script para migrar dados do modelo atual (Map) para PostgreSQL
  * Mensagem de commit: "feat(migration): Adicionar scripts de migração de dados legados"
  * Descrição: Criação de scripts para migrar dados do modelo em memória para o PostgreSQL.
- [ ] Implementar validação de dados durante migração
  * Mensagem de commit: "feat(migration): Adicionar validação de dados para migração"
  * Descrição: Implementação de validação e limpeza de dados durante o processo de migração.
- [ ] Testar migração em ambiente de staging antes de produção
  * Mensagem de commit: "test(migration): Configurar ambiente de staging para testes de migração"
  * Descrição: Preparação de ambiente de staging para validar o processo de migração antes de aplicar em produção.

### Script de Migração (Pseudocódigo)
```javascript
// Para cada usuário no sistema atual
for (const [id, user] of usersDb) {
  // Criar organization
  const org = await db('organizations').insert({
    name: user.name + ' Organization',
    email: user.email,
    plan_id: getDefaultPlanId()
  }).returning('id');
  
  // Criar user associado à organization
  await db('users').insert({
    organization_id: org.id,
    name: user.name,
    email: user.email,
    password: user.password,
    role: user.isAdmin ? 'admin' : 'user'
  });
  
  // Migrar contatos
  // ...
}
```

## 5. Escalabilidade e Alta Disponibilidade

### Load Balancing
- [ ] Implementar load balancing com Nginx
  * Configurar distribuição de tráfego entre instâncias
  * Implementar health checks
  * Configurar SSL/TLS
- [ ] Adaptar aplicação para ambiente distribuído
  * Implementar middleware para identificar IP real do cliente
  * Garantir que todos os estados sejam armazenados em locais compartilhados

### Configuração do Nginx (Exemplo)
```nginx
# /etc/nginx/conf.d/niverzap.conf
upstream niverzap_backend {
    # Algoritmo de balanceamento
    ip_hash;  # Mantém sessões do mesmo IP no mesmo servidor
    
    server backend1.niverzap.com:3000;
    server backend2.niverzap.com:3000;
    server backend3.niverzap.com:3000;
    
    # Configuração de health check
    keepalive 64;
}

server {
    listen 80;
    server_name api.niverzap.com;
    
    location / {
        proxy_pass http://niverzap_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```