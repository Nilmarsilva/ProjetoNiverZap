import apiService from '@/services/apiService';
import { useAuthStore } from '@/stores/authStore';

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  const authStorage = localStorage.getItem('niverzap-auth-storage');
  if (authStorage) {
    try {
      const authData = JSON.parse(authStorage);
      return authData.state?.isAuthenticated || false;
    } catch (e) {
      return false;
    }
  }
  return false;
};

/**
 * Verifica se o usuário é administrador
 */
export const isAdmin = (): boolean => {
  const user = useAuthStore.getState().user;
  return user?.is_admin === true;
};

/**
 * Cliente API para substituir o Supabase
 * Fornece métodos para interagir com a API
 */
export const apiClient = {
  auth: {
    getUser: async () => {
      try {
        const response = await apiService.get('/auth/me');
        return { data: { user: response.data }, error: null };
      } catch (error) {
        return { data: { user: null }, error };
      }
    },
    signOut: async () => {
      try {
        await apiService.post('/auth/logout');
        return { error: null };
      } catch (error) {
        return { error };
      }
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simulação do evento de mudança de estado de autenticação
      return { data: { subscription: { unsubscribe: () => {} } }, error: null };
    },
    signInWithPassword: async (credentials: { email: string, password: string }) => {
      try {
        const response = await apiService.post('/auth/login', credentials);
        return { data: { user: response.data.user, session: { access_token: response.data.token } }, error: null };
      } catch (error) {
        return { data: { user: null, session: null }, error };
      }
    },
    signUp: async (credentials: { email: string, password: string }) => {
      try {
        const response = await apiService.post('/auth/register', credentials);
        return { data: { user: response.data.user, session: { access_token: response.data.token } }, error: null };
      } catch (error) {
        return { data: { user: null, session: null }, error };
      }
    }
  },
  rpc: (functionName: string, params?: any) => {
    return {
      select: async () => {
        try {
          const response = await apiService.post(`/rpc/${functionName}`, params);
          return { data: response.data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    };
  },
  from: (table: string) => ({
    select: (columns: string = '*') => {
      const query = { columns, filters: {}, orderBy: null, limit: null };
      
      const result = {
        eq: async (column: string, value: any) => {
          query.filters[column] = value;
          try {
            const response = await apiService.get(`/${table}?${column}=${value}`);
            return { 
              data: response.data, 
              error: null,
              // Adicionar métodos encadeados
              order: (column: string, options: { ascending?: boolean } = {}) => {
                query.orderBy = { column, ascending: options.ascending ?? true };
                return result;
              },
              single: () => {
                return { 
                  data: response.data && response.data.length > 0 ? response.data[0] : null, 
                  error: null 
                };
              }
            };
          } catch (error) {
            return { data: null, error };
          }
        },
        execute: async () => {
          try {
            const response = await apiService.get(`/${table}`);
            return { 
              data: response.data, 
              error: null,
              // Adicionar métodos encadeados
              order: (column: string, options: { ascending?: boolean } = {}) => {
                query.orderBy = { column, ascending: options.ascending ?? true };
                return result;
              },
              single: () => {
                return { 
                  data: response.data && response.data.length > 0 ? response.data[0] : null, 
                  error: null 
                };
              }
            };
          } catch (error) {
            return { data: null, error };
          }
        },
        // Adicionar métodos encadeados diretamente no objeto select
        order: (column: string, options: { ascending?: boolean } = {}) => {
          query.orderBy = { column, ascending: options.ascending ?? true };
          return result;
        },
        single: () => {
          return result;
        }
      };
      
      return result;
    },
    insert: async (data: any) => {
      try {
        const response = await apiService.post(`/${table}`, data);
        return { data: response.data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    },
    update: (data: any) => ({
      eq: async (column: string, value: any) => {
        try {
          const response = await apiService.put(`/${table}/${value}`, data);
          return { data: response.data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    }),
    delete: () => ({
      eq: async (column: string, value: any) => {
        try {
          const response = await apiService.delete(`/${table}/${value}`);
          return { data: response.data, error: null };
        } catch (error) {
          return { data: null, error };
        }
      }
    })
  })
};

// Exportar apiClient como supabase para compatibilidade
export const supabase = apiClient;
