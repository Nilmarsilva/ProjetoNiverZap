# Acesso ao Sistema NiverZap

Este documento fornece instruções para acessar e utilizar o sistema NiverZap completo em ambiente Docker.

## Visão Geral

O sistema NiverZap é composto por vários componentes que trabalham juntos:

1. **Frontend**: Interface de usuário para interação com o sistema
2. **Backend (API)**: Serviços que processam as requisições e gerenciam os dados
3. **Banco de Dados**: PostgreSQL para armazenamento persistente
4. **Cache**: Redis para melhorar a performance
5. **Monitoramento**: Prometheus e Grafana para monitoramento do sistema

## URLs de Acesso

Após implantar a stack completa, você pode acessar os diferentes componentes através dos seguintes URLs:

| Componente   | URL                    | Credenciais Padrão    |
|--------------|------------------------|------------------------|
| Frontend     | http://localhost       | Conforme configurado   |
| API          | http://localhost/api   | N/A                    |
| Monitoramento| Ver `monitoramento.md` | Ver `monitoramento.md` |

## Implantação do Sistema Completo

Para implantar o sistema completo, siga os passos abaixo:

### 1. Construir as imagens Docker

```bash
# Construir imagem da API
docker build -t niverzap-api:latest -f Dockerfile.niverzap-api .

# Construir imagem do Frontend
docker build -t niverzap-frontend:latest -f ./zap-niver-dashboard/Dockerfile ./zap-niver-dashboard
```

### 2. Implantar a stack principal

```bash
# Implantar stack NiverZap
docker stack deploy -c stacks/niverzap.yaml niverzap
```

### 3. Implantar o sistema de monitoramento

```bash
# Implantar stack de monitoramento
docker stack deploy -c stacks/monitoring-stack.yaml monitoring
```

### 4. Verificar o status dos serviços

```bash
# Verificar serviços da stack NiverZap
docker stack services niverzap

# Verificar serviços da stack de monitoramento
docker stack services monitoring
```

## Arquitetura do Sistema

### Fluxo de Requisições

1. O usuário acessa o frontend através do navegador (http://localhost)
2. O Nginx atua como proxy reverso, direcionando as requisições:
   - Requisições para a raiz (/) são enviadas para o serviço do frontend
   - Requisições para /api são enviadas para o serviço da API
3. A API processa as requisições e interage com o PostgreSQL e Redis conforme necessário

### Comunicação entre Serviços

Os serviços se comunicam através da rede Docker Swarm `network_public`:

- Frontend → Nginx → API → PostgreSQL/Redis

## Desenvolvimento Local

Para desenvolvimento local, você pode:

1. **Executar apenas o backend na stack Docker**:
   - Implante apenas os serviços de backend (API, PostgreSQL, Redis)
   - Execute o frontend localmente com `npm run dev` na pasta `zap-niver-dashboard`

2. **Executar o sistema completo na stack Docker**:
   - Implante a stack completa conforme descrito acima
   - Faça alterações no código e reconstrua as imagens conforme necessário

## Troubleshooting

### Frontend não carrega

1. Verifique se o serviço do frontend está em execução:
   ```bash
   docker service logs niverzap_frontend
   ```

2. Verifique a configuração do Nginx:
   ```bash
   docker service logs niverzap_nginx
   ```

### API não responde

1. Verifique se o serviço da API está em execução:
   ```bash
   docker service logs niverzap_api
   ```

2. Teste a API diretamente:
   ```bash
   curl http://localhost/api/health
   ```

### Problemas de conexão com o banco de dados

1. Verifique se o serviço do PostgreSQL está em execução:
   ```bash
   docker service ls --filter name=postgres
   ```

2. Verifique os logs do PostgreSQL:
   ```bash
   docker service logs postgres_postgres
   ```
