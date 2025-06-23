
import { ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Sidebar from './Sidebar'
import Header from './Header'

/**
 * Layout principal da aplicação
 * 
 * Estrutura base que envolve todas as páginas autenticadas
 * Inclui sidebar, header e verifica autenticação
 */
interface AppLayoutProps {
  children: ReactNode
  title: string
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const navigate = useNavigate()

  // Verifica se o usuário está autenticado, caso contrário redireciona para login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  // Se não estiver autenticado, não renderiza o layout completo
  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Barra lateral de navegação */}
      <Sidebar />
      
      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabeçalho com título da página */}
        <Header title={title} />
        
        {/* Conteúdo da página */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
