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

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor funcionando!' });
});

// Inicializar o serviço de cache Redis
cacheService.connect().catch(err => {
  logger.error(`Falha ao conectar ao Redis: ${err.message}`);
  logger.info('Aplicação continuará funcionando sem cache');
});

// Iniciar o servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;