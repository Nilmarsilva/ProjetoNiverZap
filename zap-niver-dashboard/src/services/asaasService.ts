import axios from 'axios';

// Tipos para integração com Asaas
export interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

export interface AsaasPlan {
  id?: string;
  name: string;
  description?: string;
  value: number;
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  chargeDay?: number;
  fine?: number;
  interest?: number;
  externalReference?: string;
}

export interface AsaasSubscription {
  id?: string;
  customer: string;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
  value: number;
  nextDueDate: string;
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  description: string;
  externalReference?: string;
  discount?: {
    value: number;
    dueDateLimitDays: number;
  };
  fine?: {
    value: number;
  };
  interest?: {
    value: number;
  };
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    addressComplement?: string;
    phone: string;
    mobilePhone?: string;
  };
}

export interface AsaasCheckoutResponse {
  url: string;
  invoiceUrl: string;
  id: string;
}

// Configuração da API do Asaas
const ASAAS_API_URL = import.meta.env.VITE_ASAAS_API_URL || 'https://sandbox.asaas.com';
const ASAAS_API_KEY = import.meta.env.VITE_ASAAS_API_KEY || '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmE3ODhiMTk2LWNhOTctNGZjNy04MTQ2LTU5ZjM0NmRmZjkzNTo6JGFhY2hfZmQyYjQyYzAtMGVlYS00NTk1LTgzYzQtZTc2MmE3Y2FlNjYy';

console.log('Configurando API do Asaas:', { 
  url: ASAAS_API_URL,
  // Não exibir a chave completa por segurança
  keyPreview: ASAAS_API_KEY ? `${ASAAS_API_KEY.substring(0, 10)}...` : 'Não definida'
});

const asaasApi = axios.create({
  baseURL: ASAAS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'access_token': ASAAS_API_KEY
  }
});

// Adicionar logs mais detalhados para debug
console.log('API Asaas configurada com URL:', ASAAS_API_URL);

// Interceptor para logar requisições e respostas (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  asaasApi.interceptors.request.use(request => {
    console.log('Requisição para Asaas:', { 
      url: request.url, 
      method: request.method, 
      data: request.data 
    });
    return request;
  });
  
  asaasApi.interceptors.response.use(
    response => {
      console.log('Resposta do Asaas:', { 
        status: response.status, 
        data: response.data 
      });
      return response;
    },
    error => {
      console.error('Erro na resposta do Asaas:', { 
        status: error.response?.status, 
        data: error.response?.data,
        message: error.message
      });
      return Promise.reject(error);
    }
  );
}

// Classe de serviço para integração com o Asaas
class AsaasServiceImpl {
  // Gerenciamento de clientes
  async createCustomer(customer: AsaasCustomer): Promise<AsaasCustomer> {
    try {
      const response = await asaasApi.post('/api/v3/customers', customer);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente no Asaas:', error);
      throw error;
    }
  }

  async findCustomerByEmail(email: string): Promise<AsaasCustomer | null> {
    try {
      const response = await asaasApi.get(`/api/v3/customers?email=${email}`);
      const customers = response.data.data;
      return customers.length > 0 ? customers[0] : null;
    } catch (error) {
      console.error('Erro ao buscar cliente por email no Asaas:', error);
      throw error;
    }
  }

  async updateCustomer(id: string, customer: Partial<AsaasCustomer>): Promise<AsaasCustomer> {
    try {
      const response = await asaasApi.post(`/api/v3/customers/${id}`, customer);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar cliente no Asaas:', error);
      throw error;
    }
  }

  // Gerenciamento de planos
  async createPlan(plan: AsaasPlan): Promise<AsaasPlan> {
    try {
      const response = await asaasApi.post('/api/v3/subscriptions/plans', plan);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar plano no Asaas:', error);
      throw error;
    }
  }

  async findPlanByExternalReference(externalReference: string): Promise<AsaasPlan | null> {
    try {
      // Busca todos os planos e filtra pelo externalReference
      const response = await asaasApi.get('/api/v3/subscriptions/plans');
      const plans = response.data.data;
      return plans.find((plan: AsaasPlan) => plan.externalReference === externalReference) || null;
    } catch (error) {
      console.error('Erro ao buscar plano por referência externa no Asaas:', error);
      throw error;
    }
  }

