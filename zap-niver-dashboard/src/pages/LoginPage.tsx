
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { emailService } from '@/services/emailService'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

/**
 * Página de Login
 * 
 * Permite que o usuário se autentique na aplicação.
 * Após autenticação bem-sucedida, redireciona para o dashboard.
 */
const LoginPage = () => {
  // Estados para formulário de login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  // Estados para recuperação de senha
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false)
  const [recoverySuccess, setRecoverySuccess] = useState(false)
  
  // Hooks de autenticação e navegação
  const { login } = useAuthStore()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const navigate = useNavigate()
  
  // Redirecionar para o dashboard se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Validação de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError('Email é obrigatório')
      return false
    } else if (!emailRegex.test(email)) {
      setEmailError('Formato de email inválido')
      return false
    }
    setEmailError('')
    return true
  }

  // Validação de senha
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Senha é obrigatória')
      return false
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres')
      return false
    }
    setPasswordError('')
    return true
  }

  // Função para fazer login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar campos
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
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

  // Função para recuperação de senha
  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(recoveryEmail)) {
      return
    }
    
    setIsRecoveryLoading(true)
    
    try {
      // Chamar o serviço de email para enviar o email de recuperação
      const result = await emailService.sendPasswordRecoveryEmail(recoveryEmail)
      
      if (result.success) {
        setRecoverySuccess(true)
        
        toast({
          title: "Email enviado",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        })
        
        // Fechar o diálogo após alguns segundos
        setTimeout(() => {
          setIsRecoveryOpen(false)
          setRecoverySuccess(false)
          setRecoveryEmail('')
        }, 3000)
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível enviar o email de recuperação.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro na recuperação de senha:', error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email de recuperação.",
        variant: "destructive"
      })
    } finally {
      setIsRecoveryLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo e nome do sistema */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="xl" />
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
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) validateEmail(e.target.value)
                  }}
                  disabled={isLoading}
                  required
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <button 
                    type="button" 
                    className="text-xs text-datazap-green hover:underline"
                    onClick={() => setIsRecoveryOpen(true)}
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="********" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) validatePassword(e.target.value)
                  }}
                  disabled={isLoading}
                  required
                  className={passwordError ? "border-red-500" : ""}
                />
                {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
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
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-gray-500 text-center">
              Para fins de teste, use:<br />
              Email: admin@niverzap.com / Senha: Admin@123
            </p>
            <div className="text-center text-sm">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-datazap-green hover:underline">
                Registre-se
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Diálogo de recuperação de senha */}
      <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recuperação de Senha</DialogTitle>
            <DialogDescription>
              Digite seu email para receber instruções de recuperação de senha.
            </DialogDescription>
          </DialogHeader>
          
          {recoverySuccess ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Email enviado com sucesso! Verifique sua caixa de entrada para instruções de recuperação de senha.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleRecoveryRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email</Label>
                <Input 
                  id="recovery-email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  value={recoveryEmail}
                  onChange={(e) => {
                    setRecoveryEmail(e.target.value)
                    if (emailError) validateEmail(e.target.value)
                  }}
                  disabled={isRecoveryLoading}
                  required
                  className={emailError ? "border-red-500" : ""}
                />
                {emailError && <p className="text-sm text-red-500">{emailError}</p>}
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsRecoveryOpen(false)}
                  disabled={isRecoveryLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-datazap-green hover:bg-datazap-green/90"
                  disabled={isRecoveryLoading}
                >
                  {isRecoveryLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default LoginPage
