/**
 * Controlador para gerenciamento de contatos
 */
const Customer = require('../models/customerModel');
const { v4: uuidv4 } = require('uuid');

const contactController = {
  /**
   * Obter todos os contatos do usuário atual
   */
  getUserContacts: async (req, res) => {
    try {
      const organizationId = req.user.organization_id;
      
      // Buscar contatos da organização com paginação
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        search: req.query.search || '',
        orderBy: req.query.orderBy || 'name',
        orderDirection: req.query.orderDirection || 'asc'
      };
      
      const result = await Customer.findByOrganization(organizationId, options);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      res.status(500).json({ error: 'Erro ao buscar contatos' });
    }
  },
  
  /**
   * Contar o total de contatos do usuário
   */
  countUserContacts: async (req, res) => {
    try {
      const organizationId = req.user.organization_id;
      
      // Contar contatos da organização
      const result = await Customer.findByOrganization(organizationId, { limit: 1 });
      
      res.status(200).json({ count: result.pagination.total });
    } catch (error) {
      console.error('Erro ao contar contatos:', error);
      res.status(500).json({ error: 'Erro ao contar contatos' });
    }
  },
  
  /**
   * Buscar aniversariantes do dia
   */
  getTodayBirthdays: async (req, res) => {
    try {
      const organizationId = req.user.organization_id;
      
      // Buscar aniversariantes do dia
      const birthdays = await Customer.findBirthdays(organizationId, { today: true });
      
      res.status(200).json({ birthdays });
    } catch (error) {
      console.error('Erro ao buscar aniversariantes do dia:', error);
      res.status(500).json({ error: 'Erro ao buscar aniversariantes do dia' });
    }
  },
  
  /**
   * Buscar próximos aniversariantes
   */
  getUpcomingBirthdays: async (req, res) => {
    try {
      const organizationId = req.user.organization_id;
      const days = parseInt(req.query.days) || 30;
      
      // Buscar próximos aniversariantes
      const birthdays = await Customer.findBirthdays(organizationId, { days });
      
      res.status(200).json({ birthdays });
    } catch (error) {
      console.error('Erro ao buscar próximos aniversariantes:', error);
      res.status(500).json({ error: 'Erro ao buscar próximos aniversariantes' });
    }
  },
  
  /**
   * Buscar um contato pelo ID
   */
  getContactById: async (req, res) => {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization_id;
      
      // Buscar o contato
      const contact = await Customer.findById(id);
      
      // Verificar se o contato existe e pertence à organização do usuário
      if (!contact || contact.organization_id !== organizationId) {
        return res.status(404).json({ error: 'Contato não encontrado' });
      }
      
      res.status(200).json({ contact });
    } catch (error) {
      console.error('Erro ao buscar contato:', error);
      res.status(500).json({ error: 'Erro ao buscar contato' });
    }
  },
  
  /**
   * Criar um novo contato
   */
  createContact: async (req, res) => {
    try {
      const { name, email, phone, birth_date, tags, custom_fields } = req.body;
      const organizationId = req.user.organization_id;
      
      // Validar campos obrigatórios
      if (!name || !phone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
      }
      
      // Verificar se já existe um contato com o mesmo telefone
      const existingContact = await Customer.findByPhone(organizationId, phone);
      if (existingContact) {
        return res.status(400).json({ error: 'Já existe um contato com este telefone' });
      }
      
      // Criar o novo contato
      const newContact = await Customer.create({
        id: uuidv4(),
        organization_id: organizationId,
        name,
        email,
        phone,
        birth_date,
        tags: tags || [],
        custom_fields: custom_fields || {},
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });
      
      res.status(201).json({ 
        message: 'Contato criado com sucesso',
        contact: newContact
      });
    } catch (error) {
      console.error('Erro ao criar contato:', error);
      res.status(500).json({ error: 'Erro ao criar contato' });
    }
  },
  
  /**
   * Atualizar um contato existente
   */
  updateContact: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, birth_date, tags, custom_fields } = req.body;
      const organizationId = req.user.organization_id;
      
      // Buscar o contato
      const contact = await Customer.findById(id);
      
      // Verificar se o contato existe e pertence à organização do usuário
      if (!contact || contact.organization_id !== organizationId) {
        return res.status(404).json({ error: 'Contato não encontrado' });
      }
      
      // Validar campos obrigatórios
      if (!name || !phone) {
        return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
      }
      
      // Verificar se já existe outro contato com o mesmo telefone
      if (phone !== contact.phone) {
        const existingContact = await Customer.findByPhone(organizationId, phone);
        if (existingContact && existingContact.id !== id) {
          return res.status(400).json({ error: 'Já existe um contato com este telefone' });
        }
      }
      
      // Atualizar o contato
      const updatedContact = await Customer.update(id, {
        name,
        email,
        phone,
        birth_date,
        tags: tags || contact.tags,
        custom_fields: custom_fields || contact.custom_fields,
        updated_at: new Date()
      });
      
      res.status(200).json({ 
        message: 'Contato atualizado com sucesso',
        contact: updatedContact
      });
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      res.status(500).json({ error: 'Erro ao atualizar contato' });
    }
  },
  
  /**
   * Excluir um contato
   */
  deleteContact: async (req, res) => {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization_id;
      
      // Buscar o contato
      const contact = await Customer.findById(id);
      
      // Verificar se o contato existe e pertence à organização do usuário
      if (!contact || contact.organization_id !== organizationId) {
        return res.status(404).json({ error: 'Contato não encontrado' });
      }
      
      // Excluir o contato (soft delete)
      await Customer.delete(id);
      
      res.status(200).json({ 
        message: 'Contato excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir contato:', error);
      res.status(500).json({ error: 'Erro ao excluir contato' });
    }
  }
};

module.exports = contactController;