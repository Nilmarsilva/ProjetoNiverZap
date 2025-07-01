# Acesso às Interfaces de Monitoramento - NiverZap

Este documento fornece instruções para acessar e utilizar as interfaces de monitoramento do projeto NiverZap.

## Interfaces Disponíveis

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

## Dashboards Disponíveis

### NiverZap Dashboard

Este dashboard fornece uma visão geral do sistema, incluindo:

- **CPU Usage**: Uso de CPU por serviço
- **Memory Usage**: Consumo de memória por serviço
- **Network Traffic**: Tráfego de rede de entrada e saída
- **HTTP Request Rate**: Taxa de requisições HTTP

## Configurando Alertas

### No Grafana

1. Acesse o painel que deseja monitorar
2. Clique em "Edit" (ícone de engrenagem)
3. Vá para a aba "Alert"
4. Configure as condições do alerta
5. Defina os canais de notificação

## Métricas Importantes para Monitorar

### Infraestrutura
- **CPU**: Alerta quando o uso estiver acima de 80% por mais de 5 minutos
- **Memória**: Alerta quando o uso estiver acima de 85% por mais de 5 minutos
- **Disco**: Alerta quando o espaço disponível estiver abaixo de 10%

### Aplicação
- **Tempo de resposta**: Alerta quando o tempo médio de resposta estiver acima de 500ms
- **Taxa de erros**: Alerta quando a taxa de erros estiver acima de 1%
- **Disponibilidade**: Alerta quando o serviço estiver indisponível por mais de 1 minuto

## Troubleshooting

### Prometheus não está coletando métricas
1. Verifique se todos os serviços estão em execução: `docker service ls --filter name=monitoring`
2. Verifique os logs do Prometheus: `docker service logs monitoring_prometheus`
3. Acesse a interface do Prometheus e verifique a aba "Status > Targets"

### Grafana não exibe dados
1. Verifique se o Prometheus está funcionando corretamente
2. Verifique a configuração da fonte de dados no Grafana (Admin > Data Sources)
3. Teste a conexão com o Prometheus na configuração da fonte de dados

## Comandos Úteis

```bash
# Verificar status dos serviços de monitoramento
docker service ls --filter name=monitoring

# Verificar logs do Prometheus
docker service logs monitoring_prometheus

# Verificar logs do Grafana
docker service logs monitoring_grafana

# Reiniciar serviço Prometheus
docker service update --force monitoring_prometheus

# Reiniciar serviço Grafana
docker service update --force monitoring_grafana
```
