import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiService from '@/services/apiService'

interface User {
  id: string
  email: string
  name?: string
  full_name?: string
  plan?: {
    id: string
    name: string
    max_contacts: number
    max_templates: number
    price: number
  }
  plan_id?: string
  is_active?: boolean
  is_admin?: boolean
  created_at?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithUserData: (userData: User) => void
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      loginWithUserData: (userData) => {
        set({
          user: userData,
          isAuthenticated: true
        })
      },
      
      login: async (email, password) => {
        try {
          // Usar o novo serviço de API
          const response = await apiService.auth.login({ email, password });
          
          // Extrair dados do usuário e token da resposta
          const { user, token } = response.data;
          
          // Verificar se o usuário está ativo
          if (user && !user.is_active) {
            return { 
              success: false, 
              error: 'Conta desativada. Entre em contato com o suporte.' 
            };
          }
          
          set({
            user: user as User,
            token: token,
            isAuthenticated: !!token,
          });
          
          return { success: true }
        } catch (error: any) {
          console.error('Erro no login:', error)
          return { 
            success: false, 
            error: error.response?.data?.error || 'Erro ao fazer login. Tente novamente.' 
          }
        }
      },

      logout: async () => {
        // Limpar o estado local
        set({ user: null, token: null, isAuthenticated: false })
        
        // Limpar dados de sessão no localStorage
        localStorage.removeItem('niverzap-auth-storage')
        
        // Limpar outros possíveis dados de sessão
        sessionStorage.clear()
        
        // Forçar limpeza de cookies relacionados à autenticação
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name.includes('auth') || name.includes('supabase')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
      }
    }),
    {
      name: 'niverzap-auth-storage', // Nome do armazenamento local
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)
