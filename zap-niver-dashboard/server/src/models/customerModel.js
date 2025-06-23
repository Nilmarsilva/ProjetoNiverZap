/**
 * Modelo para a entidade Customer (contatos)
 */
const db = require('../database/connection');

class Customer {
  /**
   * Cria um novo contato
   * @param {Object} customerData - Dados do contato
   * @returns {Promise<Object>} - Contato criado
   */
  static async create(customerData) {
    const [customer] = await db('customers')
      .insert(customerData)
      .returning('*');
    
    return customer;
  }

  /**
   * Busca um contato pelo ID
   * @param {string} id - ID do contato
   * @returns {Promise<Object|null>} - Contato encontrado ou null
   */
  static async findById(id) {
    return await db('customers')
      .where({ id })
      .first();
  }

  /**
   * Atualiza um contato
   * @param {string} id - ID do contato
   * @param {Object} updateData - Dados para atualização
   * @returns {Promise<Object>} - Contato atualizado
   */
  static async update(id, updateData) {
    // Adiciona o timestamp de atualização
    const dataToUpdate = {
      ...updateData,
      updated_at: db.fn.now()
    };

    const [updated] = await db('customers')
      .where({ id })
      .update(dataToUpdate)
      .returning('*');
    
    return updated;
  }

  /**
   * Lista todos os contatos de uma organização
   * @param {string} organizationId - ID da organização
   * @param {Object} options - Opções de filtro e paginação
   * @returns {Promise<Array>} - Lista de contatos
   */
  static async findByOrganization(organizationId, options = {}) {
    const query = db('customers')
      .where({ organization_id: organizationId });
    
    // Aplica filtros se fornecidos
    if (options.search) {
      query.where(function() {
        this.where('name', 'ilike', `%${options.search}%`)
            .orWhere('phone', 'ilike', `%${options.search}%`)
            .orWhere('email', 'ilike', `%${options.search}%`);
      });
    }
    
    if (options.status) {
      query.where('status', options.status);
    }
    
    // Paginação
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;
    
    // Contagem total para paginação
    const countQuery = db('customers')
      .where({ organization_id: organizationId })
      .count('id as total')
      .first();
    
    // Ordenação
    const orderBy = options.orderBy || 'name';
    const orderDirection = options.orderDirection || 'asc';
    query.orderBy(orderBy, orderDirection);
    
    // Executa a consulta com paginação
    query.limit(limit).offset(offset);
    
    // Executa ambas as consultas
    const [customers, countResult] = await Promise.all([
      query,
      countQuery
    ]);
    
    return {
      data: customers,
      pagination: {
        total: parseInt(countResult.total),
        page,
        limit,
        pages: Math.ceil(parseInt(countResult.total) / limit)
      }
    };
  }

  /**
   * Busca aniversariantes do dia ou próximos
   * @param {string} organizationId - ID da organização
   * @param {Object} options - Opções de filtro
   * @returns {Promise<Array>} - Lista de aniversariantes
   */
  static async findBirthdays(organizationId, options = {}) {
    // Obtém a data atual
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // Janeiro é 0
    const currentDay = today.getDate();
    
    // Constrói a consulta base
    const query = db('customers')
      .where({ organization_id: organizationId, status: 'active' })
      .whereNotNull('birth_date');
    
    if (options.today) {
      // Somente aniversariantes de hoje
      query.whereRaw('EXTRACT(MONTH FROM birth_date) = ? AND EXTRACT(DAY FROM birth_date) = ?', 
        [currentMonth, currentDay]);
    } else if (options.days) {
      // Aniversariantes dos próximos X dias
      const days = parseInt(options.days) || 7;
      
      // Essa consulta é mais complexa pois precisa lidar com a virada do ano
      query.whereRaw(`
        (
          (EXTRACT(MONTH FROM birth_date) = ? AND EXTRACT(DAY FROM birth_date) >= ?)
          OR
          (
            EXTRACT(MONTH FROM birth_date) > ? 
            AND 
            (
              EXTRACT(MONTH FROM birth_date) < ? 
              OR 
              (EXTRACT(MONTH FROM birth_date) = ? AND EXTRACT(DAY FROM birth_date) <= ?)
            )
          )
        )
      `, [
        currentMonth, currentDay,
        currentMonth,
        (currentMonth + 1) % 12,
        (currentMonth + 1) % 12, ((currentDay + days) % 30) || 30
      ]);
    }
    
    // Ordenação: primeiro por mês, depois por dia
    query.orderByRaw('EXTRACT(MONTH FROM birth_date), EXTRACT(DAY FROM birth_date)');
    
    return await query;
  }

  /**
   * Remove um contato (soft delete)
   * @param {string} id - ID do contato
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  static async delete(id) {
    // Implementa soft delete alterando o status
    const [updated] = await db('customers')
      .where({ id })
      .update({
        status: 'inactive',
        updated_at: db.fn.now()
      })
      .returning('*');
    
    return !!updated;
  }

  /**
   * Busca contatos por telefone
   * @param {string} organizationId - ID da organização
   * @param {string} phone - Número de telefone
   * @returns {Promise<Object|null>} - Contato encontrado ou null
   */
  static async findByPhone(organizationId, phone) {
    return await db('customers')
      .where({ 
        organization_id: organizationId,
        phone
      })
      .first();
  }
}

module.exports = Customer;
