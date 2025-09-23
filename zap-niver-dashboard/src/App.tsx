
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "@/contexts/ConfigContext";
import AuthInitializer from "./components/auth/AuthInitializer";
import AuthRedirect from "./components/auth/AuthRedirect";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ContatosPage from "./pages/ContatosPage";
import TemplatesComemorativosPage from "./pages/TemplatesComemorativosPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import ProfilePage from "./pages/ProfilePage";
import PagamentosPage from "./pages/PagamentosPage";
import HistoricoPage from "./pages/HistoricoPage";
import AdminPage from "./pages/AdminPage";
import PlansPage from "./pages/PlansPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import NotFoundPage from "./pages/NotFoundPage";

/**
 * Componente principal da aplicação
 * 
 * Configura:
 * - Provedores globais (QueryClient, Tooltip)
 * - Sistema de notificações (Toaster)
 * - Rotas da aplicação com React Router
 */

// Configuração do cliente de queries
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthInitializer />
          <AuthRedirect />
          <Routes>
            {/* Rotas de autenticação */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            
            {/* Rotas protegidas da aplicação */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/contatos" element={<ContatosPage />} />
            <Route path="/templates-comemorativos" element={<TemplatesComemorativosPage />} />
            <Route path="/configuracoes" element={<ConfiguracoesPage />} />
            <Route path="/configuracoes/perfil" element={<ProfilePage />} />
            <Route path="/pagamentos" element={<PagamentosPage />} />
            <Route path="/historico" element={<HistoricoPage />} />
            <Route path="/admin" element={<AdminPage />} />
            
            {/* Rotas de planos e checkout */}
            <Route path="/planos" element={<PlansPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/checkout/:planId" element={<CheckoutPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            
            {/* Redireciona a rota raiz para o dashboard */}
            <Route path="/" element={<DashboardPage />} />
            
            {/* Rota para páginas não encontradas */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
