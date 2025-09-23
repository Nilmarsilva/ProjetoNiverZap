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
