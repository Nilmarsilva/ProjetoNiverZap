import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

/**
 * Página de Autenticação
 * 
 * Formulário de login e registro personalizado
 * Após autenticação bem-sucedida, redireciona para o dashboard.
 */
const AuthPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('login')
  
  // Formulário de login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Redirecionar para o dashboard se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])
  
  // Função para fazer login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha para continuar",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await login(email, password)
      
      if (!result.success) {
        toast({
          title: "Erro de login",
          description: result.error || "Credenciais inválidas",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o dashboard...",
        })
        
        // Redirecionar para o dashboard
        setTimeout(() => {
          navigate('/dashboard')
        }, 500)
      }
    } catch (error) {
      console.error('Erro no login:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo e nome do sistema */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="xl" />
          <h1 className="text-3xl font-bold text-datazap-green mt-4">Data<span className="text-datazap-dark-green">ZAP</span></h1>
          <p className="text-gray-500 mt-2">Sistema de Automação de Mensagens</p>
        </div>
        
        {/* Formulário de login */}
        <Card>
          <CardHeader>
            <CardTitle>Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="login">Login</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="********" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-datazap-green hover:bg-datazap-green/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <p className="text-sm text-gray-500 text-center">
              Para fins de teste, use:<br />
              Email: admin@niverzap.com / Senha: Admin@123
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default AuthPage
