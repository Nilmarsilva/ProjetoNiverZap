import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

/**
 * Componente para redirecionar usuários com base no estado de autenticação
 * 
 * - Usuários não autenticados são redirecionados para /login
 * - Usuários autenticados na página de login são redirecionados para /dashboard
 */
export function AuthRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()
  
  useEffect(() => {
    // Se estiver autenticado e na página de login, redirecionar para o dashboard
    if (isAuthenticated && location.pathname === '/login') {
      navigate('/dashboard')
      return
    }
    
    // Se não estiver autenticado e não estiver na página de login ou registro, redirecionar para login
    if (!isAuthenticated && 
        location.pathname !== '/login' && 
        location.pathname !== '/register') {
      navigate('/login')
    }
  }, [isAuthenticated, location.pathname, navigate])
  
  // Este componente não renderiza nada
  return null
}

export default AuthRedirect
