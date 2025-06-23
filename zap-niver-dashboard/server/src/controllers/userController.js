const User = require('../models/userModel');
const asaasService = require('../services/asaasService');

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
      const { id, created_at, is_active, role, ...updatableData } = profileData;
      
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
   * Criar cliente no Asaas
   */
  createAsaasCustomer: async (req, res) => {
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
      
      // Verificar se já existe um cliente no Asaas
      if (user.asaas_customer_id) {
        return res.status(400).json({ 
          error: 'Cliente já cadastrado no Asaas' 
        });
      }
      
      // Criar cliente no Asaas
      const customerData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        mobilePhone: user.mobile_phone,
        cpfCnpj: user.document,
        postalCode: user.zipcode,
        address: user.address,
        addressNumber: user.address_number,
        complement: user.complement,
        province: user.neighborhood,
        externalReference: userId,
        notificationDisabled: false
      };
      
      // Se for pessoa jurídica, adicionar campos específicos
      if (user.document_type === 'cnpj') {
        customerData.company = user.company_name;
      }
      
      const asaasCustomer = await asaasService.createCustomer(customerData);
      
      // Atualizar o usuário com o ID do cliente Asaas
      const updatedUser = await User.update(userId, {
        asaas_customer_id: asaasCustomer.id
      });
      
      res.status(200).json({
        message: 'Cliente criado com sucesso no Asaas',
        customer_id: asaasCustomer.id
      });
    } catch (error) {
      console.error('Erro ao criar cliente no Asaas:', error);
      res.status(500).json({ 
        error: 'Erro ao criar cliente no Asaas. Tente novamente.' 
      });
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