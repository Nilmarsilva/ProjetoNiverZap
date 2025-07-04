const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Importar middlewares
const realIpMiddleware = require('./middleware/realIp');

// Importar serviços
const cacheService = require('./services/cacheService');
const logger = require('./utils/logger');

// Inicializar o app Express
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(realIpMiddleware); // Captura o IP real do cliente antes de qualquer outro middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/payments', paymentRoutes);

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor funcionando!' });
});

// Inicializar o serviço de cache Redis
cacheService.connect().catch(err => {
  logger.error(`Falha ao conectar ao Redis: ${err.message}`);
  logger.info('Aplicação continuará funcionando sem cache');
});

// Adicionar logs para diagnóstico
console.log('Iniciando o servidor na porta ' + PORT);
console.log('Variáveis de ambiente:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('REDIS_ENABLED:', process.env.REDIS_ENABLED);
console.log('REDIS_HOST:', process.env.REDIS_HOST);

// Iniciar o servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
  console.log(`Servidor rodando na porta ${PORT} e escutando em todas as interfaces (0.0.0.0)`);
});

// Adicionar handler para erros
server.on('error', (err) => {
  logger.error(`Erro ao iniciar o servidor: ${err.message}`);
  console.error('Erro ao iniciar o servidor:', err);
});

module.exports = app;