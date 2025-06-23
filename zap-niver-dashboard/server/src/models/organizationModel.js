/**
 * Modelo para a entidade Organization
 */
const db = require('../database/connection');

class Organization {
  /**
   * Cria uma nova organização
   * @param {Object} organizationData - Dados da organização
   * @returns {Promise<Object>} - Organização criada
   */
  static async create(organizationData) {
    const [organization] = await db('organizations')
      .insert(organizationData)
      .returning('*');
    
    return organization;
  }

  /**
   * Busca uma organização pelo ID
   * @param {string} id - ID da organização
   * @returns {Promise<Object|null>} - Organização encontrada ou null
   */
  static async findById(id) {
    return await db('organizations')
      .where({ id })
      .first();
  }

  /**
   * Busca uma organização pelo email
   * @param {string} email - Email da organização
   * @returns {Promise<Object|null>} - Organização encontrada ou null
   */
  static async findByEmail(email) {
    return await db('organizations')
      .where({ email })
      .first();
  }

  /**
   * Atualiza uma organização
   * @param {string} id - ID da organização
   * @param {Object} updateData - Dados para atualização
   * @returns {Promise<Object>} - Organização atualizada
   */
  static async update(id, updateData) {
    // Adiciona o timestamp de atualização
    const dataToUpdate = {
      ...updateData,
      updated_at: db.fn.now()
    };

    const [updated] = await db('organizations')
      .where({ id })
      .update(dataToUpdate)
      .returning('*');
    
    return updated;
  }

  /**
   * Lista todas as organizações
   * @param {Object} filters - Filtros opcionais
   * @returns {Promise<Array>} - Lista de organizações
   */
  static async findAll(filters = {}) {
    const query = db('organizations');
    
    // Aplica filtros se fornecidos
    if (filters.status) {
      query.where('status', filters.status);
    }
    
    // Ordenação padrão
    query.orderBy('created_at', 'desc');
    
    return await query;
  }

  /**
   * Remove uma organização (soft delete)
   * @param {string} id - ID da organização
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  static async delete(id) {
    // Implementa soft delete alterando o status
    const [updated] = await db('organizations')
      .where({ id })
      .update({
        status: 'inactive',
        updated_at: db.fn.now()
      })
      .returning('*');
    
    return !!updated;
  }

  /**
   * Busca organizações por plano
   * @param {string} planId - ID do plano
   * @returns {Promise<Array>} - Lista de organizações
   */
  static async findByPlan(planId) {
    return await db('organizations')
      .where({ plan_id: planId })
      .orderBy('created_at', 'desc');
  }
}

module.exports = Organization;
