const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Organization = require('../models/organizationModel');
const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

/**
 * Controlador para autenticação de usuários
 */
const authController = {
  /**
   * Registrar um novo usuário
   * Implementa integração com cache Redis para ambiente com load balancing
   */
  register: async (req, res) => {
    try {
      const { name, email, password, organization_id } = req.body;

      // Verificar se todos os campos necessários foram fornecidos
      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: 'Todos os campos são obrigatórios (nome, email, senha)' 
        });
      }

      // Verificar se o usuário já existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          error: 'Este email já está em uso' 
        });
      }

      // Criptografar a senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Criar o novo usuário
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        organization_id, // Adiciona a organização se fornecida
        role: 'user', // Papel padrão
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      // Se a organização foi fornecida, invalidar cache da organização
      if (organization_id && cacheService.isConnected()) {
        const orgCacheKey = `auth:org:${organization_id}`;
        await cacheService.delete(orgCacheKey);
        logger.debug(`Cache invalidado para organização ${organization_id} após registro de usuário`);
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: newUser.id, 
          email: newUser.email, 
          name: newUser.name,
          organization_id: newUser.organization_id,
          role: newUser.role
        },
        process.env.JWT_SECRET || 'niverzap_jwt_secret_key_2025',
        { expiresIn: '7d' }
      );

      // Retornar resposta sem a senha
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        message: 'Usuário registrado com sucesso',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      logger.error(`Erro ao registrar usuário: ${error.message}`);
      res.status(500).json({ 
        error: 'Erro ao registrar usuário. Tente novamente.' 
      });
    }
  },

  /**
   * Login de usuário
   * Implementa integração com cache Redis para ambiente com load balancing
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Verificar se email e senha foram fornecidos
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email e senha são obrigatórios' 
        });
      }

      // Buscar usuário pelo email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          error: 'Credenciais inválidas' 
        });
      }

      // Verificar se a senha está correta
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Credenciais inválidas' 
        });
      }

      // Verificar se o usuário está ativo
      if (!user.is_active) {
        return res.status(401).json({ 
          error: 'Conta desativada' 
        });
      }

      // Registrar último login
      await User.updateLastLogin(user.id);
      
      // Invalidar cache do usuário, já que dados foram alterados (last_login)
      if (cacheService.isConnected()) {
        const cacheKey = `auth:user:${user.id}`;
        await cacheService.delete(cacheKey);
        logger.debug(`Cache invalidado para usuário ${user.id} após login`);
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          name: user.name, 
          organization_id: user.organization_id,
          role: user.role
        }, 
        process.env.JWT_SECRET || 'niverzap_jwt_secret_key_2025', 
        { expiresIn: '7d' }
      );

      // Retornar resposta sem a senha
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        message: 'Login bem-sucedido',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      logger.error(`Erro ao fazer login: ${error.message}`);
      res.status(500).json({ 
        error: 'Erro ao processar login' 
      });
    }
  },

  /**
   * Verificar token JWT
   * Implementa cache com Redis para melhorar desempenho em ambiente com load balancing
   */
  verifyToken: async (req, res) => {
    try {
      // Obter token do corpo da requisição ou do cabeçalho de autorização
      const tokenFromBody = req.body.token;
      const tokenFromHeader = req.headers.authorization?.split(' ')[1];
      const token = tokenFromBody || tokenFromHeader;
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Token não fornecido',
          valid: false
        });
      }

      // Verificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'niverzap_jwt_secret_key_2025');
      const userId = decoded.id;
      
      // Chave de cache para o usuário autenticado
      const cacheKey = `auth:user:${userId}`;
      
      // Tentar obter do cache primeiro
      let user = null;
      let userFromCache = false;
      
      if (cacheService.isConnected()) {
        user = await cacheService.get(cacheKey);
        if (user) {
          userFromCache = true;
          logger.debug(`Cache hit para usuário ${userId}`);
        }
      }
      
      // Se não estiver no cache, buscar do banco de dados
      if (!user) {
        logger.debug(`Cache miss para usuário ${userId}, buscando do banco`);
        user = await User.findById(userId);
        
        // Armazenar no cache se encontrado (TTL de 5 minutos)
        if (user && cacheService.isConnected()) {
          await cacheService.set(cacheKey, user, 300); // 300 segundos = 5 minutos
        }
      }
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Usuário não encontrado',
          valid: false
        });
      }

      // Verificar se o usuário está ativo
      if (!user.is_active) {
        // Invalidar cache se o usuário estiver no cache mas inativo
        if (userFromCache && cacheService.isConnected()) {
          await cacheService.delete(cacheKey);
        }
        
        return res.status(401).json({ 
          error: 'Conta desativada',
          valid: false
        });
      }

      // Verificar se a organização do usuário está ativa (se não for admin)
      if (user.role !== 'admin' && user.organization_id) {
        // Chave de cache para a organização
        const orgCacheKey = `auth:org:${user.organization_id}`;
        
        // Tentar obter organização do cache
        let organization = null;
        if (cacheService.isConnected()) {
          organization = await cacheService.get(orgCacheKey);
        }
        
        // Se não estiver no cache, buscar do banco
        if (!organization) {
          organization = await Organization.findById(user.organization_id);
          
          // Armazenar no cache se encontrada (TTL de 10 minutos)
          if (organization && cacheService.isConnected()) {
            await cacheService.set(orgCacheKey, organization, 600); // 600 segundos = 10 minutos
          }
        }
        
        if (!organization || !organization.is_active) {
          // Invalidar caches se necessário
          if (cacheService.isConnected()) {
            if (organization) await cacheService.delete(orgCacheKey);
            await cacheService.delete(cacheKey);
          }
          
          return res.status(401).json({ 
            error: 'Organização desativada',
            valid: false
          });
        }
      }

      // Retornar resposta sem a senha
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({
        message: 'Token válido',
        valid: true,
        user: userWithoutPassword
      });
    } catch (error) {
      logger.error(`Erro ao verificar token: ${error.message}`);
      res.status(401).json({ 
        error: 'Token inválido ou expirado',
        valid: false
      });
    }
  },

  /**
   * Logout (com invalidação de cache para ambiente com load balancing)
   * Embora JWT seja stateless, podemos invalidar o cache do usuário no Redis
   */
  logout: async (req, res) => {
    try {
      // Obter ID do usuário do token JWT
      const tokenFromHeader = req.headers.authorization?.split(' ')[1];
      
      if (tokenFromHeader && cacheService.isConnected()) {
        try {
          // Decodificar o token sem verificar (apenas para obter o ID)
          const decoded = jwt.decode(tokenFromHeader);
          
          if (decoded && decoded.id) {
            // Invalidar cache do usuário
            const cacheKey = `auth:user:${decoded.id}`;
            await cacheService.delete(cacheKey);
            logger.debug(`Cache invalidado para usuário ${decoded.id} após logout`);
          }
        } catch (decodeError) {
          // Se não conseguir decodificar o token, apenas ignora
          logger.debug(`Não foi possível decodificar o token durante logout: ${decodeError.message}`);
        }
      }
      
      res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      logger.error(`Erro ao fazer logout: ${error.message}`);
      res.status(500).json({ error: 'Erro ao processar logout' });
    }
  }
};

module.exports = authController;