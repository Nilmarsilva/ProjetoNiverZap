/**
 * Modelo para usuários usando PostgreSQL
 */
const db = require('../database/connection');

class User {
  /**
   * Criar um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} - Usuário criado
   */
  static async create(userData) {
    const [user] = await db('users')
      .insert(userData)
      .returning('*');
    
    return user;
  }
  
  /**
   * Buscar um usuário pelo ID
   * @param {string} id - ID do usuário
   * @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  static async findById(id) {
    return await db('users')
      .where({ id })
      .first();
  }
  
  /**
   * Buscar um usuário pelo email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  static async findByEmail(email) {
    return await db('users')
      .where({ email })
      .first();
  }
  
  /**
   * Atualizar um usuário
   * @param {string} id - ID do usuário
   * @param {Object} userData - Dados para atualização
   * @returns {Promise<Object|null>} - Usuário atualizado ou null
   */
  static async update(id, userData) {
    // Adiciona o timestamp de atualização
    const dataToUpdate = {
      ...userData,
      updated_at: db.fn.now()
    };

    const [updated] = await db('users')
      .where({ id })
      .update(dataToUpdate)
      .returning('*');
    
    return updated || null;
  }
  
  /**
   * Buscar todos os usuários
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} - Lista de usuários
   */
  static async findAll(filters = {}) {
    const query = db('users');
    
    // Aplica filtros se fornecidos
    if (filters.organization_id) {
      query.where('organization_id', filters.organization_id);
    }
    
    if (filters.role) {
      query.where('role', filters.role);
    }
    
    if (filters.is_active !== undefined) {
      query.where('is_active', filters.is_active);
    }
    
    // Ordenação padrão
    query.orderBy('created_at', 'desc');
    
    return await query;
  }
  
  /**
   * Verificar se um usuário é administrador
   * @param {string} id - ID do usuário
   * @returns {Promise<boolean>} - true se for admin, false caso contrário
   */
  static async isAdmin(id) {
    const user = await this.findById(id);
    return user ? user.role === 'admin' : false;
  }
  
  /**
   * Buscar usuários por organização
   * @param {string} organizationId - ID da organização
   * @returns {Promise<Array>} - Lista de usuários
   */
  static async findByOrganization(organizationId) {
    return await db('users')
      .where({ organization_id: organizationId })
      .orderBy('created_at', 'desc');
  }
  
  /**
   * Desativar um usuário
   * @param {string} id - ID do usuário
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  static async deactivate(id) {
    const [updated] = await db('users')
      .where({ id })
      .update({
        is_active: false,
        updated_at: db.fn.now()
      })
      .returning('*');
    
    return !!updated;
  }
  
  /**
   * Registrar último login do usuário
   * @param {string} id - ID do usuário
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  static async updateLastLogin(id) {
    const [updated] = await db('users')
      .where({ id })
      .update({
        last_login: db.fn.now()
      })
      .returning('*');
    
    return !!updated;
  }
}

module.exports = User;
