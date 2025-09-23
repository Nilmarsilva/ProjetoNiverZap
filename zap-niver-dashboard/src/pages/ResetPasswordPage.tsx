import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { emailService } from '@/services/emailService'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

/**
 * Página de Redefinição de Senha
 * 
 * Permite que o usuário redefina sua senha após receber um email de recuperação.
 */
const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  
  // Verificar se o token é válido
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false)
        return
      }
      
      try {
        const result = await emailService.verifyRecoveryToken(token)
        setIsTokenValid(result.success)
      } catch (error) {
        console.error('Erro ao verificar token:', error)
        setIsTokenValid(false)
      } finally {
        setIsVerifying(false)
      }
    }
    
    verifyToken()
  }, [token])
  
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
  
  // Validação de confirmação de senha
  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Confirmação de senha é obrigatória')
      return false
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('As senhas não coincidem')
      return false
    }
    setConfirmPasswordError('')
    return true
  }
  
  // Função para redefinir a senha
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      toast({
        title: "Erro",
        description: "Token de recuperação inválido",
        variant: "destructive"
      })
      return
    }
    
    const isPasswordValid = validatePassword(password)
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword)
    
    if (!isPasswordValid || !isConfirmPasswordValid) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await emailService.resetPassword(token, password)
      
      if (result.success) {
        setIsSuccess(true)
        toast({
          title: "Senha redefinida",
          description: "Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.",
        })
        
        // Redirecionar para a página de login após alguns segundos
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        toast({
          title: "Erro",
          description: result.message || "Não foi possível redefinir sua senha",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao redefinir sua senha. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Renderizar mensagem de carregamento
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-datazap-green" />
          <p className="mt-4 text-gray-600">Verificando token de recuperação...</p>
        </div>
      </div>
    )
  }
  
  // Renderizar mensagem de token inválido
  if (!isTokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Logo size="xl" />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Link Inválido</CardTitle>
              <CardDescription>
                O link de recuperação de senha é inválido ou expirou.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  Por favor, solicite um novo link de recuperação de senha na página de login.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-datazap-green hover:bg-datazap-green/90"
                onClick={() => navigate('/login')}
              >
                Voltar para o Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="xl" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              Digite sua nova senha para continuar
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isSuccess ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Senha redefinida com sucesso! Você será redirecionado para a página de login.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="********" 
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (passwordError) validatePassword(e.target.value)
                      if (confirmPassword) validateConfirmPassword(confirmPassword)
                    }}
                    disabled={isLoading}
                    required
                    className={passwordError ? "border-red-500" : ""}
                  />
                  {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    placeholder="********" 
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (confirmPasswordError) validateConfirmPassword(e.target.value)
                    }}
                    disabled={isLoading}
                    required
                    className={confirmPasswordError ? "border-red-500" : ""}
                  />
                  {confirmPasswordError && <p className="text-sm text-red-500">{confirmPasswordError}</p>}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-datazap-green hover:bg-datazap-green/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    'Redefinir Senha'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPasswordPage
