import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/store/supabase'
import { useAuthStore } from '@/stores/authStore'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

/**
 * Página de Autenticação
 * 
 * Utiliza os componentes prontos do Supabase Auth UI para login e registro.
 * Após autenticação bem-sucedida, redireciona para o dashboard.
 */
const AuthPage = () => {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
  
  // Redirecionar para o dashboard se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Redirecionar para o dashboard após login bem-sucedido
        // O AuthInitializer vai cuidar de buscar os dados do usuário
        setTimeout(() => {
          navigate('/dashboard')
        }, 500)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [isAuthenticated, navigate])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo e nome do sistema */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="xl" />
          <h1 className="text-3xl font-bold text-datazap-green mt-4">Data<span className="text-datazap-dark-green">ZAP</span></h1>
          <p className="text-gray-600 mt-2">Gerencie suas mensagens importantes</p>
        </div>
        
        {/* Componente de autenticação do Supabase */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#10B981', // Cor principal (datazap-green)
                    brandAccent: '#047857', // Cor de destaque (datazap-dark-green)
                  }
                }
              }
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/dashboard`}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Registrar',
                  loading_button_label: 'Registrando...',
                  link_text: 'Não tem uma conta? Registre-se',
                },
                forgotten_password: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  button_label: 'Enviar instruções',
                  loading_button_label: 'Enviando instruções...',
                  link_text: 'Esqueceu sua senha?',
                  confirmation_text: 'Verifique seu email para redefinir sua senha',
                },
              }
            }}
          />
        </div>
        
        <div className="text-center mt-4 text-sm text-gray-500">
          <p>Para fins de teste, use:</p>
          <p>Email: admin@datazap.com / Senha: 123456</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            disabled={isCreatingAdmin}
            onClick={async () => {
              try {
                setIsCreatingAdmin(true);
                
                // Verificar se o usuário já existe
                const { data, error } = await supabase.auth.signInWithPassword({
                  email: 'admin@datazap.com',
                  password: '123456'
                });
                
                if (!error) {
                  toast({
                    title: "Usuário admin já existe",
                    description: "O usuário admin@datazap.com já existe e está pronto para uso."
                  });
                  return;
                }
                
                // Criar o usuário admin para testes
                const { error: signUpError } = await supabase.auth.signUp({
                  email: 'admin@datazap.com',
                  password: '123456',
                  options: {
                    data: {
                      name: 'Administrador',
                      is_admin: true
                    }
                  }
                });
                
                if (signUpError) {
                  toast({
                    title: "Erro ao criar usuário admin",
                    description: signUpError.message,
                    variant: "destructive"
                  });
                  return;
                }
                
                toast({
                  title: "Usuário admin criado",
                  description: "O usuário admin@datazap.com foi criado com sucesso. Você já pode fazer login."
                });
              } catch (error) {
                console.error("Erro ao criar usuário admin:", error);
                toast({
                  title: "Erro ao criar usuário admin",
                  description: "Ocorreu um erro ao criar o usuário admin. Verifique o console para mais detalhes.",
                  variant: "destructive"
                });
              } finally {
                setIsCreatingAdmin(false);
              }
            }}
          >
            {isCreatingAdmin ? "Criando..." : "Criar usuário admin para teste"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
