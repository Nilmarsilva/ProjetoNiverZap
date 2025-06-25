/**
 * Controlador para gerenciamento de contatos
 * Implementa cache com Redis para melhorar desempenho em ambiente com load balancing
 */
const Customer = require('../models/customerModel');
const { v4: uuidv4 } = require('uuid');
const cacheService = require('../services/cacheService');
const logger = require('../utils/logger');

const contactController = {
  /**
   * Obter todos os contatos do usuário atual
   * Implementa cache com Redis para melhorar desempenho em ambiente com load balancing
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
      
      // Criar chave de cache baseada nos parâmetros da consulta
      const cacheKey = `contacts:org:${organizationId}:page:${options.page}:limit:${options.limit}:search:${options.search}:order:${options.orderBy}-${options.orderDirection}`;
      
      let result = null;
      let fromCache = false;
      
      // Tentar obter do cache primeiro se não houver busca
      // Não usamos cache quando há termo de busca para garantir resultados atualizados
      if (cacheService.isConnected() && !options.search) {
        result = await cacheService.get(cacheKey);
        if (result) {
          fromCache = true;
          logger.debug(`Cache hit para contatos da organização ${organizationId}, página ${options.page}`);
        }
      }
      
      // Se não estiver no cache ou houver busca, buscar do banco de dados
      if (!result) {
        logger.debug(`Cache miss para contatos da organização ${organizationId}, buscando do banco`);
        result = await Customer.findByOrganization(organizationId, options);
        
        // Armazenar no cache se não houver busca (TTL de 2 minutos)
        if (result && cacheService.isConnected() && !options.search) {
          await cacheService.set(cacheKey, result, 120); // 120 segundos = 2 minutos
        }
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error(`Erro ao buscar contatos: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar contatos' });
    }
  },
  
  /**
   * Contar o total de contatos do usuário
   * Implementa cache com Redis para melhorar desempenho em ambiente com load balancing
   */
  countUserContacts: async (req, res) => {
    try {
      const organizationId = req.user.organization_id;
      
      // Criar chave de cache
      const cacheKey = `contacts:count:org:${organizationId}`;
      
      let count = null;
      
      // Tentar obter do cache primeiro
      if (cacheService.isConnected()) {
        const cachedResult = await cacheService.get(cacheKey);
        if (cachedResult !== null) {
          logger.debug(`Cache hit para contagem de contatos da organização ${organizationId}`);
          return res.status(200).json({ count: cachedResult });
        }
      }
      
      // Se não estiver no cache, buscar do banco de dados
      logger.debug(`Cache miss para contagem de contatos da organização ${organizationId}`);
      const result = await Customer.findByOrganization(organizationId, { limit: 1 });
      count = result.pagination.total;
      
      // Armazenar no cache (TTL de 5 minutos)
      if (cacheService.isConnected()) {
        await cacheService.set(cacheKey, count, 300); // 300 segundos = 5 minutos
      }
      
      res.status(200).json({ count });
    } catch (error) {
      logger.error(`Erro ao contar contatos: ${error.message}`);
      res.status(500).json({ error: 'Erro ao contar contatos' });
    }
  },
  
  /**
   * Buscar aniversariantes do dia
   * Implementa cache com Redis para melhorar desempenho em ambiente com load balancing
   */
  getTodayBirthdays: async (req, res) => {
    try {
      const organizationId = req.user.organization_id;
      
      // Criar chave de cache baseada na data atual (para expirar à meia-noite)
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const cacheKey = `birthdays:today:org:${organizationId}:date:${today}`;
      
      let birthdays = null;
      
      // Tentar obter do cache primeiro
      if (cacheService.isConnected()) {
        birthdays = await cacheService.get(cacheKey);
        if (birthdays) {
          logger.debug(`Cache hit para aniversariantes do dia da organização ${organizationId}`);
          return res.status(200).json({ birthdays });
        }
      }
      
      // Se não estiver no cache, buscar do banco de dados
      logger.debug(`Cache miss para aniversariantes do dia da organização ${organizationId}`);
      birthdays = await Customer.findBirthdays(organizationId, { today: true });
      
      // Calcular segundos até meia-noite para TTL do cache
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const secondsUntilMidnight = Math.floor((endOfDay - now) / 1000);
      
      // Armazenar no cache (expira à meia-noite)
      if (cacheService.isConnected()) {
        await cacheService.set(cacheKey, birthdays, secondsUntilMidnight);
      }
      
      res.status(200).json({ birthdays });
    } catch (error) {
      logger.error(`Erro ao buscar aniversariantes do dia: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar aniversariantes do dia' });
    }
  },
  
  /**
   * Buscar próximos aniversariantes
   * Implementa cache com Redis para melhorar desempenho em ambiente com load balancing
   */
  getUpcomingBirthdays: async (req, res) => {
    try {
      const organizationId = req.user.organization_id;
      const days = parseInt(req.query.days) || 30;
      
      // Criar chave de cache baseada na data atual e número de dias
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const cacheKey = `birthdays:upcoming:org:${organizationId}:days:${days}:date:${today}`;
      
      let birthdays = null;
      
      // Tentar obter do cache primeiro
      if (cacheService.isConnected()) {
        birthdays = await cacheService.get(cacheKey);
        if (birthdays) {
          logger.debug(`Cache hit para próximos aniversariantes (${days} dias) da organização ${organizationId}`);
          return res.status(200).json({ birthdays });
        }
      }
      
      // Se não estiver no cache, buscar do banco de dados
      logger.debug(`Cache miss para próximos aniversariantes (${days} dias) da organização ${organizationId}`);
      birthdays = await Customer.findBirthdays(organizationId, { days });
      
      // Calcular segundos até meia-noite para TTL do cache
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const secondsUntilMidnight = Math.floor((endOfDay - now) / 1000);
      
      // Armazenar no cache (expira à meia-noite)
      if (cacheService.isConnected()) {
        await cacheService.set(cacheKey, birthdays, secondsUntilMidnight);
      }
      
      res.status(200).json({ birthdays });
    } catch (error) {
      logger.error(`Erro ao buscar próximos aniversariantes: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar próximos aniversariantes' });
    }
  },
  
  /**
   * Buscar um contato pelo ID
   * Implementa cache com Redis para melhorar desempenho em ambiente com load balancing
   */
  getContactById: async (req, res) => {
    try {
      const { id } = req.params;
      const organizationId = req.user.organization_id;
      
      // Criar chave de cache para o contato
      const cacheKey = `contact:${id}`;
      
      let contact = null;
      
      // Tentar obter do cache primeiro
      if (cacheService.isConnected()) {
        contact = await cacheService.get(cacheKey);
        if (contact) {
          // Verificar se o contato pertence à organização do usuário (mesmo vindo do cache)
          if (contact.organization_id !== organizationId) {
            return res.status(404).json({ error: 'Contato não encontrado' });
          }
          logger.debug(`Cache hit para contato ${id}`);
          return res.status(200).json({ contact });
        }
      }
      
      // Se não estiver no cache, buscar do banco de dados
      logger.debug(`Cache miss para contato ${id}, buscando do banco`);
      contact = await Customer.findById(id);
      
      // Verificar se o contato existe e pertence à organização do usuário
      if (!contact || contact.organization_id !== organizationId) {
        return res.status(404).json({ error: 'Contato não encontrado' });
      }
      
      // Armazenar no cache (TTL de 10 minutos)
      if (cacheService.isConnected()) {
        await cacheService.set(cacheKey, contact, 600); // 600 segundos = 10 minutos
      }
      
      res.status(200).json({ contact });
    } catch (error) {
      logger.error(`Erro ao buscar contato: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar contato' });
    }
  },
  
  /**
   * Criar um novo contato
   * Implementa invalidação de cache para ambiente com load balancing
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
      
      // Invalidar caches relacionados a contatos da organização
      if (cacheService.isConnected()) {
        // Invalidar cache de contagem de contatos
        const countCacheKey = `contacts:count:org:${organizationId}`;
        await cacheService.delete(countCacheKey);
        
        // Invalidar caches de aniversariantes se o contato tiver data de nascimento
        if (birth_date) {
          const today = new Date().toISOString().split('T')[0];
          const todayCacheKey = `birthdays:today:org:${organizationId}:date:${today}`;
          await cacheService.delete(todayCacheKey);
          
          // Invalidar caches de próximos aniversariantes (para vários períodos comuns)
          const periods = [7, 15, 30, 60, 90];
          for (const days of periods) {
            const upcomingCacheKey = `birthdays:upcoming:org:${organizationId}:days:${days}:date:${today}`;
            await cacheService.delete(upcomingCacheKey);
          }
        }
        
        logger.debug(`Caches de contatos invalidados após criação de contato para organização ${organizationId}`);
      }
      
      res.status(201).json({ 
        message: 'Contato criado com sucesso',
        contact: newContact
      });
    } catch (error) {
      logger.error(`Erro ao criar contato: ${error.message}`);
      res.status(500).json({ error: 'Erro ao criar contato' });
    }
  },
  
  /**
   * Atualizar um contato existente
   * Implementa invalidação de cache para ambiente com load balancing
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
      
      // Verificar se a data de nascimento foi alterada para invalidar caches de aniversariantes
      const birthDateChanged = birth_date !== contact.birth_date;
      
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
      
      // Invalidar caches relacionados ao contato
      if (cacheService.isConnected()) {
        // Invalidar cache do contato específico
        const contactCacheKey = `contact:${id}`;
        await cacheService.delete(contactCacheKey);
        
        // Se a data de nascimento foi alterada, invalidar caches de aniversariantes
        if (birthDateChanged) {
          const today = new Date().toISOString().split('T')[0];
          const todayCacheKey = `birthdays:today:org:${organizationId}:date:${today}`;
          await cacheService.delete(todayCacheKey);
          
          // Invalidar caches de próximos aniversariantes (para vários períodos comuns)
          const periods = [7, 15, 30, 60, 90];
          for (const days of periods) {
            const upcomingCacheKey = `birthdays:upcoming:org:${organizationId}:days:${days}:date:${today}`;
            await cacheService.delete(upcomingCacheKey);
          }
        }
        
        logger.debug(`Cache invalidado para contato ${id} após atualização`);
      }
      
      res.status(200).json({ 
        message: 'Contato atualizado com sucesso',
        contact: updatedContact
      });
    } catch (error) {
      logger.error(`Erro ao atualizar contato: ${error.message}`);
      res.status(500).json({ error: 'Erro ao atualizar contato' });
    }
  },
  
  /**
   * Excluir um contato
   * Implementa invalidação de cache para ambiente com load balancing
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
      
      // Verificar se o contato tem data de nascimento para invalidar caches de aniversariantes
      const hasBirthDate = !!contact.birth_date;
      
      // Excluir o contato (soft delete)
      await Customer.delete(id);
      
      // Invalidar caches relacionados ao contato
      if (cacheService.isConnected()) {
        // Invalidar cache do contato específico
        const contactCacheKey = `contact:${id}`;
        await cacheService.delete(contactCacheKey);
        
        // Invalidar cache de contagem de contatos
        const countCacheKey = `contacts:count:org:${organizationId}`;
        await cacheService.delete(countCacheKey);
        
        // Se o contato tem data de nascimento, invalidar caches de aniversariantes
        if (hasBirthDate) {
          const today = new Date().toISOString().split('T')[0];
          const todayCacheKey = `birthdays:today:org:${organizationId}:date:${today}`;
          await cacheService.delete(todayCacheKey);
          
          // Invalidar caches de próximos aniversariantes (para vários períodos comuns)
          const periods = [7, 15, 30, 60, 90];
          for (const days of periods) {
            const upcomingCacheKey = `birthdays:upcoming:org:${organizationId}:days:${days}:date:${today}`;
            await cacheService.delete(upcomingCacheKey);
          }
        }
        
        logger.debug(`Cache invalidado para contato ${id} após exclusão`);
      }
      
      res.status(200).json({ 
        message: 'Contato excluído com sucesso'
      });
    } catch (error) {
      logger.error(`Erro ao excluir contato: ${error.message}`);
      res.status(500).json({ error: 'Erro ao excluir contato' });
    }
  }
};

module.exports = contactController;