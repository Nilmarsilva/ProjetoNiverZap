# Guia do Usuário - Interface de Administração NiverZap

## Introdução

Bem-vindo à interface de administração do NiverZap! Este guia foi criado para ajudar você a utilizar todas as funcionalidades disponíveis na área administrativa do sistema.

## Acessando a Interface de Administração

1. Faça login no sistema com suas credenciais de administrador (email: admin@niverzap.com)
2. No menu lateral esquerdo, clique no item "Administração" (ícone de escudo)
3. Você será redirecionado para a página de administração do sistema

## Navegação

A interface de administração está organizada em três abas principais:

1. **Planos**: Gerenciamento de planos de assinatura
2. **Usuários**: Gerenciamento de usuários do sistema
3. **Relatórios**: Visualização de estatísticas e relatórios

## Gerenciamento de Planos

### Visualizando Planos

Na aba "Planos", você verá uma tabela com todos os planos cadastrados no sistema, contendo as seguintes informações:
- Nome do plano
- Descrição
- Preço
- Limite de mensagens
- Status (Ativo/Inativo)
- Ações disponíveis

### Criando um Novo Plano

Para criar um novo plano:

1. Clique no botão "Adicionar Plano" no topo da tabela
2. Preencha o formulário com as informações do plano:
   - **Nome**: Nome do plano (ex: "Plano Básico")
   - **Descrição**: Detalhes sobre o plano
   - **Preço**: Valor mensal do plano em reais
   - **Limite de Mensagens**: Quantidade máxima de mensagens que o usuário pode enviar por mês
   - **Recursos**: Lista de recursos incluídos no plano (opcional)
   - **Status**: Ativo ou Inativo
3. Clique em "Salvar" para criar o plano

### Editando um Plano

Para editar um plano existente:

1. Clique no ícone de edição (lápis) na linha do plano que deseja modificar
2. Faça as alterações necessárias no formulário
3. Clique em "Salvar" para atualizar o plano

### Excluindo um Plano

Para excluir um plano:

1. Clique no ícone de exclusão (lixeira) na linha do plano que deseja remover
2. Um diálogo de confirmação será exibido
3. Clique em "Excluir" para confirmar a exclusão ou "Cancelar" para manter o plano

**Importante**: Só é possível excluir planos que não estejam associados a nenhum usuário.

## Gerenciamento de Usuários

### Visualizando Usuários

Na aba "Usuários", você verá uma tabela com todos os usuários cadastrados no sistema, contendo as seguintes informações:
- Nome do usuário
- Email
- Plano atual
- Status (Ativo/Inativo)
- Data de cadastro
- Ações disponíveis

### Ativando/Desativando Usuários

Para alterar o status de um usuário:

1. Clique no botão de status na linha do usuário
2. Confirme a alteração no diálogo exibido

### Alterando o Plano de um Usuário

Para alterar o plano de um usuário:

1. Clique no ícone de configurações na linha do usuário
2. Selecione o novo plano no menu suspenso
3. Confirme a alteração

## Relatórios e Estatísticas

Na aba "Relatórios", você encontrará gráficos e estatísticas sobre o uso do sistema:

### Usuários

- Distribuição de usuários por plano (gráfico de pizza)
- Crescimento de usuários nos últimos 6 meses (gráfico de barras)

### Mensagens

- Total de mensagens enviadas nos últimos 7 dias (gráfico de linha)

### Visão Geral

- Total de usuários
- Total de mensagens enviadas
- Plano mais popular

Você pode exportar os relatórios clicando no botão "Exportar Relatório" abaixo de cada seção.

## Dicas e Boas Práticas

1. **Planos**: Mantenha os nomes dos planos curtos e descritivos
2. **Preços**: Use valores com até duas casas decimais
3. **Usuários**: Verifique regularmente usuários inativos para manter a base de dados limpa
4. **Relatórios**: Utilize os relatórios para identificar tendências e tomar decisões estratégicas

## Solução de Problemas

### Não consigo acessar a área administrativa

Verifique se:
- Você está logado com uma conta de administrador
- Seu usuário está ativo no sistema
- Você tem permissões de administrador

### Não consigo excluir um plano

Verifique se:
- O plano não está associado a nenhum usuário
- Você tem permissões para excluir planos

### Os relatórios não estão carregando

Verifique se:
- Sua conexão com a internet está funcionando
- O servidor do Supabase está online
- Você tem permissões para acessar os dados

## Suporte

Se você encontrar problemas ou tiver dúvidas sobre a interface de administração, entre em contato com o suporte técnico pelo email suporte@niverzap.com.

---

Desenvolvido com ❤️ pela equipe NiverZap