  async updatePlan(id: string, plan: Partial<AsaasPlan>): Promise<AsaasPlan> {
    try {
      const response = await asaasApi.post(`/api/v3/subscriptions/plans/${id}`, plan);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar plano no Asaas:', error);
      throw error;
    }
  }

  async deletePlan(id: string): Promise<void> {
    try {
      await asaasApi.delete(`/api/v3/subscriptions/plans/${id}`);
    } catch (error) {
      console.error('Erro ao excluir plano no Asaas:', error);
      throw error;
    }
  }

  // Sincronização de planos
  async syncPlan(localPlan: any): Promise<AsaasPlan> {
    try {
      // Converte o plano local para o formato do Asaas
      const asaasPlan: AsaasPlan = {
        name: localPlan.nome,
        description: `Plano ${localPlan.nome} - Limite de ${localPlan.limiteContatos} contatos e ${localPlan.limiteMensagens} mensagens`,
        value: localPlan.preco,
        cycle: localPlan.periodo === 'mensal' ? 'MONTHLY' : 'YEARLY',
        billingType: 'UNDEFINED', // Será definido no checkout
        externalReference: localPlan.id
      };

      // Verifica se o plano já existe no Asaas
      const existingPlan = await this.findPlanByExternalReference(localPlan.id);

      if (existingPlan) {
        // Atualiza o plano existente
        return await this.updatePlan(existingPlan.id!, asaasPlan);
      } else {
        // Cria um novo plano
        return await this.createPlan(asaasPlan);
      }
    } catch (error) {
      console.error('Erro ao sincronizar plano com Asaas:', error);
      throw error;
    }
  }

  // Gerenciamento de assinaturas
  async createSubscription(subscription: AsaasSubscription): Promise<any> {
    try {
      const response = await asaasApi.post('/subscriptions', subscription);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar assinatura no Asaas:', error);
      throw error;
    }
  }

