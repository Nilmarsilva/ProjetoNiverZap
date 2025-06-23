import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, Users, CreditCard, BarChart3 } from 'lucide-react'
import PlanManagement from '@/components/admin/PlanManagement'
import UserManagement from '@/components/admin/UserManagement'
import ReportsManagement from "@/components/admin/ReportsManagement"
import GlobalSettings from "@/components/admin/GlobalSettings"
import AppLayout from '@/components/layout/AppLayout'
// import { useAuthStore } from '@/stores/authStore'
// import { Navigate } from 'react-router-dom'

/**
 * Página de Administração
 * 
 * Acesso restrito a administradores
 * Permite gerenciar planos, usuários, templates e outras configurações do sistema
 * Fornece relatórios e estatísticas sobre o uso da plataforma
 */
const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('planos')
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false)
  
  // Temporariamente removemos a verificação de admin para facilitar o desenvolvimento
  // Isso será implementado corretamente quando a autenticação estiver pronta

  return (
    <AppLayout title="Administração">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Administração do Sistema</h1>
            <p className="text-muted-foreground mt-1">Gerencie usuários, planos, templates e configurações</p>
          </div>
          <Button 
            className="bg-datazap-green hover:bg-datazap-green/90"
            onClick={() => setGlobalSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações Globais
          </Button>
        </div>
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planos" className="flex items-center justify-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Planos
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center justify-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>
        
        <TabsContent value="planos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Planos</CardTitle>
              <CardDescription>
                Crie, edite e gerencie os planos disponíveis no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="usuarios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie os usuários cadastrados no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="relatorios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios e Estatísticas</CardTitle>
              <CardDescription>
                Visualize estatísticas e relatórios do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportsManagement />
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>
    </div>
    
    {/* Componente de Configurações Globais */}
    <GlobalSettings 
      open={globalSettingsOpen} 
      onOpenChange={setGlobalSettingsOpen} 
    />
  </AppLayout>
  )
}

export default AdminPage
