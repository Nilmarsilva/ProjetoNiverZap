# Sistema de Monitoramento - NiverZap

Este documento descreve a configuração e uso do sistema de monitoramento para a aplicação NiverZap, implementado com Prometheus e Grafana.

## Visão Geral

O sistema de monitoramento consiste em três componentes principais:

1. **Prometheus**: Coleta e armazena métricas de todos os serviços
2. **Grafana**: Visualização de métricas em dashboards interativos
3. **Node Exporter**: Coleta métricas do host (CPU, memória, disco, rede)

Nota: O cAdvisor foi removido da configuração por incompatibilidade com o Docker Desktop no Windows.

## Acesso às Interfaces

### Prometheus

**URL de Acesso**: http://localhost:9090

O Prometheus é a ferramenta responsável pela coleta e armazenamento de métricas. Através da interface web, você pode:

1. **Executar consultas PromQL**: Na aba "Graph", digite consultas para visualizar métricas específicas
2. **Verificar targets**: Na aba "Status > Targets", verifique o status dos endpoints monitorados
3. **Explorar métricas**: Na aba "Status > Targets", veja todas as métricas disponíveis

**Consultas úteis**:
- `rate(node_cpu_seconds_total{mode="user"}[1m])` - Uso de CPU por minuto
- `node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100` - Porcentagem de memória disponível
- `node_filesystem_avail_bytes{mountpoint="/"}` - Espaço em disco disponível

### Grafana

**URL de Acesso**: http://localhost:3000

**Credenciais padrão**:
- **Usuário**: admin
- **Senha**: niverzap2025

O Grafana é a ferramenta de visualização de métricas. Através da interface, você pode:

1. **Acessar dashboards**: Na seção "Dashboards", acesse o dashboard "NiverZap Dashboard"
2. **Personalizar visualizações**: Edite os painéis existentes ou crie novos
3. **Configurar alertas**: Defina condições para receber notificações

## Estrutura de Arquivos

```
monitoring/
│── prometheus/
│   └── prometheus.yml      # Configuração do Prometheus
│── grafana/
│   └── provisioning/
│       ├── dashboards/     # Dashboards pré-configurados
│       └── datasources/    # Fontes de dados pré-configuradas
└── monitoring-stack.yaml   # Stack Docker para implantação
```

## Implantação

### Pré-requisitos

- Docker Swarm inicializado
- Rede `network_public` criada

### Passos para Implantação

1. Copie o arquivo `monitoring-stack.yaml` para a pasta `stacks/` (ou use o arquivo diretamente da pasta `monitoring/`)

2. Implante a stack de monitoramento:

```bash
docker stack deploy -c monitoring-stack.yaml monitoring
```

3. Verifique se os serviços estão em execução:

```bash
docker service ls --filter name=monitoring
```

## Acessando as Interfaces

- **Prometheus**: http://localhost:9090 (ou http://seu-servidor:9090 em produção)
- **Grafana**: http://localhost:3000 (ou http://seu-servidor:3000 em produção)
  - Usuário: admin
  - Senha: niverzap2025 (altere em produção!)

## Dashboards Disponíveis

O sistema vem com um dashboard pré-configurado:

- **NiverZap Dashboard**: Visão geral do sistema com métricas de CPU, memória, rede e requisições HTTP

## Configurando Alertas

### No Grafana

1. Acesse o Grafana e faça login
2. Vá para Alerting > Alert Rules
3. Clique em "New alert rule"
4. Configure as condições do alerta (ex: CPU acima de 80% por 5 minutos)
5. Defina os canais de notificação (email, Slack, etc.)

### No Prometheus

Para alertas mais avançados, você pode configurar o Alertmanager:

1. Edite o arquivo `prometheus.yml` para incluir regras de alerta
2. Adicione o serviço Alertmanager ao `monitoring-stack.yaml`
3. Configure os canais de notificação no Alertmanager

## Métricas Importantes

### Métricas de Sistema
- `node_cpu_seconds_total`: Uso de CPU
- `node_memory_MemAvailable_bytes`: Memória disponível
- `node_filesystem_avail_bytes`: Espaço em disco disponível
- `node_network_receive_bytes_total`: Tráfego de rede recebido
- `node_network_transmit_bytes_total`: Tráfego de rede enviado

### Métricas de Container
- `container_cpu_usage_seconds_total`: Uso de CPU por container
- `container_memory_usage_bytes`: Uso de memória por container
- `container_network_receive_bytes_total`: Tráfego de rede recebido por container
- `container_network_transmit_bytes_total`: Tráfego de rede enviado por container

### Métricas de Aplicação
Para adicionar métricas específicas da aplicação NiverZap, você pode:

1. Implementar o cliente Prometheus na API Node.js
2. Adicionar métricas personalizadas como:
   - `niverzap_messages_sent_total`: Total de mensagens enviadas
   - `niverzap_api_requests_total`: Total de requisições à API
   - `niverzap_api_request_duration_seconds`: Duração das requisições à API

## Próximos Passos

1. **Implementar métricas específicas da aplicação**: Adicionar instrumentação à API Node.js
2. **Configurar retenção de dados**: Ajustar o período de retenção de métricas no Prometheus
3. **Configurar alertas para eventos críticos**: Definir alertas para falhas de serviço, uso elevado de recursos, etc.
4. **Integrar com sistemas de notificação**: Configurar notificações via email, Slack ou outros canais

## Referências

- [Documentação do Prometheus](https://prometheus.io/docs/introduction/overview/)
- [Documentação do Grafana](https://grafana.com/docs/)
- [Métricas do Node Exporter](https://github.com/prometheus/node_exporter)
- [Métricas do cAdvisor](https://github.com/google/cadvisor)
