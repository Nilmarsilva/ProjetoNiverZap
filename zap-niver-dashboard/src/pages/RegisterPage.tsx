import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/store/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'

/**
 * Página de Registro
 * 
 * Permite que novos usuários se cadastrem na aplicação.
 * Após o registro bem-sucedido, redireciona para a página de login.
 */
const RegisterPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar",
        variant: "destructive"
      })
      return
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação de senha devem ser iguais",
        variant: "destructive"
      })
      return
    }
    
    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      })
      return
    }
    
    try {
      setIsLoading(true)
      
      // Registrar o usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      })
      
      if (error) {
        toast({
          title: "Erro no registro",
          description: error.message,
          variant: "destructive"
        })
        return
      }
      
      if (data.user) {
        // Criar o registro do usuário na tabela users
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name: name,
              plan_id: '1', // Plano gratuito por padrão
              is_active: true,
              is_admin: false,
              created_at: new Date().toISOString()
            }
          ])
        
        if (userError) {
          console.error('Erro ao criar perfil do usuário:', userError)
          // Não vamos mostrar este erro para o usuário, pois o AuthInitializer
          // vai tentar criar o perfil novamente quando o usuário fizer login
        }
        
        toast({
          title: "Registro realizado com sucesso!",
          description: "Você já pode fazer login com suas credenciais.",
        })
        
        // Redirecionar para a página de login
        navigate('/login')
      }
    } catch (error) {
      console.error('Erro no registro:', error)
      toast({
        title: "Erro no registro",
        description: "Ocorreu um erro ao tentar registrar sua conta. Tente novamente.",
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
          <Logo size="lg" />
          <p className="text-gray-600 mt-2">Gerencie suas mensagens importantes</p>
        </div>
        
        {/* Card de registro */}
        <Card>
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
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
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-datazap-green hover:bg-datazap-green/90"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
              <div className="text-center text-sm">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-datazap-green hover:underline">
                  Faça login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage
