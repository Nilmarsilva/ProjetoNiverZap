const User = require('../models/userModel');
const stripeService = require('../services/stripeService');

/**
 * Controlador para gerenciamento de usuários
 */
const userController = {
  /**
   * Obter o perfil do usuário atual
   */
  getCurrentUserProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Não enviar a senha na resposta
      const { password, ...userProfile } = user;
      
      res.status(200).json(userProfile);
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
    }
  },
  
  /**
   * Atualizar o perfil do usuário
   */
  updateUserProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const profileData = req.body;
      
      // Remover campos que não devem ser atualizados pelo usuário
      const { id, created_at, is_active, role, stripe_customer_id, ...updatableData } = profileData;
      
      // Verificar se o perfil está completo
      const isComplete = userController.checkProfileComplete(updatableData);
      
      // Atualizar o perfil
      const updatedUser = await User.update(userId, {
        ...updatableData,
        is_profile_complete: isComplete
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Atualizar cliente no Stripe se existir
      if (updatedUser.stripe_customer_id) {
        try {
          await stripeService.updateCustomer(updatedUser.stripe_customer_id, {
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            complement: updatedUser.complement,
            zipcode: updatedUser.zipcode,
            city: updatedUser.city,
            state: updatedUser.state,
            document_type: updatedUser.document_type,
            document: updatedUser.document,
            externalReference: userId
          });
        } catch (stripeError) {
          console.error('Erro ao atualizar cliente no Stripe:', stripeError);
          // Não interromper o fluxo se houver erro no Stripe
        }
      }
      
      // Não enviar a senha na resposta
      const { password, ...updatedProfile } = updatedUser;
      
      res.status(200).json({
        message: 'Perfil atualizado com sucesso',
        user: updatedProfile
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil do usuário' });
    }
  },
  
  /**
   * Verificar se o perfil do usuário está completo
   */
  isProfileComplete: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      const isComplete = userController.checkProfileComplete(user);
      
      res.status(200).json({
        is_profile_complete: isComplete
      });
    } catch (error) {
      console.error('Erro ao verificar perfil do usuário:', error);
      res.status(500).json({ error: 'Erro ao verificar perfil do usuário' });
    }
  },
  
  /**
   * Função auxiliar para verificar se o perfil está completo
   */
  checkProfileComplete: (profile) => {
    // Verificar campos básicos obrigatórios para todos os usuários
    const basicFieldsComplete = !!(
      profile.name && 
      profile.email && 
      profile.phone && 
      profile.document && 
      profile.document_type && 
      profile.address &&
      profile.address_number &&
      profile.neighborhood &&
      profile.city && 
      profile.state && 
      profile.zipcode
    );
    
    // Se for pessoa jurídica (CNPJ), verificar campos adicionais
    if (profile.document_type === 'cnpj') {
      return basicFieldsComplete && !!profile.company_name;
    }
    
    return basicFieldsComplete;
  },
  
  /**
   * Criar cliente no Stripe
   */
  createStripeCustomer: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Buscar o usuário
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Verificar se o perfil está completo
      const isComplete = userController.checkProfileComplete(user);
      if (!isComplete) {
        return res.status(400).json({ 
          error: 'Perfil incompleto. Preencha todos os campos obrigatórios.' 
        });
      }
      
      // Verificar se já existe um cliente no Stripe
      if (user.stripe_customer_id) {
        return res.status(400).json({ 
          error: 'Cliente já cadastrado no Stripe' 
        });
      }
      
      // Criar cliente no Stripe
      const customerData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        complement: user.complement,
        zipcode: user.zipcode,
        city: user.city,
        state: user.state,
        document_type: user.document_type,
        document: user.document,
        externalReference: userId
      };
      
      const stripeCustomer = await stripeService.createCustomer(customerData);
      
      // Atualizar o usuário com o ID do cliente Stripe
      const updatedUser = await User.update(userId, {
        stripe_customer_id: stripeCustomer.id
      });
      
      res.status(200).json({
        message: 'Cliente criado com sucesso no Stripe',
        customer_id: stripeCustomer.id
      });
    } catch (error) {
      console.error('Erro ao criar cliente no Stripe:', error);
      res.status(500).json({ 
        error: 'Erro ao criar cliente no Stripe. Tente novamente.' 
      });
    }
  },
  
  /**
   * Verificar se o usuário é administrador
   */
  isAdmin: async (req, res) => {
    try {
      const userId = req.user.id;
      const isAdmin = await User.isAdmin(userId);
      
      res.status(200).json({
        is_admin: isAdmin
      });
    } catch (error) {
      console.error('Erro ao verificar se o usuário é administrador:', error);
      res.status(500).json({ error: 'Erro ao verificar permissões do usuário' });
    }
  },

  /**
   * Obter todos os usuários (apenas para administradores)
   */
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll();
      
      // Remover senhas da resposta
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  }
};

module.exports = userController;