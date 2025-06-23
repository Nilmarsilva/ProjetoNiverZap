const axios = require('axios');

/**
 * Serviço para integração com a API do Asaas
 */
const asaasService = {
  /**
   * Criar um cliente no Asaas
   * @param {Object} customerData - Dados do cliente
   * @returns {Promise<Object>} - Cliente criado no Asaas
   */
  createCustomer: async (customerData) => {
    try {
      const response = await axios.post(
        `${process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'}/customers`,
        customerData,
        {
          headers: {
            'access_token': process.env.ASAAS_API_KEY || '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNTc1MDI6OiRhYWNoXzUzZjI4NTU0LWVjNDktNGZmZC05YzU5LTU1NmNmZGNmMTllZA==',
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro na API do Asaas:', error.response?.data || error.message);
      throw new Error(`Erro ao criar cliente no Asaas: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  },
  
  /**
   * Criar uma cobrança no Asaas
   * @param {Object} paymentData - Dados da cobrança
   * @returns {Promise<Object>} - Cobrança criada no Asaas
   */
  createPayment: async (paymentData) => {
    try {
      const response = await axios.post(
        `${process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'}/payments`,
        paymentData,
        {
          headers: {
            'access_token': process.env.ASAAS_API_KEY || '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNTc1MDI6OiRhYWNoXzUzZjI4NTU0LWVjNDktNGZmZC05YzU5LTU1NmNmZGNmMTllZA==',
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro na API do Asaas:', error.response?.data || error.message);
      throw new Error(`Erro ao criar cobrança no Asaas: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  },
  
  /**
   * Criar uma assinatura no Asaas
   * @param {Object} subscriptionData - Dados da assinatura
   * @returns {Promise<Object>} - Assinatura criada no Asaas
   */
  createSubscription: async (subscriptionData) => {
    try {
      const response = await axios.post(
        `${process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'}/subscriptions`,
        subscriptionData,
        {
          headers: {
            'access_token': process.env.ASAAS_API_KEY || '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNTc1MDI6OiRhYWNoXzUzZjI4NTU0LWVjNDktNGZmZC05YzU5LTU1NmNmZGNmMTllZA==',
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro na API do Asaas:', error.response?.data || error.message);
      throw new Error(`Erro ao criar assinatura no Asaas: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  },
  
  /**
   * Obter informações de um cliente no Asaas
   * @param {string} customerId - ID do cliente no Asaas
   * @returns {Promise<Object>} - Dados do cliente
   */
  getCustomer: async (customerId) => {
    try {
      const response = await axios.get(
        `${process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'}/customers/${customerId}`,
        {
          headers: {
            'access_token': process.env.ASAAS_API_KEY || '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNTc1MDI6OiRhYWNoXzUzZjI4NTU0LWVjNDktNGZmZC05YzU5LTU1NmNmZGNmMTllZA=='
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro na API do Asaas:', error.response?.data || error.message);
      throw new Error(`Erro ao buscar cliente no Asaas: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  },
  
  /**
   * Obter informações de uma cobrança no Asaas
   * @param {string} paymentId - ID da cobrança no Asaas
   * @returns {Promise<Object>} - Dados da cobrança
   */
  getPayment: async (paymentId) => {
    try {
      const response = await axios.get(
        `${process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'}/payments/${paymentId}`,
        {
          headers: {
            'access_token': process.env.ASAAS_API_KEY || '$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNTc1MDI6OiRhYWNoXzUzZjI4NTU0LWVjNDktNGZmZC05YzU5LTU1NmNmZGNmMTllZA=='
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro na API do Asaas:', error.response?.data || error.message);
      throw new Error(`Erro ao buscar cobrança no Asaas: ${error.response?.data?.errors?.[0]?.description || error.message}`);
    }
  }
};

module.exports = asaasService;