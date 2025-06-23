import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import apiService from '@/services/apiService'
import { useToast } from '@/components/ui/use-toast'

/**
 * Componente para inicializar a autenticação
 * 
 * Este componente verifica se há um token JWT válido
 * e carrega os dados do usuário se houver
 */
export function AuthInitializer() {
  const { loginWithUserData, setToken } = useAuthStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  useEffect(() => {
    // Verificar se há um token JWT válido ao inicializar o componente
    const checkToken = async () => {
      try {
        // Obter o token do localStorage
        const token = localStorage.getItem('auth-token')
        
        if (token) {
          // Se existe um token, verificar se é válido
          try {
            const response = await apiService.auth.verifyToken(token)
            
            if (response.data.valid) {
              // Token válido, obter os dados do usuário
              const userData = response.data.user
            
              // Login com os dados do usuário
              loginWithUserData(userData)
              setToken(token)
              
              // Disparar evento de login bem-sucedido
              const loginEvent = new Event('login-success')
              window.dispatchEvent(loginEvent)
            } else {
              // Token inválido, limpar o localStorage
              localStorage.removeItem('auth-token')
            }
          } catch (error) {
            console.error('Erro ao verificar token:', error)
            // Token inválido ou expirado, limpar o localStorage
            localStorage.removeItem('auth-token')
          } 
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error)
        toast({
          title: 'Erro de autenticação',
          description: 'Ocorreu um erro ao verificar sua sessão. Tente fazer login novamente.',
          variant: 'destructive'
        })
      }
    }
    
    checkToken()
    
    // Adicionar listener para evento de login bem-sucedido
    const handleLoginSuccess = () => {
      navigate('/dashboard')
    }
    
    window.addEventListener('login-success', handleLoginSuccess)
    
    // Limpar listener ao desmontar o componente
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess)
    }
  }, [loginWithUserData, setToken, navigate, toast])
  
  // Este componente não renderiza nada
  return null
}

export default AuthInitializer
