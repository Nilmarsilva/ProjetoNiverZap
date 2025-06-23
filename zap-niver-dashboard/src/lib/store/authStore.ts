
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Definição do tipo de usuário
interface User {
  id: string
  name: string
  email: string
}

// Interface de estado de autenticação
interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User) => void
}

// Mock de API para simular autenticação
const mockLogin = async (email: string, password: string): Promise<{user: User, token: string} | null> => {
  // Simulando uma chamada de API com timeout
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Usuário de teste (em produção, isso seria verificado no backend)
  if (email === "admin@niverzap.com" && password === "123456") {
    return {
      user: {
        id: "1",
        name: "Administrador",
        email: "admin@niverzap.com"
      },
      token: "mock-jwt-token"
    }
  }
  
  return null
}

/**
 * Store Zustand para gerenciar autenticação
 * 
 * Responsável por:
 * - Armazenar dados do usuário logado
 * - Gerenciar o token de autenticação
 * - Fornecer métodos de login e logout
 * - Persistir dados no localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Função de login que verifica credenciais
      login: async (email: string, password: string) => {
        try {
          // Em produção: Chama API real de autenticação
          const response = await mockLogin(email, password)
          
          if (!response) {
            return false
          }
          
          // Atualiza o estado com os dados do usuário
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
          })
          
          return true
        } catch (error) {
          console.error("Erro ao fazer login:", error)
          return false
        }
      },
      
      // Remove os dados do usuário e limpa o token
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
      
      // Atualiza apenas os dados do usuário
      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: "niverzap-auth", // nome para o armazenamento no localStorage
    }
  )
)
