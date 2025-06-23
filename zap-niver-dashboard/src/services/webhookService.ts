import { PaymentResponse } from './paymentService';
import { ZAPIService, ZAPIInstanceResponse } from './zapiService';

// Tipos para o serviço de webhook
export interface WebhookPayload {
  event: string;
  payment?: PaymentResponse;
  subscription?: any;
  customer?: any;
}

// Interface para armazenar temporariamente os dados do usuário
// Isso será substituído pelo seu banco de dados real no futuro
interface UserData {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'active' | 'inactive';
  paymentId?: string;
  subscriptionId?: string;
  zapiInstance?: {
    instanceId: string;
    token: string;
    qrcode?: string;
    status: 'DISCONNECTED' | 'CONNECTED' | 'PENDING';
  };
}

// Armazenamento temporário (será substituído pelo banco de dados)
const userStore: Record<string, UserData> = {};

// Serviço de webhook
export const WebhookService = {
  // Processar webhook do Asaas
  async processAsaasWebhook(payload: WebhookPayload): Promise<any> {
    try {
      console.log('Processando webhook do Asaas:', payload);

      // Verificar o tipo de evento
      switch (payload.event) {
        case 'PAYMENT_CONFIRMED':
        case 'PAYMENT_RECEIVED':
          return await this.handlePaymentConfirmed(payload);
        
        case 'PAYMENT_OVERDUE':
          return await this.handlePaymentOverdue(payload);
        
        case 'PAYMENT_REFUNDED':
        case 'PAYMENT_CANCELED':
          return await this.handlePaymentCanceled(payload);
        
        case 'SUBSCRIPTION_ACTIVATED':
          return await this.handleSubscriptionActivated(payload);
        
        case 'SUBSCRIPTION_CANCELED':
          return await this.handleSubscriptionCanceled(payload);
        
        default:
          console.log('Evento não tratado:', payload.event);
          return { status: 'ignored', message: 'Evento não tratado' };
      }
    } catch (error) {
      console.error('Erro ao processar webhook do Asaas:', error);
      throw error;
    }
  },

  // Tratar pagamento confirmado
  async handlePaymentConfirmed(payload: WebhookPayload): Promise<any> {
    if (!payload.payment || !payload.payment.clientId) {
      throw new Error('Dados de pagamento inválidos');
    }

    try {
      // Buscar usuário pelo ID do cliente
      // Em uma implementação real, você buscaria no banco de dados
      const userId = this.findUserByClientId(payload.payment.clientId);
      
      if (!userId) {
        console.error('Usuário não encontrado para o cliente:', payload.payment.clientId);
        return { status: 'error', message: 'Usuário não encontrado' };
      }

      // Criar instância na Z-API
      const instanceName = `DataZAP-${userId}`;
      const zapiInstance = await ZAPIService.createInstance(instanceName);

      // Atualizar dados do usuário
      userStore[userId] = {
        ...userStore[userId],
        status: 'active',
        paymentId: payload.payment.id,
        zapiInstance: {
          instanceId: zapiInstance.instanceId,
          token: zapiInstance.token,
          qrcode: zapiInstance.qrcode,
          status: 'PENDING'
        }
      };

      // Enviar e-mail com QR Code (simulado)
      console.log(`E-mail enviado para ${userStore[userId].email} com QR Code para conectar WhatsApp`);

      return {
        status: 'success',
        message: 'Pagamento confirmado e instância Z-API criada',
        userId,
        zapiInstance
      };
    } catch (error) {
      console.error('Erro ao processar pagamento confirmado:', error);
      throw error;
    }
  },

  // Tratar pagamento vencido
  async handlePaymentOverdue(payload: WebhookPayload): Promise<any> {
    if (!payload.payment || !payload.payment.clientId) {
      throw new Error('Dados de pagamento inválidos');
    }

    try {
      // Buscar usuário pelo ID do cliente
      const userId = this.findUserByClientId(payload.payment.clientId);
      
      if (!userId) {
        console.error('Usuário não encontrado para o cliente:', payload.payment.clientId);
        return { status: 'error', message: 'Usuário não encontrado' };
      }

      // Marcar usuário como inativo
      userStore[userId] = {
        ...userStore[userId],
        status: 'inactive'
      };

      // Enviar e-mail de notificação (simulado)
      console.log(`E-mail enviado para ${userStore[userId].email} sobre pagamento vencido`);

      return {
        status: 'success',
        message: 'Usuário marcado como inativo devido a pagamento vencido',
        userId
      };
    } catch (error) {
      console.error('Erro ao processar pagamento vencido:', error);
      throw error;
    }
  },

  // Tratar pagamento cancelado ou reembolsado
  async handlePaymentCanceled(payload: WebhookPayload): Promise<any> {
    if (!payload.payment || !payload.payment.clientId) {
      throw new Error('Dados de pagamento inválidos');
    }

    try {
      // Buscar usuário pelo ID do cliente
      const userId = this.findUserByClientId(payload.payment.clientId);
      
      if (!userId) {
        console.error('Usuário não encontrado para o cliente:', payload.payment.clientId);
        return { status: 'error', message: 'Usuário não encontrado' };
      }

      // Marcar usuário como inativo
      userStore[userId] = {
        ...userStore[userId],
        status: 'inactive'
      };

      // Desconectar instância Z-API se existir
      if (userStore[userId].zapiInstance) {
        const { instanceId, token } = userStore[userId].zapiInstance;
        await ZAPIService.disconnectInstance(instanceId, token);
      }

      return {
        status: 'success',
        message: 'Pagamento cancelado e instância Z-API desconectada',
        userId
      };
    } catch (error) {
      console.error('Erro ao processar pagamento cancelado:', error);
      throw error;
    }
  },

  // Tratar assinatura ativada
  async handleSubscriptionActivated(payload: WebhookPayload): Promise<any> {
    // Implementação similar ao pagamento confirmado
    return { status: 'success', message: 'Assinatura ativada' };
  },

  // Tratar assinatura cancelada
  async handleSubscriptionCanceled(payload: WebhookPayload): Promise<any> {
    // Implementação similar ao pagamento cancelado
    return { status: 'success', message: 'Assinatura cancelada' };
  },

  // Função auxiliar para encontrar usuário pelo ID do cliente
  // Em uma implementação real, isso seria uma consulta ao banco de dados
  findUserByClientId(clientId: string): string | null {
    for (const userId in userStore) {
      if (userStore[userId].id === clientId) {
        return userId;
      }
    }
    return null;
  },

  // Registrar um novo usuário (temporário até implementação do banco de dados)
  registerUser(userData: Omit<UserData, 'status' | 'zapiInstance'>): string {
    const userId = `user-${Date.now()}`;
    userStore[userId] = {
      ...userData,
      status: 'pending',
      zapiInstance: undefined
    };
    return userId;
  }
};

export default WebhookService;
