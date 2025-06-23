import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  Database, 
  Calendar, 
  Download, 
  Upload, 
  AlertTriangle, 
  Save,
  RotateCcw
} from 'lucide-react'
import { BackupScheduleConfig } from './backup/BackupScheduleConfig'
import { BackupRestoreManager } from './backup/BackupRestoreManager'
import { useConfig } from '@/contexts/ConfigContext'

/**
 * Componente de Configurações de Backup
 * 
 * Permite configurar backups automáticos, realizar backups manuais e restaurar backups
 */
const BackupConfig = () => {
  const [activeTab, setActiveTab] = useState('backup-restore')
  const { toast } = useToast()
  const { resetConfig } = useConfig()
  
  // Função para restaurar configurações padrão
  const handleRestoreDefaults = async () => {
    if (confirm('Tem certeza que deseja restaurar todas as configurações de backup para os valores padrão? Esta ação não pode ser desfeita.')) {
      try {
        // Resetar configurações de backup no contexto global
        await resetConfig(['backup'])
        
        // Remover configurações antigas do localStorage (compatibilidade)
        localStorage.removeItem('backupScheduleConfig')
        
        toast({
          title: 'Configurações restauradas',
          description: 'Todas as configurações de backup foram restauradas para os valores padrão.',
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
          <Database className="h-5 w-5 text-datazap-green" />
          <h3 className="text-lg font-medium">Backup e Restauração</h3>
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
              Importante: Backups Regulares
            </p>
            <p>
              Recomendamos configurar backups automáticos regulares e testar periodicamente a restauração 
              para garantir a segurança dos seus dados. Mantenha cópias dos backups em locais diferentes 
              para maior proteção contra perda de dados.
            </p>
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="backup-restore" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Backup e Restauração</span>
            <span className="sm:hidden">Backup</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Agendamento</span>
            <span className="sm:hidden">Agenda</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="backup-restore">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Backup e Restauração
              </CardTitle>
              <CardDescription>
                Crie backups manuais, restaure backups anteriores e gerencie o histórico de backups.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BackupRestoreManager />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agendamento de Backup
              </CardTitle>
              <CardDescription>
                Configure a frequência e retenção de backups automáticos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BackupScheduleConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md border">
        <h4 className="text-sm font-medium mb-2">Dicas para Backup</h4>
        <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
          <li>Realize backups completos regularmente, especialmente antes de atualizações importantes.</li>
          <li>Armazene backups em múltiplos locais (local, nuvem, dispositivos externos).</li>
          <li>Teste periodicamente a restauração de backups para garantir que estão funcionando corretamente.</li>
          <li>Mantenha um registro de quais dados estão incluídos em cada backup.</li>
          <li>Configure notificações para ser alertado sobre falhas nos backups automáticos.</li>
        </ul>
      </div>
    </div>
  )
}

export default BackupConfig
