const express = require('express');
const app = express();
const PORT = 5001;

// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor de teste funcionando!' });
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de teste rodando na porta ${PORT}`);
});
