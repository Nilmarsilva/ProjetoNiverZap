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

// Inicializar o app Express
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
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

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;