  async cancelSubscription(id: string): Promise<any> {
    try {
      const response = await asaasApi.delete(`/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar assinatura no Asaas:', error);
      throw error;
    }
  }

  // Checkout hospedado
  async createCheckout(params: {
    customer: string;
    billingType?: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
    dueDate?: string;
    value: number;
    description: string;
    externalReference?: string;
    installmentCount?: number;
    installmentValue?: number;
    creditCardToken?: string;
    remoteIp?: string;
    callbackUrl?: string;
    returnUrl?: string;
  }): Promise<AsaasCheckoutResponse> {
    try {
      const response = await asaasApi.post('/api/v3/payments/checkout', params);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar checkout no Asaas:', error);
      throw error;
    }
  }

  // Checkout hospedado para assinatura
  async createSubscriptionCheckout(params: {
    customer: string;
    plan?: string;
    billingType?: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
    nextDueDate?: string;
    value: number;
    cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
    description: string;
    externalReference?: string;
    creditCardToken?: string;
    remoteIp?: string;
    callbackUrl?: string;
    returnUrl?: string;
    // Parâmetros adicionais conforme documentação do Asaas
    maxPayments?: number;
    discount?: {
      value: number;
      dueDateLimitDays: number;
    };
    interest?: {
      value: number;
    };
    fine?: {
      value: number;
    };
    split?: Array<{
      walletId: string;
      value?: number;
      percentualValue?: number;
    }>;
  }): Promise<AsaasCheckoutResponse> {
    console.log('Criando checkout de assinatura com os seguintes parâmetros:', JSON.stringify(params, null, 2));
    console.log('URL da API:', `${ASAAS_API_URL}/api/v3/subscriptions/checkout`);
    
    try {
      // Verificar se temos os parâmetros mínimos necessários
      if (!params.customer) {
        throw new Error('Parâmetro customer é obrigatório');
      }
      
      if (!params.value) {
        throw new Error('Parâmetro value é obrigatório');
      }
      
      if (!params.cycle) {
        throw new Error('Parâmetro cycle é obrigatório');
      }
      
      // Fazer a requisição para a API do Asaas
      console.log('Enviando requisição para criar checkout de assinatura...');
      const response = await asaasApi.post('/api/v3/subscriptions/checkout', params);
      
      console.log('Resposta da API do Asaas:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar checkout de assinatura no Asaas:', error);
      
      if (error.response) {
        // O servidor respondeu com um status de erro
        console.error('Detalhes do erro da API:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        // A requisição foi feita mas não recebemos resposta
        console.error('Sem resposta do servidor:', error.request);
      } else {
        // Algo aconteceu ao configurar a requisição
        console.error('Erro ao configurar a requisição:', error.message);
      }
      
      throw error;
    }
  }
  
  // Criar link de checkout para assinatura com informações pré-preenchidas
  async createSubscriptionCheckoutWithCustomerData(params: {
    name: string;
    email: string;
    phone: string;
    cpfCnpj: string;
    postalCode?: string;
    addressNumber?: string;
    value: number;
    cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
    description: string;
    externalReference?: string;
    billingType?: 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';
    nextDueDate?: string;
    callbackUrl?: string;
    returnUrl?: string;
  }): Promise<AsaasCheckoutResponse> {
    console.log('Criando checkout com dados do cliente:', params);
    
    // Para testes diretos com o Asaas, podemos usar a URL direta para a página de sucesso
    // Isso é útil para contornar problemas com a API
    if (import.meta.env.DEV && false) { // DESATIVADO - Use false para testar com a API real do Asaas
      console.log('Usando método alternativo para criar checkout (modo de desenvolvimento)');
      const checkoutId = Math.random().toString(36).substring(2, 10);
      
      // Redirecionar diretamente para a página de sucesso simulada
      return {
        url: `${window.location.origin}/checkout/success?simulado=true&id=${checkoutId}`,
        invoiceUrl: `${window.location.origin}/checkout/success?simulado=true&id=${checkoutId}`,
        id: `checkout_${checkoutId}`
      };
    }
    
    try {
      // Primeiro, verificar se o cliente já existe
      let customer;
      try {
        customer = await this.findCustomerByEmail(params.email);
        console.log('Cliente encontrado:', customer);
      } catch (error) {
        console.error('Erro ao buscar cliente por email:', error);
      }
      
      // Se o cliente não existir, criar um novo
      if (!customer) {
        console.log('Cliente não encontrado, criando novo cliente');
        try {
          customer = await this.createCustomer({
            name: params.name,
            email: params.email,
            phone: params.phone || '00000000000', // Valor padrão para testes
            cpfCnpj: params.cpfCnpj || '00000000000', // Valor padrão para testes
            postalCode: params.postalCode,
            addressNumber: params.addressNumber
          });
          console.log('Novo cliente criado:', customer);
        } catch (error) {
          console.error('Erro ao criar cliente:', error);
          throw new Error(`Erro ao criar cliente: ${error.message || 'Erro desconhecido'}`);
        }
      }
      
      if (!customer || !customer.id) {
        throw new Error('Cliente inválido ou sem ID');
      }
      
      // Criar checkout com o ID do cliente
      const checkoutParams = {
        customer: customer.id,
        billingType: params.billingType || 'UNDEFINED',
        value: params.value,
        cycle: params.cycle,
        description: params.description,
        externalReference: params.externalReference || this.generateExternalReference(),
        nextDueDate: params.nextDueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
        callbackUrl: params.callbackUrl,
        returnUrl: params.returnUrl
      };
      
      console.log('Enviando parâmetros para criar checkout:', JSON.stringify(checkoutParams, null, 2));
      
      const checkoutResponse = await this.createSubscriptionCheckout(checkoutParams);
      console.log('Resposta do checkout:', checkoutResponse);
      return checkoutResponse;
    } catch (error) {
      console.error('Erro ao criar checkout com dados do cliente:', error);
      // Não usar fallback para poder ver o erro real
      throw error;
    }
  }

  // Utilitários
  generateExternalReference(): string {
    return `datazap_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

export const AsaasService = new AsaasServiceImpl();
export default AsaasService;
