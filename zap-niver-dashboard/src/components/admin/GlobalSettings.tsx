import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  MessageSquare, 
  Palette, 
  Bell, 
  Calendar, 
  Shield, 
  Database, 
  BarChart3, 
  Save,
  RotateCcw
} from 'lucide-react'
import WhatsAppConfig from './settings/WhatsAppConfig'
import InterfaceConfig from './settings/InterfaceConfig'
import NotificationsConfig from './settings/NotificationsConfig'
import DatesConfig from './settings/DatesConfig'
import SecurityConfig from './settings/SecurityConfig'
import BackupConfig from './settings/BackupConfig'
import LimitsConfig from './settings/LimitsConfig'

/**
 * Componente de Configurações Globais
 * 
 * Permite configurar diversos aspectos do sistema que afetam todos os usuários
 */
const GlobalSettings = ({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) => {
  const [activeTab, setActiveTab] = useState('whatsapp')
  const { toast } = useToast()
  
  // Função para salvar todas as configurações
  const handleSaveAll = () => {
    // Aqui implementaremos a lógica para salvar todas as configurações
    toast({
      title: "Configurações salvas",
      description: "Todas as configurações foram salvas com sucesso.",
    })
  }
  
  // Função para restaurar configurações padrão
  const handleRestoreDefaults = () => {
    // Aqui implementaremos a lógica para restaurar configurações padrão
    if (confirm("Tem certeza que deseja restaurar todas as configurações para os valores padrão?")) {
      toast({
        title: "Configurações restauradas",
        description: "Todas as configurações foram restauradas para os valores padrão.",
      })
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Configurações Globais</DialogTitle>
          <DialogDescription>
            Configure aspectos globais do sistema que afetam todos os usuários.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-4">
              <TabsTrigger value="whatsapp" className="flex items-center justify-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">WhatsApp</span>
              </TabsTrigger>
              <TabsTrigger value="interface" className="flex items-center justify-center">
                <Palette className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Interface</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center justify-center">
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="dates" className="flex items-center justify-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Datas</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center justify-center">
                <Shield className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Segurança</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center justify-center">
                <Database className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Backup</span>
              </TabsTrigger>
              <TabsTrigger value="limits" className="flex items-center justify-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Limites</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="whatsapp">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de WhatsApp</CardTitle>
                  <CardDescription>
                    Configure as integrações com WhatsApp e parâmetros de envio.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WhatsAppConfig />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="interface">
              <Card>
                <CardHeader>
                  <CardTitle>Personalização da Interface</CardTitle>
                  <CardDescription>
                    Personalize a aparência e o comportamento da interface.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InterfaceConfig />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Notificações</CardTitle>
                  <CardDescription>
                    Configure como e quando as notificações são enviadas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationsConfig />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="dates">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento de Datas Comemorativas</CardTitle>
                  <CardDescription>
                    Configure datas comemorativas e feriados.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DatesConfig />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Segurança</CardTitle>
                  <CardDescription>
                    Configure políticas de senha, autenticação e permissões.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SecurityConfig />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="backup">
              <Card>
                <CardHeader>
                  <CardTitle>Backup e Restauração</CardTitle>
                  <CardDescription>
                    Configure backups automáticos e restaure dados.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BackupConfig />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="limits">
              <Card>
                <CardHeader>
                  <CardTitle>Limites do Sistema</CardTitle>
                  <CardDescription>
                    Configure limites de uso e recursos do sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LimitsConfig />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handleRestoreDefaults}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restaurar Padrões
          </Button>
          <Button 
            onClick={handleSaveAll}
            className="bg-datazap-green hover:bg-datazap-green/90 gap-2"
          >
            <Save className="h-4 w-4" />
            Salvar Todas as Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default GlobalSettings
