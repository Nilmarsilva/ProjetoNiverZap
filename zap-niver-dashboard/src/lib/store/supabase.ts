// Este é um arquivo temporário para substituir o Supabase
// Fornece uma API compatível para evitar quebrar a aplicação enquanto migramos

// Funções de autenticação mockadas
export const isAuthenticated = (): boolean => {
  // Verificar se há um token no localStorage
  const authStorage = localStorage.getItem('datazap-auth-storage');
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

export const isAdmin = (): boolean => {
  // Verificar se o usuário é admin
  const authStorage = localStorage.getItem('datazap-auth-storage');
  if (authStorage) {
    try {
      const authData = JSON.parse(authStorage);
      return authData.state?.user?.role === 'admin' || false;
    } catch (e) {
      return false;
    }
  }
  return false;
};

// Cliente Supabase mockado
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('Mock: signInWithPassword', { email, password });
      // Implementação temporária que sempre retorna sucesso
      return {
        data: {
          session: {
            access_token: 'mock_token',
            user: { email, id: '1' }
          },
          user: { email, id: '1' }
        },
        error: null
      };
    },
    signOut: async () => {
      console.log('Mock: signOut');
      return { error: null };
    },
    getSession: async () => {
      console.log('Mock: getSession');
      // Verificar se há um token no localStorage
      const authStorage = localStorage.getItem('datazap-auth-storage');
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          if (authData.state?.isAuthenticated) {
            return {
              data: {
                session: {
                  access_token: 'mock_token',
                  user: authData.state.user
                }
              },
              error: null
            };
          }
        } catch (e) {
          // Ignorar erro
        }
      }
      return { data: { session: null }, error: null };
    },
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      console.log('Mock: onAuthStateChange');
      // Simular uma assinatura de eventos de autenticação
      // Retornar um objeto com uma função para cancelar a assinatura
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              console.log('Mock: unsubscribe from auth state change');
            }
          }
        }
      };
    }
  },
  from: (table: string) => {
    return {
      select: (columns: string = '*') => {
        return {
          eq: (field: string, value: any) => {
            return {
              single: async () => {
                console.log(`Mock: select ${columns} from ${table} where ${field} = ${value} (single)`);
                return { data: null, error: null };
              },
              order: (column: string, { ascending }: { ascending: boolean }) => {
                return {
                  range: (from: number, to: number) => {
                    console.log(`Mock: select ${columns} from ${table} where ${field} = ${value} order by ${column} ${ascending ? 'asc' : 'desc'} range ${from}-${to}`);
                    return Promise.resolve({ data: [], error: null });
                  }
                };
              }
            };
          },
          order: (column: string, { ascending }: { ascending: boolean }) => {
            return {
              range: (from: number, to: number) => {
                console.log(`Mock: select ${columns} from ${table} order by ${column} ${ascending ? 'asc' : 'desc'} range ${from}-${to}`);
                return Promise.resolve({ data: [], error: null });
              }
            };
          },
          single: async () => {
            console.log(`Mock: select ${columns} from ${table} (single)`);
            return { data: null, error: null };
          }
        };
      },
      insert: (data: any) => {
        console.log(`Mock: insert into ${table}`, data);
        return {
          select: () => {
            return {
              single: async () => {
                return { data: { ...data, id: 'mock_id' }, error: null };
              }
            };
          }
        };
      },
      update: (data: any) => {
        return {
          eq: (field: string, value: any) => {
            console.log(`Mock: update ${table} set ... where ${field} = ${value}`, data);
            return {
              select: () => {
                return {
                  single: async () => {
                    return { data: { ...data, id: value }, error: null };
                  }
                };
              }
            };
          }
        };
      },
      delete: () => {
        return {
          eq: (field: string, value: any) => {
            console.log(`Mock: delete from ${table} where ${field} = ${value}`);
            return Promise.resolve({ error: null });
          }
        };
      }
    };
  }
};

export default supabase;
