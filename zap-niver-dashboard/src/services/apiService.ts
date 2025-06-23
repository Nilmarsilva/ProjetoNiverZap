import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../stores/authStore';

// Obter a URL da API do ambiente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Classe para gerenciar as requisições para a API
 */
class ApiService {
  private api: AxiosInstance;
  
  constructor() {
    // Criar instância do axios com configurações base
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Interceptor para adicionar o token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Interceptor para tratar erros de resposta
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Tratar erros de autenticação (401)
        if (error.response && error.response.status === 401) {
          // Se não for uma rota de autenticação, fazer logout
          if (!error.config.url.includes('/auth/')) {
            useAuthStore.getState().logout();
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Fazer uma requisição GET
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config);
  }
  
  /**
   * Fazer uma requisição POST
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config);
  }
  
  /**
   * Fazer uma requisição PUT
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config);
  }
  
  /**
   * Fazer uma requisição PATCH
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config);
  }
  
  /**
   * Fazer uma requisição DELETE
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config);
  }
  
  /**
   * Serviços de autenticação
   */
  auth = {
    /**
     * Registrar um novo usuário
     */
    register: async (userData: any) => {
      return this.post('/auth/register', userData);
    },
    
    /**
     * Fazer login
     */
    login: async (credentials: { email: string; password: string }) => {
      return this.post('/auth/login', credentials);
    },
    
    /**
     * Verificar token
     */
    verifyToken: async (token: string) => {
      return this.post('/auth/verify-token', { token });
    },
    
    /**
     * Solicitar redefinição de senha
     */
    requestPasswordReset: async (email: string) => {
      return this.post('/auth/request-password-reset', { email });
    },
    
    /**
     * Redefinir senha
     */
    resetPassword: async (token: string, newPassword: string) => {
      return this.post('/auth/reset-password', { token, newPassword });
    }
  };
  
  /**
   * Serviços de usuário
   */
  user = {
    /**
     * Obter perfil do usuário atual
     */
    getProfile: async () => {
      return this.get('/users/profile');
    },
    
    /**
     * Atualizar perfil do usuário
     */
    updateProfile: async (profileData: any) => {
      return this.put('/users/profile', profileData);
    },
    
    /**
     * Verificar se o perfil está completo
     */
    isProfileComplete: async () => {
      return this.get('/users/profile/complete');
    },
    
    /**
     * Criar cliente no Asaas
     */
    createAsaasCustomer: async () => {
      return this.post('/users/asaas-customer');
    }
  };
}

// Exportar uma instância única do serviço
const apiService = new ApiService();
export default apiService;