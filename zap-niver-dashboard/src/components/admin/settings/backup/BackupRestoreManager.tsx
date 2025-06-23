import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  FileDown, 
  FileUp, 
  Trash2, 
  Info, 
  Check, 
  AlertTriangle 
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useConfig } from '@/contexts/ConfigContext'

// Interface para backups
interface Backup {
  id: string
  name: string
  date: Date
  size: string
  type: 'auto' | 'manual'
  status: 'success' | 'failed' | 'in-progress'
  contents: string[]
}

/**
 * Componente de Gerenciamento de Backup e Restauração
 * 
 * Permite realizar backups manuais, restaurar backups e visualizar o histórico
 */
export const BackupRestoreManager = () => {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(false)
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [restoreInProgress, setRestoreInProgress] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null)
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [backupToDelete, setBackupToDelete] = useState<Backup | null>(null)
  const { toast } = useToast()
  const { configs } = useConfig()
  
  // Buscar backups ao carregar o componente
  useEffect(() => {
    fetchBackups()
  }, [])
  
  // Função para buscar backups
  const fetchBackups = async () => {
    setLoading(true)
    try {
      // Dados mockados para desenvolvimento
      const mockBackups: Backup[] = [
        {
          id: 'bkp-001',
          name: 'Backup Diário Automático',
          date: new Date(2025, 4, 20, 3, 0, 0),
          size: '45.2 MB',
          type: 'auto',
          status: 'success',
          contents: ['Usuários', 'Contatos', 'Mensagens', 'Configurações']
        },
        {
          id: 'bkp-002',
          name: 'Backup Diário Automático',
          date: new Date(2025, 4, 19, 3, 0, 0),
          size: '44.8 MB',
          type: 'auto',
          status: 'success',
          contents: ['Usuários', 'Contatos', 'Mensagens', 'Configurações']
        },
        {
          id: 'bkp-003',
          name: 'Backup Manual Pré-Atualização',
          date: new Date(2025, 4, 18, 15, 30, 0),
          size: '44.5 MB',
          type: 'manual',
          status: 'success',
          contents: ['Usuários', 'Contatos', 'Mensagens', 'Configurações']
        },
        {
          id: 'bkp-004',
          name: 'Backup Diário Automático',
          date: new Date(2025, 4, 18, 3, 0, 0),
          size: '43.9 MB',
          type: 'auto',
          status: 'success',
          contents: ['Usuários', 'Contatos', 'Mensagens', 'Configurações']
        },
        {
          id: 'bkp-005',
          name: 'Backup Diário Automático',
          date: new Date(2025, 4, 17, 3, 0, 0),
          size: '43.2 MB',
          type: 'auto',
          status: 'failed',
          contents: []
        }
      ]
      
      setBackups(mockBackups)
    } catch (error) {
      console.error('Erro ao buscar backups:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os backups',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Função para criar um backup manual
  const handleCreateBackup = async () => {
    setBackupInProgress(true)
    setProgress(0)
    
    try {
      // Simulação de progresso
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 500)
      
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      // Adicionar novo backup à lista
      const newBackup: Backup = {
        id: `bkp-${Date.now()}`,
        name: 'Backup Manual',
        date: new Date(),
        size: '45.5 MB',
        type: 'manual',
        status: 'success',
        contents: ['Usuários', 'Contatos', 'Mensagens', 'Configurações']
      }
      
      setBackups([newBackup, ...backups])
      
      toast({
        title: 'Backup concluído',
        description: 'O backup manual foi criado com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao criar backup:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o backup',
        variant: 'destructive'
      })
    } finally {
      setBackupInProgress(false)
      setProgress(0)
    }
  }
  
  // Função para restaurar um backup
  const handleRestoreBackup = async () => {
    if (!selectedBackup) return
    
    setRestoreInProgress(true)
    setProgress(0)
    setConfirmRestoreOpen(false)
    
    try {
      // Simulação de progresso
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 300)
      
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 6000))
      
      toast({
        title: 'Restauração concluída',
        description: `O backup "${selectedBackup.name}" foi restaurado com sucesso.`,
      })
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível restaurar o backup',
        variant: 'destructive'
      })
    } finally {
      setRestoreInProgress(false)
      setProgress(0)
      setSelectedBackup(null)
    }
  }
  
  // Função para excluir um backup
  const handleDeleteBackup = async () => {
    if (!backupToDelete) return
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar a lista local
      setBackups(backups.filter(b => b.id !== backupToDelete.id))
      
      toast({
        title: 'Backup excluído',
        description: `O backup "${backupToDelete.name}" foi excluído com sucesso.`,
      })
    } catch (error) {
      console.error('Erro ao excluir backup:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o backup',
        variant: 'destructive'
      })
    } finally {
      setConfirmDeleteOpen(false)
      setBackupToDelete(null)
    }
  }
  
  // Função para exportar um backup
  const handleExportBackup = (backup: Backup) => {
    try {
      // Em uma implementação real, isso geraria um download do arquivo de backup
      toast({
        title: 'Download iniciado',
        description: `O backup "${backup.name}" está sendo baixado.`,
      })
    } catch (error) {
      console.error('Erro ao exportar backup:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar o backup',
        variant: 'destructive'
      })
    }
  }
  
  // Função para importar um backup
  const handleImportBackup = () => {
    // Em uma implementação real, isso abriria um seletor de arquivo
    toast({
      title: 'Importação de backup',
      description: 'A funcionalidade de importação será implementada em breve.',
    })
  }
  
  // Função para formatar a data
  const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-datazap-green" />
          <h3 className="text-lg font-medium">Backup e Restauração</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleImportBackup}
          >
            <FileUp className="h-4 w-4" />
            Importar
          </Button>
          
          <Button
            className="bg-datazap-green hover:bg-datazap-green/90 gap-2"
            size="sm"
            onClick={handleCreateBackup}
            disabled={backupInProgress || restoreInProgress}
          >
            {backupInProgress ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Criar Backup
              </>
            )}
          </Button>
        </div>
      </div>
      
      {(backupInProgress || restoreInProgress) && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {backupInProgress ? 'Criando backup...' : 'Restaurando backup...'}
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Nenhum backup encontrado
                </TableCell>
              </TableRow>
            ) : (
              backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell className="font-medium">
                    {backup.name}
                  </TableCell>
                  <TableCell>{formatDate(backup.date)}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>
                    <Badge variant={backup.type === 'auto' ? 'outline' : 'default'}>
                      {backup.type === 'auto' ? 'Automático' : 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={
                        backup.status === 'success' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                          : backup.status === 'failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      }
                    >
                      {backup.status === 'success' ? 'Sucesso' : backup.status === 'failed' ? 'Falha' : 'Em Progresso'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Detalhes"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Detalhes do Backup</DialogTitle>
                            <DialogDescription>
                              Informações detalhadas sobre o backup selecionado.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">Nome</p>
                                <p className="text-sm text-muted-foreground">{backup.name}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">ID</p>
                                <p className="text-sm text-muted-foreground">{backup.id}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Data</p>
                                <p className="text-sm text-muted-foreground">{formatDate(backup.date)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Tamanho</p>
                                <p className="text-sm text-muted-foreground">{backup.size}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Tipo</p>
                                <p className="text-sm text-muted-foreground">
                                  {backup.type === 'auto' ? 'Automático' : 'Manual'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Status</p>
                                <p className="text-sm text-muted-foreground">
                                  {backup.status === 'success' ? 'Sucesso' : backup.status === 'failed' ? 'Falha' : 'Em Progresso'}
                                </p>
                              </div>
                            </div>
                            
                            {backup.status === 'success' && (
                              <div>
                                <p className="text-sm font-medium mb-2">Conteúdo</p>
                                <div className="flex flex-wrap gap-2">
                                  {backup.contents.map((content, index) => (
                                    <Badge key={index} variant="outline">
                                      {content}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Exportar"
                        onClick={() => handleExportBackup(backup)}
                        disabled={backup.status !== 'success'}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Restaurar"
                        onClick={() => {
                          setSelectedBackup(backup)
                          setConfirmRestoreOpen(true)
                        }}
                        disabled={backup.status !== 'success' || backupInProgress || restoreInProgress}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir"
                        onClick={() => {
                          setBackupToDelete(backup)
                          setConfirmDeleteOpen(true)
                        }}
                        disabled={backupInProgress || restoreInProgress}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={confirmRestoreOpen} onOpenChange={setConfirmRestoreOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar este backup? Esta ação irá substituir todos os dados atuais pelos dados do backup.
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md border border-yellow-200 dark:border-yellow-800 flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Atenção</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    A restauração de um backup é uma operação irreversível. Todos os dados criados após a data deste backup serão perdidos.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-datazap-green hover:bg-datazap-green/90"
              onClick={handleRestoreBackup}
            >
              <Check className="mr-2 h-4 w-4" />
              Confirmar Restauração
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteBackup}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
