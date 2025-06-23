// Removida a dependência do Supabase
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
}

// Chave para armazenar os perfis no localStorage
const USER_PROFILES_KEY = 'niverzap-user-profiles';

// Função auxiliar para obter todos os perfis do localStorage
const getAllProfilesFromStorage = (): Record<string, UserProfile> => {
  const profilesJson = localStorage.getItem(USER_PROFILES_KEY);
  return profilesJson ? JSON.parse(profilesJson) : {};
};

// Função auxiliar para salvar todos os perfis no localStorage
const saveProfilesToStorage = (profiles: Record<string, UserProfile>) => {
  localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
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
 * Serviço para gerenciar usuários (usando localStorage temporariamente)
 */
export const userService = {
  /**
   * Busca o perfil do usuário atual
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = useAuthStore.getState().user;
    
    if (!user) return null;
    
    return this.getUserProfileById(user.id);
  },

  /**
   * Busca o perfil de um usuário pelo ID
   */
  async getUserProfileById(userId: string): Promise<UserProfile | null> {
    try {
      const profiles = getAllProfilesFromStorage();
      const profile = profiles[userId];
      
      // Se o perfil não existir, criar um perfil básico
      if (!profile) {
        const user = useAuthStore.getState().user;
        if (user && user.id === userId) {
          const newProfile: UserProfile = {
            id: userId,
            name: user.name || '',
            email: user.email || '',
            phone: '',
            is_active: true,
            created_at: new Date().toISOString(),
            is_profile_complete: false
          };
          
          // Salvar o novo perfil
          profiles[userId] = newProfile;
          saveProfilesToStorage(profiles);
          
          return newProfile;
        }
        return null;
      }
      
      // Verificar se o perfil está completo
      profile.is_profile_complete = isProfileComplete(profile);
      
      return profile;
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
      const profiles = getAllProfilesFromStorage();
      return Object.values(profiles).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  },

  /**
   * Atualiza o perfil do usuário
   */
  async updateUserProfile(userId: string, profile: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<UserProfile> {
    try {
      const profiles = getAllProfilesFromStorage();
      const currentProfile = profiles[userId] || {
        id: userId,
        name: '',
        email: '',
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      // Atualizar o perfil
      const updatedProfile = {
        ...currentProfile,
        ...profile
      };
      
      // Verificar se o perfil está completo
      updatedProfile.is_profile_complete = isProfileComplete(updatedProfile);
      
      // Salvar o perfil atualizado
      profiles[userId] = updatedProfile;
      saveProfilesToStorage(profiles);
      
      return updatedProfile;
    } catch (error) {
      console.error(`Erro ao atualizar perfil do usuário ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Atualiza o plano do usuário
   */
  async updateUserPlan(userId: string, planId: string): Promise<UserProfile> {
    return this.updateUserProfile(userId, { plan_id: planId });
  },
  
  /**
   * Verifica se o perfil do usuário está completo
   */
  async isProfileComplete(userId: string): Promise<boolean> {
    const profile = await this.getUserProfileById(userId);
    return profile ? !!profile.is_profile_complete : false;
  },

  /**
   * Verifica se o usuário atual é administrador
   */
  async isCurrentUserAdmin(): Promise<boolean> {
    const user = useAuthStore.getState().user;
    
    if (!user) return false;
    
    // Verificar se o e-mail é do administrador
    // A propriedade role pode não existir em todos os usuários, então verificamos apenas o e-mail
    return user.email === 'admin@datazap.com';
  }
}
