// Serviço de autenticação temporário para substituir o Supabase
import { create } from 'zustand';
import { persist } from 'zustand/middleware';


// Definição do tipo de usuário
export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'user' | 'admin';
  is_admin?: boolean;
  full_name?: string;
}

// Interface para o estado de autenticação
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Ações
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  logout: () => void;
  getSession: () => { user: User | null, token: string | null };
  updateUser: (userData: Partial<User>) => Promise<User>;
}

// Usuários mockados para desenvolvimento
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@datazap.com',
    name: 'Administrador',
    role: 'admin' as const,
    password: 'admin123'
  },
  {
    id: '2',
    email: 'user@example.com',
    name: 'Usuário Teste',
    role: 'user' as const,
    password: 'user123'
  }
];

// Store de autenticação
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Login
      login: async (email: string, password: string) => {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Encontrar usuário
        const user = MOCK_USERS.find(u => u.email === email && u.password === password);
        
        if (!user) {
          throw new Error('Credenciais inválidas');
        }
        
        // Criar token JWT simulado
        const token = `mock_token_${Date.now()}_${user.id}`;
        
        // Atualizar estado
        const userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
        
        set({
          user: userData,
          token,
          isAuthenticated: true
        });
        
        return userData;
      },
      
      // Registro
      register: async (email: string, password: string, name: string) => {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verificar se o email já existe
        if (MOCK_USERS.some(u => u.email === email)) {
          throw new Error('Email já cadastrado');
        }
        
        // Criar novo usuário
        const newUser = {
          id: `user_${Date.now()}`,
          email,
          name,
          role: 'user' as const,
          password
        };
        
        // Em um ambiente real, salvaríamos no banco de dados
        // Aqui apenas simulamos
        MOCK_USERS.push(newUser);
        
        // Criar token JWT simulado
        const token = `mock_token_${Date.now()}_${newUser.id}`;
        
        // Atualizar estado
        const userData = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        };
        
        set({
          user: userData,
          token,
          isAuthenticated: true
        });
        
        return userData;
      },
      
      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },
      
      // Obter sessão atual
      getSession: () => {
        const { user, token } = get();
        return { user, token };
      },
      
      // Atualizar dados do usuário
      updateUser: async (userData: Partial<User>) => {
        const currentUser = get().user;
        
        if (!currentUser) {
          throw new Error('Usuário não autenticado');
        }
        
        const updatedUser = {
          ...currentUser,
          ...userData
        };
        
        set({ user: updatedUser });
        
        return updatedUser;
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

// Funções auxiliares para compatibilidade com o código existente
export const getJwtToken = (): string | null => {
  return useAuthStore.getState().token;
};

export const isAuthenticated = (): boolean => {
  return useAuthStore.getState().isAuthenticated;
};

export const isAdmin = (): boolean => {
  const user = useAuthStore.getState().user;
  return user?.is_admin === true;
};

// Objeto de serviço para uso em outros componentes
export const authService = {
  login: useAuthStore.getState().login,
  register: useAuthStore.getState().register,
  logout: useAuthStore.getState().logout,
  getSession: useAuthStore.getState().getSession,
  updateUser: useAuthStore.getState().updateUser,
  getToken: getJwtToken,
  isAuthenticated,
  isAdmin
};

export default authService;
