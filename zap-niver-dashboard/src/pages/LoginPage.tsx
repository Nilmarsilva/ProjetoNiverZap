
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/stores/authStore'
import apiService from '@/services/apiService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'

/**
 * Página de Login
 * 
 * Permite que o usuário se autentique na aplicação.
 * Após autenticação bem-sucedida, redireciona para o dashboard.
 */
const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { loginWithUserData } = useAuthStore()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const navigate = useNavigate()
  const { toast } = useToast()
  
  // Redirecionar para o dashboard se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha para continuar",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      // Verificar se é o usuário admin ou teste para compatibilidade
      if ((email === 'admin@datazap.com' && password === '123456') ||
          (email === 'teste@niverzap.com' && password === 'teste123')) {
        // Login do usuário admin simulado
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        })
        
        // Criar um usuário simulado com base no email
        const isAdmin = email === 'admin@datazap.com';
        
        loginWithUserData({
          id: isAdmin ? 'admin-id' : 'teste-id',
          email: email,
          name: isAdmin ? 'Administrador' : 'Usuário de Teste',
          plan: {
            id: '1',
            name: isAdmin ? 'Premium' : 'Gratuito',
            max_contacts: isAdmin ? 1000 : 100,
            max_templates: isAdmin ? 50 : 5,
            price: 0,
          },
          is_admin: isAdmin
        })
        
        // Disparar evento de login bem-sucedido
        const loginEvent = new Event('login-success')
        window.dispatchEvent(loginEvent)
        
        // Redirecionar para o dashboard
        setTimeout(() => {
          navigate('/dashboard')
        }, 100)
        return
      }
      
      // Login usando a API
      const { login } = useAuthStore.getState()
      const result = await login(email, password)
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        })
        
        // Disparar evento de login bem-sucedido
        const loginEvent = new Event('login-success')
        window.dispatchEvent(loginEvent)
        
        // Redirecionar para o dashboard
        setTimeout(() => {
          navigate('/dashboard')
        }, 100)
      } else {
        toast({
          title: "Falha na autenticação",
          description: result.error || "Email ou senha incorretos",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao tentar fazer login.",
        variant: "destructive"
      })
      console.error("Erro no login:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo e nome do sistema */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" />
          <p className="text-gray-600 mt-2">Gerencie suas mensagens importantes</p>
        </div>
        
        {/* Card de login */}
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <a href="#" className="text-xs text-datazap-green hover:underline">
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="text-sm text-gray-500">
                Use: admin@datazap.com / 123456
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-datazap-green hover:bg-datazap-green/90" 
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              <div className="text-center text-sm">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-datazap-green hover:underline">
                  Registre-se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
