import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Tipos para o serviço de pagamento
export interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
}

export interface PaymentRequest {
  customer: string | Customer;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  value: number;
  dueDate: string;
  description: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
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
}

export interface Subscription {
  id?: string;
  customer: string | Customer;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  value: number;
  nextDueDate: string;
  cycle: 'MONTHLY' | 'YEARLY';
  description: string;
  externalReference?: string;
  planId?: string;
}

export interface PaymentResponse {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'OVERDUE' | 'REFUNDED' | 'CANCELED';
  value: number;
  netValue: number;
  billingType: string;
  dueDate: string;
  invoiceUrl: string;
  clientId: string;
  description: string;
  // Campos opcionais para diferentes métodos de pagamento
  bankSlipUrl?: string;
  pixQrCodeUrl?: string;
  pixKey?: string;
  pixCopiaECola?: string;
}

export interface SubscriptionResponse {
  id: string;
  status: 'ACTIVE' | 'INACTIVE';
  value: number;
  nextDueDate: string;
  cycle: string;
  description: string;
  invoiceUrl: string;
  clientId: string;
}

// Configuração da API do Asaas
// No Vite, as variáveis de ambiente são acessadas através de import.meta.env
// e o prefixo é VITE_ em vez de REACT_APP_
const ASAAS_API_URL = import.meta.env.VITE_ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = import.meta.env.VITE_ASAAS_API_KEY || '68caed78-85c0-4790-b087-ec38b2d24b15';

const asaasApi = axios.create({
  baseURL: ASAAS_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'access_token': ASAAS_API_KEY
  }
});

// Serviço de pagamento
export const PaymentService = {
  // Criar um cliente no Asaas
  async createCustomer(customer: Customer): Promise<Customer> {
    try {
      const response = await asaasApi.post('/customers', customer);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente no Asaas:', error);
      throw error;
    }
  },

  // Buscar um cliente pelo e-mail
  async findCustomerByEmail(email: string): Promise<Customer | null> {
    try {
      const response = await asaasApi.get(`/customers?email=${email}`);
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0];
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar cliente no Asaas:', error);
      throw error;
    }
  },

  // Criar um pagamento único
  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await asaasApi.post('/payments', paymentRequest);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pagamento no Asaas:', error);
      throw error;
    }
  },

  // Criar uma assinatura
  async createSubscription(subscription: Subscription): Promise<SubscriptionResponse> {
    try {
      const response = await asaasApi.post('/subscriptions', subscription);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar assinatura no Asaas:', error);
      throw error;
    }
  },

  // Cancelar uma assinatura
  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const response = await asaasApi.delete(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao cancelar assinatura no Asaas:', error);
      throw error;
    }
  },

  // Verificar status de um pagamento
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await asaasApi.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao verificar status do pagamento no Asaas:', error);
      throw error;
    }
  },

  // Gerar um ID de referência externa
  generateExternalReference(): string {
    return `datazap-${uuidv4()}`;
  }
};

export default PaymentService;
