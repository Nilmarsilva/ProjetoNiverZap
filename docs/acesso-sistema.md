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

## Integração de Pagamentos

### Status Atual

A integração com o Asaas foi removida completamente do sistema devido a problemas com o ambiente sandbox e configuração inadequada. Atualmente, o sistema está utilizando um checkout simulado para testes, enquanto aguarda a implementação da integração com o Stripe.

### Fluxo de Pagamento Atual

1. O usuário seleciona um plano na página de planos
2. O sistema redireciona para uma página de checkout simulado
3. Após o "pagamento", o usuário é redirecionado para a página de sucesso

### Implementação Futura com Stripe

A integração com o Stripe está planejada para substituição do Asaas. As variáveis de ambiente já estão preparadas no arquivo `.env` (comentadas) e o código foi preparado para facilitar essa implementação.

Para implementar o Stripe:

1. Obtenha as chaves de API do Stripe (pública e secreta)
2. Descomente e configure as variáveis de ambiente no arquivo `.env`
3. Implemente o serviço `stripeService.ts` seguindo a documentação oficial do Stripe
4. Atualize o componente `PlansPage.tsx` para utilizar o Stripe Checkout

Documentação de referência: https://stripe.com/docs/checkout/quickstart

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
