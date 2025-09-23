# Sistema de Login e Recuperação de Senha

## Alterações Implementadas

### 1. Página de Login
- Consolidação com `AuthPage.tsx` para manter consistência visual
- Remoção de credenciais hardcoded e lógica de autenticação simulada
- Padronização das credenciais de teste: `admin@niverzap.com / Admin@123`
- Implementação de diálogo de recuperação de senha
- Melhoria na validação de campos com feedback visual e mensagens de erro
- Interface mais amigável com feedback durante carregamento (spinner)

### 2. Sistema Completo de Recuperação de Senha
- Criação de serviço de email (`emailService.ts`) no frontend
- Implementação da página de redefinição de senha (`ResetPasswordPage.tsx`)
- Adição da rota de redefinição de senha no `App.tsx`

### 3. Backend para Recuperação de Senha
- Criação do serviço de email (`email_service.py`)
- Implementação dos endpoints de recuperação de senha (`auth_recovery.py`)
- Criação do modelo para tokens de recuperação (`password_recovery.py`)
- Atualização das rotas da API para incluir os novos endpoints
- Criação do script SQL para adicionar a tabela de recuperação de senha

### 4. Configurações de Email
- Configuração do serviço SMTP da Hostinger:
  - Servidor: smtp.hostinger.com
  - Porta: 465 (SSL)
  - Email remetente: senhas@authbrasil.com.br
- Atualização do arquivo `.env.example` com as configurações de email
- Atualização do arquivo `config.py` para incluir as configurações de email

## Configuração do Sistema de Recuperação de Senha

### 1. Configuração do Banco de Dados

Execute o script SQL para criar a tabela de recuperação de senha:

```bash
psql -U seu_usuario -d seu_banco -f scripts/add_password_recovery_table.sql
```

Ou execute o conteúdo do arquivo `scripts/add_password_recovery_table.sql` no seu cliente SQL.

### 2. Configuração do Arquivo .env

Adicione as seguintes variáveis ao seu arquivo `.env`:

```
# Configurações de email
EMAIL_SMTP_SERVER=smtp.hostinger.com
EMAIL_SMTP_PORT=465
EMAIL_SENDER=senhas@authbrasil.com.br
EMAIL_PASSWORD=sua_senha_aqui
EMAIL_USE_SSL=True

# URL do frontend para links de recuperação de senha
FRONTEND_URL=http://localhost:3000
```

### 3. Fluxo de Recuperação de Senha

1. **Solicitação de recuperação:**
   - Usuário clica em "Esqueceu a senha?" na tela de login
   - Insere seu email e solicita a recuperação
   - Backend verifica se o email existe e envia um link de recuperação

2. **Email de recuperação:**
   - Contém um link com token único válido por 24 horas
   - Formato: `http://localhost:3000/reset-password/{token}`

3. **Redefinição de senha:**
   - Usuário acessa o link e é direcionado para a página de redefinição
   - Backend valida o token
   - Usuário define nova senha
   - Backend atualiza a senha e invalida o token

## Segurança

- Tokens únicos gerados com UUID v4
- Expiração de token após 24 horas
- Validação de segurança da senha (mínimo 6 caracteres)
- Comunicação segura via HTTPS/SSL
- Mensagens genéricas para não revelar existência de contas

## Próximos Passos

1. Implementar validações mais rigorosas de senha (letras, números, caracteres especiais)
2. Adicionar autenticação de dois fatores
3. Implementar limite de tentativas de recuperação por email
4. Adicionar notificações de segurança para alterações de senha
