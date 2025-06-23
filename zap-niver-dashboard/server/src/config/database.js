/**
 * Configuração de conexão com o banco de dados PostgreSQL
 */
const { Pool } = require('pg');

// Configurações do banco de dados a partir das variáveis de ambiente
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'niverzap',
  // Número máximo de clientes no pool
  max: 20,
  // Tempo em milissegundos que um cliente pode ficar ocioso antes de ser desconectado
  idleTimeoutMillis: 30000,
  // Tempo em milissegundos para tentar conectar ao banco de dados antes de desistir
  connectionTimeoutMillis: 2000,
};

// Criar pool de conexões
const pool = new Pool(dbConfig);

// Testar a conexão com o banco de dados
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
    client.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados PostgreSQL:', error.message);
    // Em ambiente de desenvolvimento, podemos continuar sem o banco
    if (process.env.NODE_ENV === 'development') {
      console.warn('Continuando em modo de desenvolvimento sem banco de dados...');
      return false;
    }
    // Em produção, encerramos a aplicação se não conseguir conectar ao banco
    if (process.env.NODE_ENV === 'production') {
      console.error('Falha crítica: Não foi possível conectar ao banco de dados em produção.');
      process.exit(1);
    }
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};