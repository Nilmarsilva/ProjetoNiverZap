import axios from 'axios';

// Tipos para o serviço Z-API
export interface ZAPIInstance {
  instanceId: string;
  token: string;
  qrcode?: string;
  status: 'DISCONNECTED' | 'CONNECTED' | 'PENDING';
  phone?: string;
  name?: string;
  createdAt: string;
}

export interface ZAPIInstanceResponse {
  instanceId: string;
  token: string;
  qrcode?: string;
}

export interface ZAPIInstanceStatus {
  connected: boolean;
  phone?: string;
  name?: string;
}

// Configuração da API da Z-API
// No Vite, as variáveis de ambiente são acessadas através de import.meta.env
// e o prefixo é VITE_ em vez de REACT_APP_
const ZAPI_API_URL = import.meta.env.VITE_ZAPI_API_URL || 'https://api.z-api.io/instances';
const ZAPI_API_KEY = import.meta.env.VITE_ZAPI_API_KEY || '';
const ZAPI_API_EMAIL = import.meta.env.VITE_ZAPI_API_EMAIL || '';

const zapiApi = axios.create({
  baseURL: ZAPI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Client-Token': ZAPI_API_KEY,
    'Client-Email': ZAPI_API_EMAIL
  }
});

// Serviço Z-API
export const ZAPIService = {
  // Criar uma nova instância
  async createInstance(name: string): Promise<ZAPIInstanceResponse> {
    try {
      const response = await zapiApi.post('/create-instance', { name });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar instância na Z-API:', error);
      throw error;
    }
  },

  // Obter o QR Code para conectar o WhatsApp
  async getQRCode(instanceId: string, token: string): Promise<string> {
    try {
      const response = await axios.get(`${ZAPI_API_URL}/${instanceId}/token/${token}/qr-code`);
      return response.data.value;
    } catch (error) {
      console.error('Erro ao obter QR Code da Z-API:', error);
      throw error;
    }
  },

  // Verificar status da instância
  async getInstanceStatus(instanceId: string, token: string): Promise<ZAPIInstanceStatus> {
    try {
      const response = await axios.get(`${ZAPI_API_URL}/${instanceId}/token/${token}/status`);
      return {
        connected: response.data.connected,
        phone: response.data.phone,
        name: response.data.name
      };
    } catch (error) {
      console.error('Erro ao verificar status da instância na Z-API:', error);
      throw error;
    }
  },

  // Enviar mensagem de texto
  async sendTextMessage(instanceId: string, token: string, phone: string, message: string): Promise<any> {
    try {
      const response = await axios.post(
        `${ZAPI_API_URL}/${instanceId}/token/${token}/send-text`,
        {
          phone,
          message
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem pela Z-API:', error);
      throw error;
    }
  },

  // Desconectar instância
  async disconnectInstance(instanceId: string, token: string): Promise<any> {
    try {
      const response = await axios.post(
        `${ZAPI_API_URL}/${instanceId}/token/${token}/disconnect`
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao desconectar instância na Z-API:', error);
      throw error;
    }
  }
};

export default ZAPIService;
