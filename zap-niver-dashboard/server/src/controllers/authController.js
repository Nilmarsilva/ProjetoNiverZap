const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Organization = require('../models/organizationModel');

/**
 * Controlador para autenticação de usuários
 */
const authController = {
  /**
   * Registrar um novo usuário
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
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ 
        error: 'Erro ao registrar usuário. Tente novamente.' 
      });
    }
  },

  /**
   * Login de usuário
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

      // Buscar o usuário pelo email
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
          error: 'Conta desativada. Entre em contato com o suporte.' 
        });
      }

      // Registrar o último login
      await User.updateLastLogin(user.id);

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
        message: 'Login realizado com sucesso',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ 
        error: 'Erro ao fazer login. Tente novamente.' 
      });
    }
  },

  /**
   * Verificar token JWT
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
      
      // Buscar o usuário pelo ID com informações da organização
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'Usuário não encontrado',
          valid: false
        });
      }

      // Verificar se o usuário está ativo
      if (!user.is_active) {
        return res.status(401).json({ 
          error: 'Conta desativada',
          valid: false
        });
      }

      // Verificar se a organização do usuário está ativa (se não for admin)
      if (user.role !== 'admin' && user.organization_id) {
        const organization = await Organization.findById(user.organization_id);
        if (!organization || !organization.is_active) {
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
      console.error('Erro ao verificar token:', error);
      res.status(401).json({ 
        error: 'Token inválido ou expirado',
        valid: false
      });
    }
  },

  /**
   * Logout (apenas para registro, já que JWT é stateless)
   */
  logout: async (req, res) => {
    // JWT é stateless, então o logout é feito no cliente removendo o token
    res.status(200).json({ 
      message: 'Logout realizado com sucesso' 
    });
  }
};

module.exports = authController;