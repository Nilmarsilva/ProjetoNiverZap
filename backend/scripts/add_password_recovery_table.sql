-- Script para adicionar a tabela de recuperação de senha
-- Execute este script no banco de dados para criar a tabela necessária para o sistema de recuperação de senha

-- Tabela para recuperação de senha
CREATE TABLE IF NOT EXISTS password_recoveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_password_recoveries_token ON password_recoveries(token);
CREATE INDEX IF NOT EXISTS idx_password_recoveries_user_id ON password_recoveries(user_id);

-- Adicionar permissões para a tabela
ALTER TABLE password_recoveries ENABLE ROW LEVEL SECURITY;

-- Política para permitir que apenas administradores possam ver todos os registros
CREATE POLICY admin_all_access ON password_recoveries
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid() AND users.is_admin = true
        )
    );

-- Política para permitir que usuários vejam apenas seus próprios registros
CREATE POLICY user_own_access ON password_recoveries
    TO authenticated
    USING (user_id = auth.uid());

-- Política para permitir que o serviço possa criar registros
CREATE POLICY service_insert ON password_recoveries
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Política para permitir que o serviço possa atualizar registros
CREATE POLICY service_update ON password_recoveries
    FOR UPDATE
    TO service_role
    USING (true);

-- Política para permitir que o serviço possa excluir registros
CREATE POLICY service_delete ON password_recoveries
    FOR DELETE
    TO service_role
    USING (true);

-- Comentários para documentação
COMMENT ON TABLE password_recoveries IS 'Tabela para armazenar tokens de recuperação de senha';
COMMENT ON COLUMN password_recoveries.id IS 'Identificador único do registro';
COMMENT ON COLUMN password_recoveries.user_id IS 'ID do usuário que solicitou a recuperação de senha';
COMMENT ON COLUMN password_recoveries.token IS 'Token único para recuperação de senha';
COMMENT ON COLUMN password_recoveries.expires_at IS 'Data e hora de expiração do token';
COMMENT ON COLUMN password_recoveries.created_at IS 'Data e hora de criação do registro';
