import { ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Loader2 } from 'lucide-react'

interface AdminRouteProps {
  children: ReactNode
}

/**
 * Componente que protege rotas administrativas
 * Redireciona para o dashboard se o usuário não for admin
 */
const AdminRoute = ({ children }: AdminRouteProps) => {
  const [loading, setLoading] = useState(true)
  const [isUserAdmin, setIsUserAdmin] = useState(false)
  const user = useAuthStore((state) => state.user)
  const location = useLocation()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      // Verificar diretamente se o usuário é admin usando o campo is_admin
      setIsUserAdmin(user?.is_admin === true)
      setLoading(false)
    }

    checkAdminStatus()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Verificando permissões...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isUserAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default AdminRoute
