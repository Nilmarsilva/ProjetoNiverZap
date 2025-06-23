const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas as rotas abaixo requerem autenticação
router.use(authMiddleware.authenticateToken);

// Obter perfil do usuário atual
router.get('/profile', userController.getCurrentUserProfile);

// Atualizar perfil do usuário
router.put('/profile', userController.updateUserProfile);

// Criar cliente no Asaas
router.post('/create-asaas-customer', userController.createAsaasCustomer);

// Verificar se o perfil está completo
router.get('/profile-complete', userController.isProfileComplete);

// Rotas para administradores
router.get('/all', authMiddleware.isAdmin, userController.getAllUsers);

module.exports = router;