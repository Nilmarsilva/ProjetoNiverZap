import { ReactNode, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { isAdmin } from '@/lib/store/supabase'
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

      try {
        const adminStatus = await isAdmin()
        setIsUserAdmin(adminStatus)
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error)
        setIsUserAdmin(false)
      } finally {
        setLoading(false)
      }
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
