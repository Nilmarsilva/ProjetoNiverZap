const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Middleware para autenticação e autorização
 */
const authMiddleware = {
  /**
   * Middleware para verificar se o usuário está autenticado
   */
  authenticateToken: async (req, res, next) => {
    try {
      // Obter o token do cabeçalho Authorization
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
      
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      
      // Verificar o token
      jwt.verify(token, process.env.JWT_SECRET || 'niverzap_jwt_secret_key_2025', async (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: 'Token inválido ou expirado' });
        }
        
        // Buscar o usuário no banco de dados
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        if (!user.is_active) {
          return res.status(401).json({ error: 'Conta desativada' });
        }
        
        // Adicionar o usuário decodificado à requisição
        req.user = decoded;
        next();
      });
    } catch (error) {
      console.error('Erro no middleware de autenticação:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },
  
  /**
   * Middleware para verificar se o usuário é administrador
   */
  isAdmin: async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      // Buscar o usuário no banco de dados
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Verificar se o usuário é administrador
      if (user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Acesso negado. Permissão de administrador necessária.' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Erro no middleware de autorização:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = authMiddleware;