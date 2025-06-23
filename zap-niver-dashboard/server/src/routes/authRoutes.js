const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// Rota para registro de usuário
router.post('/register', authController.register);

// Rota para login
router.post('/login', authController.login);

// Rota para verificar token/sessão
router.post('/verify-token', authController.verifyToken);

// Rota para logout
router.post('/logout', authController.logout);

// Rota para criar um usuário de teste (apenas para desenvolvimento)
router.get('/create-test-user', async (req, res) => {
  try {
    // Verificar se o usuário já existe
    const existingUser = await User.findByEmail('teste@niverzap.com');
    
    if (existingUser) {
      return res.status(200).json({
        message: 'Usuário de teste já existe',
        credentials: {
          email: 'teste@niverzap.com',
          password: 'teste123'
        }
      });
    }
    
    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('teste123', salt);
    
    // Criar o usuário de teste
    const testUser = await User.create({
      name: 'Usuário de Teste',
      email: 'teste@niverzap.com',
      password: hashedPassword,
      is_active: true,
      role: 'user',
      created_at: new Date().toISOString()
    });
    
    // Remover a senha da resposta
    const { password, ...userWithoutPassword } = testUser;
    
    res.status(201).json({
      message: 'Usuário de teste criado com sucesso',
      user: userWithoutPassword,
      credentials: {
        email: 'teste@niverzap.com',
        password: 'teste123'
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
    res.status(500).json({ error: 'Erro ao criar usuário de teste' });
  }
});

module.exports = router;