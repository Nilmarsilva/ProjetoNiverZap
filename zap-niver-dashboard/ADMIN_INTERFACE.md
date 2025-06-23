# Interface de Administração do NiverZap

Este documento descreve a interface de administração do NiverZap, suas funcionalidades e como utilizá-la.

![Logo NiverZap](./src/assets/logo.png)

## Visão Geral

A interface de administração do NiverZap permite gerenciar planos de assinatura, usuários e visualizar relatórios do sistema. Ela foi projetada para ser intuitiva e fácil de usar, permitindo que administradores realizem tarefas de gerenciamento sem necessidade de conhecimento técnico avançado.

## Acesso

A interface de administração é acessível apenas para usuários com privilégios de administrador. Por padrão, apenas o usuário `admin@niverzap.com` tem acesso à área administrativa.

Para acessar a interface de administração:

1. Faça login no sistema com suas credenciais de administrador
2. No menu lateral, clique em "Administração"

## Funcionalidades

### 1. Gerenciamento de Planos

A aba de gerenciamento de planos permite:

- **Visualizar todos os planos** existentes no sistema
- **Criar novos planos** com nome, descrição, preço e limite de mensagens
- **Editar planos existentes** para atualizar suas informações
- **Ativar/desativar planos** para controlar sua disponibilidade
- **Excluir planos** que não estão mais em uso (apenas se não houver usuários associados)

Cada plano possui os seguintes atributos:
- Nome: nome do plano exibido para os usuários
- Descrição: detalhes sobre o que o plano oferece
- Preço: valor mensal do plano
- Limite de mensagens: quantidade máxima de mensagens que podem ser enviadas por mês
- Status: ativo ou inativo

### 2. Gerenciamento de Usuários

A aba de gerenciamento de usuários permite:

- **Visualizar todos os usuários** cadastrados no sistema
- **Ver detalhes** de cada usuário, incluindo plano atual e status
- **Ativar/desativar usuários** para controlar seu acesso ao sistema
- **Alterar o plano** de um usuário específico

Cada usuário possui os seguintes atributos:
- Nome: nome completo do usuário
- Email: endereço de email (usado para login)
- Plano: plano de assinatura atual
- Status: ativo ou inativo
- Data de criação: quando a conta foi criada

### 3. Relatórios e Estatísticas

A aba de relatórios oferece:

- **Visão geral** do uso do sistema
- **Estatísticas de usuários** por plano
- **Estatísticas de mensagens** enviadas
- **Tendências de crescimento** de usuários

Os relatórios são apresentados em gráficos interativos e podem ser exportados para análise posterior.

## Segurança

A interface de administração implementa várias camadas de segurança:

1. **Autenticação**: apenas usuários logados podem acessar o sistema
2. **Autorização**: apenas administradores podem acessar a área administrativa
3. **Confirmação de ações destrutivas**: ações como exclusão de planos exigem confirmação
4. **Validação de dados**: todos os formulários validam os dados antes de processá-los

## Testes

A interface de administração possui testes automatizados para garantir seu funcionamento correto. Os testes podem ser executados com o comando:

```bash
npm test
```

Ou usando o script batch fornecido:

```bash
.\run-tests.bat
```

## Personalização

A interface de administração pode ser personalizada conforme necessário. As principais áreas de personalização são:

- **Tema**: cores e estilos podem ser ajustados no arquivo de tema
- **Permissões**: regras de acesso podem ser modificadas para permitir que outros usuários acessem a área administrativa
- **Relatórios**: novos tipos de relatórios podem ser adicionados conforme necessário

## Suporte

Para suporte ou dúvidas sobre a interface de administração, entre em contato com a equipe de desenvolvimento do NiverZap.

---

Desenvolvido com ❤️ pela equipe NiverZap
