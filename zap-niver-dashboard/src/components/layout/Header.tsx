
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Logo } from '@/assets/Logo'

/**
 * Componente Header
 * 
 * Exibe o cabeçalho da aplicação com:
 * - Nome da página atual
 * - Informações do usuário logado
 * - Menu de opções do usuário
 */
interface HeaderProps {
  title: string
}

const Header = ({ title }: HeaderProps) => {
  // Fix: Using separate selectors to avoid object creation in selector function
  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const navigate = useNavigate()
  
  const handleLogout = () => {
    // Limpar todos os dados de sessão diretamente
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpar cookies relacionados à autenticação
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Chamar o logout do store para limpar o estado
    logout();
    
    // Forçar um refresh completo e redirecionar para login
    window.location.href = '/login';
  }

  // Extrai as iniciais do nome do usuário para exibir no avatar
  const getUserInitials = () => {
    if (!user?.name) return '??'
    
    const nameParts = user.name.split(' ')
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase()
    
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
  }

  return (
    <header className="h-16 px-6 border-b bg-white flex items-center justify-between">
      {/* Logo e título da página atual */}
      <div className="flex items-center gap-3">
        <Logo width={32} height={32} />
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>
      
      {/* Perfil do usuário com dropdown */}
      <div className="flex items-center space-x-4">
        {user && (
          <div className="text-sm text-gray-600 text-right hidden sm:block">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar>
              <AvatarFallback className="bg-datazap-green text-white">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/configuracoes/perfil">Meu Perfil</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/configuracoes">Configurações do Sistema</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer" 
              onClick={handleLogout}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header
