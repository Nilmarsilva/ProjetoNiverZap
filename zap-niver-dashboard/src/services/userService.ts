import { useAuthStore } from '@/stores/authStore'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  mobile_phone?: string
  document_type?: 'cpf' | 'cnpj'
  document?: string
  birth_date?: string
  address?: string
  address_number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipcode?: string
  company_name?: string
  trading_name?: string
  profile_image?: string
  is_active: boolean
  created_at: string
  is_profile_complete?: boolean
  plan_id?: string
  stripe_customer_id?: string
}

// URL base para as requisições à API
const API_BASE_URL = '/api';

// Função auxiliar para obter o token de autenticação
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Função auxiliar para fazer requisições autenticadas à API
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Usuário não autenticado');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

// Função para verificar se o perfil está completo
const isProfileComplete = (profile: UserProfile): boolean => {
  // Verificar campos básicos obrigatórios para todos os usuários
  const basicFieldsComplete = !!(  
    profile.name && 
    profile.email && 
    profile.phone && 
    profile.document && 
    profile.document_type && 
    profile.address &&
    profile.address_number &&
    profile.neighborhood &&
    profile.city && 
    profile.state && 
    profile.zipcode
  );
  
  // Se for pessoa jurídica (CNPJ), verificar campos adicionais
  if (profile.document_type === 'cnpj') {
    return basicFieldsComplete && !!profile.company_name;
  }
  
  return basicFieldsComplete;
};

/**
 * Serviço para gerenciar usuários (usando API)
 */
export const userService = {
  /**
   * Busca o perfil do usuário atual
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await fetchWithAuth('/users/profile');
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return null;
    }
  },

  /**
   * Busca o perfil de um usuário pelo ID
   * Nota: Esta função agora é apenas para administradores
   */
  async getUserProfileById(userId: string): Promise<UserProfile | null> {
    try {
      // Verificar se é administrador antes de permitir buscar perfil de outro usuário
      if (!(await this.isCurrentUserAdmin())) {
        throw new Error('Acesso negado: apenas administradores podem buscar perfis de outros usuários');
      }
      
      const data = await fetchWithAuth(`/users/${userId}`);
      return data;
    } catch (error) {
      console.error(`Erro ao buscar perfil do usuário ${userId}:`, error);
      return null;
    }
  },

  /**
   * Busca todos os usuários (apenas para administradores)
   */
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const data = await fetchWithAuth('/users/all');
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  /**
   * Atualiza o perfil do usuário
   */
  async updateUserProfile(profile: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<UserProfile> {
    try {
      const data = await fetchWithAuth('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      
      return data.user;
    } catch (error) {
      console.error('Erro ao atualizar perfil do usuário:', error);
      throw error;
    }
  },

  /**
   * Atualiza o plano do usuário
   */
  async updateUserPlan(planId: string): Promise<UserProfile> {
    try {
      const data = await fetchWithAuth('/users/plan', {
        method: 'PUT',
        body: JSON.stringify({ plan_id: planId })
      });
      
      return data.user;
    } catch (error) {
      console.error('Erro ao atualizar plano do usuário:', error);
      throw error;
    }
  },
  
  /**
   * Verifica se o perfil do usuário está completo
   */
  async isProfileComplete(): Promise<boolean> {
    try {
      const data = await fetchWithAuth('/users/profile-complete');
      return data.is_complete;
    } catch (error) {
      console.error('Erro ao verificar perfil do usuário:', error);
      return false;
    }
  },

  /**
   * Cria um cliente no Stripe
   */
  async createStripeCustomer(): Promise<string> {
    try {
      const data = await fetchWithAuth('/users/create-stripe-customer', {
        method: 'POST'
      });
      
      return data.customer_id;
    } catch (error) {
      console.error('Erro ao criar cliente no Stripe:', error);
      throw error;
    }
  },

  /**
   * Verifica se o usuário atual é administrador
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    const user = useAuthStore.getState().user;
    
    if (!user) return false;
    
    try {
      // Verificar no backend se o usuário é administrador
      const data = await fetchWithAuth('/users/is-admin');
      return data.is_admin;
    } catch (error) {
      // Fallback para verificação local
      return user.email === 'admin@datazap.com';
    }
  }
}
