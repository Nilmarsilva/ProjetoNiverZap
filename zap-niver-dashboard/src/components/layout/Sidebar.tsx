import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/store/utils'
import { useAuthStore } from '@/stores/authStore'
import {
  LayoutDashboard,
  Users as Contact,
  FileText,
  Settings,
  CreditCard,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Package
} from 'lucide-react'

/**
 * Componente Sidebar
 * 
 * Barra lateral de navegação principal com opção de colapsar
 * Exibe links para as principais páginas da aplicação
 */
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  
  // Verificar se o usuário é administrador
  const isAdmin = user?.is_admin === true
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

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

  return (
    <aside 
      className={cn(
        "bg-sidebar h-screen flex flex-col transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      {/* Logo do sistema */}
      <div className="flex items-center justify-between py-4 px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-white font-bold text-xl">
            Data<span className="text-sidebar-primary">ZAP</span>
          </span>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "p-1 rounded-full text-white hover:bg-green-700",
            collapsed && "mx-auto"
          )}
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* Links de navegação */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => cn(
            "flex items-center py-3 px-4 rounded-md hover:bg-green-700",
            "text-white",
            isActive ? "bg-green-700 font-medium" : "transparent",
            collapsed ? "justify-center" : ""
          )}
        >
          <LayoutDashboard className="h-5 w-5 text-white" />
          {!collapsed && <span className="ml-3 text-white">Dashboard</span>}
        </NavLink>
        
        <NavLink
          to="/contatos"
          className={({ isActive }) => cn(
            "flex items-center py-3 px-4 rounded-md hover:bg-green-700",
            "text-white",
            isActive ? "bg-green-700 font-medium" : "transparent",
            collapsed ? "justify-center" : ""
          )}
        >
          <Contact className="h-5 w-5 text-white" />
          {!collapsed && <span className="ml-3 text-white">Contatos</span>}
        </NavLink>
        
        <NavLink
          to="/templates-comemorativos"
          className={({ isActive }) => cn(
            "flex items-center py-3 px-4 rounded-md hover:bg-green-700",
            "text-white",
            isActive ? "bg-green-700 font-medium" : "transparent",
            collapsed ? "justify-center" : ""
          )}
        >
          <FileText className="h-5 w-5 text-white" />
          {!collapsed && <span className="ml-3 text-white">Templates</span>}
        </NavLink>
        
        <NavLink
          to="/historico"
          className={({ isActive }) => cn(
            "flex items-center py-3 px-4 rounded-md hover:bg-green-700",
            "text-white",
            isActive ? "bg-green-700 font-medium" : "transparent",
            collapsed ? "justify-center" : ""
          )}
        >
          <History className="h-5 w-5 text-white" />
          {!collapsed && <span className="ml-3 text-white">Histórico</span>}
        </NavLink>
        
        <NavLink
          to="/pagamentos"
          className={({ isActive }) => cn(
            "flex items-center py-3 px-4 rounded-md hover:bg-green-700",
            "text-white",
            isActive ? "bg-green-700 font-medium" : "transparent",
            collapsed ? "justify-center" : ""
          )}
        >
          <CreditCard className="h-5 w-5 text-white" />
          {!collapsed && <span className="ml-3 text-white">Pagamentos</span>}
        </NavLink>
        
        <NavLink
          to="/planos"
          className={({ isActive }) => cn(
            "flex items-center py-3 px-4 rounded-md hover:bg-green-700",
            "text-white",
            isActive ? "bg-green-700 font-medium" : "transparent",
            collapsed ? "justify-center" : ""
          )}
        >
          <Package className="h-5 w-5 text-white" />
          {!collapsed && <span className="ml-3 text-white">Planos</span>}
        </NavLink>
        
        <NavLink
          to="/configuracoes"
          className={({ isActive }) => cn(
            "flex items-center py-3 px-4 rounded-md hover:bg-green-700",
            "text-white",
            isActive ? "bg-green-700 font-medium" : "transparent",
            collapsed ? "justify-center" : ""
          )}
        >
          <Settings className="h-5 w-5 text-white" />
          {!collapsed && <span className="ml-3 text-white">Configurações</span>}
        </NavLink>
        
        {/* Link de administração - visível apenas para admin */}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => cn(
              "flex items-center py-3 px-4 rounded-md hover:bg-green-700",
              "text-white",
              isActive ? "bg-green-700 font-medium" : "transparent",
              collapsed ? "justify-center" : ""
            )}
          >
            <ShieldCheck className="h-5 w-5 text-white" />
            {!collapsed && <span className="ml-3 text-white">Administração</span>}
          </NavLink>
        )}
      </nav>

      {/* Botão de logout na parte inferior */}
      <div className="p-4 border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-white justify-start hover:bg-green-700",
            collapsed && "justify-center"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 text-white" />
          {!collapsed && <span className="ml-3 text-white">Sair</span>}
        </Button>
      </div>
    </aside>
  )
}

export default Sidebar
