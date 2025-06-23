import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  MessageSquare, 
  HardDrive, 
  Users, 
  Clock, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react'
import { MessageLimitsConfig } from './limits/MessageLimitsConfig'
import { StorageLimitsConfig } from './limits/StorageLimitsConfig'
import { useConfig } from '@/contexts/ConfigContext'

/**
 * Componente de Configurações de Limites do Sistema
 * 
 * Permite configurar limites de mensagens, armazenamento e outros recursos do sistema
 */
const LimitsConfig = () => {
  const [activeTab, setActiveTab] = useState('messages')
  const { toast } = useToast()
  const { resetConfig } = useConfig()
  
  // Função para restaurar configurações padrão
  const handleRestoreDefaults = async () => {
    if (confirm('Tem certeza que deseja restaurar todas as configurações de limites para os valores padrão? Esta ação não pode ser desfeita.')) {
      try {
        // Resetar configurações de limites no contexto global
        await resetConfig(['limits'])
        
        // Remover configurações antigas do localStorage (compatibilidade)
        localStorage.removeItem('messageLimitsConfig')
        localStorage.removeItem('storageLimitsConfig')
        
        toast({
          title: 'Configurações restauradas',
          description: 'Todas as configurações de limites foram restauradas para os valores padrão.',
        })
      } catch (error) {
        console.error('Erro ao restaurar configurações:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível restaurar as configurações.',
          variant: 'destructive'
        })
      }
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-datazap-green" />
          <h3 className="text-lg font-medium">Limites do Sistema</h3>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          onClick={handleRestoreDefaults}
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar Padrões
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
              Importante: Configuração de Limites
            </p>
            <p>
              Configurar limites adequados é essencial para garantir o desempenho do sistema e 
              evitar abusos. Recomendamos ajustar os limites de acordo com o uso real e o 
              crescimento da sua base de usuários.
            </p>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Limites de Mensagens</span>
            <span className="sm:hidden">Mensagens</span>
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span className="hidden sm:inline">Limites de Armazenamento</span>
            <span className="sm:hidden">Armazenamento</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Limites de Mensagens
              </CardTitle>
              <CardDescription>
                Configure limites de envio de mensagens por usuário, plano e período.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MessageLimitsConfig />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Limites de Armazenamento
              </CardTitle>
              <CardDescription>
                Configure limites de armazenamento por usuário, plano e tipo de arquivo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StorageLimitsConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border">
        <h4 className="text-sm font-medium mb-2">Dicas para Configuração de Limites</h4>
        <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
          <li>Defina limites que equilibrem a experiência do usuário e o desempenho do sistema.</li>
          <li>Monitore regularmente o uso de recursos para ajustar os limites conforme necessário.</li>
          <li>Considere oferecer limites mais generosos para planos pagos como incentivo à atualização.</li>
          <li>Configure notificações para alertar usuários quando estiverem se aproximando dos limites.</li>
          <li>Revise periodicamente as políticas de limpeza automática para garantir que dados importantes não sejam perdidos.</li>
        </ul>
      </div>
    </div>
  )
}

export default LimitsConfig
