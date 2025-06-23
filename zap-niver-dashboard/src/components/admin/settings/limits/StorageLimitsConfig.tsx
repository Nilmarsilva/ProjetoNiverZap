import { useState, useEffect } from 'react'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Save, HardDrive, AlertTriangle } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useConfig } from '@/contexts/ConfigContext'

// Schema de validação para configurações de limites de armazenamento
const storageLimitsSchema = z.object({
  // Limites por plano
  freePlanStorage: z.coerce.number().min(100).max(10000),
  basicPlanStorage: z.coerce.number().min(1000).max(100000),
  proPlanStorage: z.coerce.number().min(10000).max(1000000),
  
  // Limites por tipo de arquivo
  maxMediaSize: z.coerce.number().min(5).max(500),
  maxDocumentSize: z.coerce.number().min(5).max(500),
  
  // Comportamento quando limite é atingido
  storageExceededAction: z.enum(['block', 'delete-oldest', 'notify']),
  notifyOnStorageWarning: z.boolean().default(true),
  warningThresholdPercent: z.coerce.number().min(50).max(95),
  
  // Limpeza automática
  enableAutoCleanup: z.boolean().default(false),
  cleanupOlderThan: z.coerce.number().min(30).max(730),  // Até 2 anos
  excludeImportantFiles: z.boolean().default(true),
  
  // Armazenamento externo
  enableExternalStorage: z.boolean().default(false),
  externalStorageType: z.enum(['s3', 'google-drive', 'dropbox', 'custom']),
})

type StorageLimitsValues = z.infer<typeof storageLimitsSchema>

/**
 * Componente de Configuração de Limites de Armazenamento
 * 
 * Permite configurar os limites de armazenamento do sistema
 */
export const StorageLimitsConfig = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { configs, updateConfig } = useConfig()
  
  // Simulação de uso de armazenamento
  const [storageUsage, setStorageUsage] = useState({
    used: 2560, // MB
    total: 10000, // MB
    percentUsed: 25.6
  })
  
  // Configuração do formulário
  const form = useForm<StorageLimitsValues>({
    resolver: zodResolver(storageLimitsSchema),
    defaultValues: {
      // Limites por plano
      freePlanStorage: 1000,
      basicPlanStorage: 10000,
      proPlanStorage: 100000,
      
      // Limites por tipo de arquivo
      maxMediaSize: 50,
      maxDocumentSize: 100,
      
      // Comportamento quando limite é atingido
      storageExceededAction: 'notify',
      notifyOnStorageWarning: true,
      warningThresholdPercent: 80,
      
      // Limpeza automática
      enableAutoCleanup: false,
      cleanupOlderThan: 180,
      excludeImportantFiles: true,
      
      // Armazenamento externo
      enableExternalStorage: false,
      externalStorageType: 's3',
    }
  })
  
  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    try {
      // Primeiro tenta carregar do contexto global
      if (configs.limits?.storage) {
        form.reset(configs.limits.storage)
      } else {
        // Fallback para localStorage (compatibilidade com dados existentes)
        const savedConfig = localStorage.getItem('storageLimitsConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          form.reset(parsedConfig)
        }
      }
      
      // Simular obtenção de dados de uso de armazenamento
      // Em produção, isso viria de uma API
      const mockStorageData = {
        used: 2560, // MB
        total: 10000, // MB
        percentUsed: 25.6
      }
      setStorageUsage(mockStorageData)
    } catch (error) {
      console.error('Erro ao carregar configurações de limites de armazenamento:', error)
    }
  }, [form, configs.limits?.storage])
  
  // Função para salvar configurações
  const onSubmit = async (data: StorageLimitsValues) => {
    setLoading(true)
    try {
      // Obter configurações de limites atuais ou criar um objeto vazio
      const currentLimitsConfig = configs.limits || {}
      
      // Atualizar apenas a parte de limites de armazenamento
      const updatedLimitsConfig = {
        ...currentLimitsConfig,
        storage: data
      }
      
      // Salvar no contexto global
      const success = await updateConfig('limits', updatedLimitsConfig)
      
      if (success) {
        toast({
          title: 'Configurações salvas',
          description: 'As configurações de limites de armazenamento foram salvas com sucesso.',
        })
      } else {
        throw new Error('Falha ao salvar configurações de limites de armazenamento')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de limites de armazenamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Função para formatar tamanho em GB
  const formatGB = (mb: number) => {
    if (mb >= 1000) {
      return `${(mb / 1000).toFixed(1)} GB`
    }
    return `${mb} MB`
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <HardDrive className="h-5 w-5 text-datazap-green" />
        <h3 className="text-lg font-medium">Limites de Armazenamento</h3>
      </div>
      
      <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
        <h4 className="text-sm font-medium mb-2">Uso de Armazenamento Atual</h4>
        <div className="space-y-2">
          <Progress value={storageUsage.percentUsed} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatGB(storageUsage.used)} usado</span>
            <span>{storageUsage.percentUsed.toFixed(1)}%</span>
            <span>{formatGB(storageUsage.total)} total</span>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Limites por Plano</h4>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="freePlanStorage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano Gratuito: {formatGB(field.value)}</FormLabel>
                    <FormControl>
                      <Slider
                        min={100}
                        max={10000}
                        step={100}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Limite de armazenamento para usuários do plano gratuito
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="basicPlanStorage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano Básico: {formatGB(field.value)}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1000}
                        max={100000}
                        step={1000}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Limite de armazenamento para usuários do plano básico
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="proPlanStorage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plano Pro: {formatGB(field.value)}</FormLabel>
                    <FormControl>
                      <Slider
                        min={10000}
                        max={1000000}
                        step={10000}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Limite de armazenamento para usuários do plano profissional
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Limites por Tipo de Arquivo</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="maxMediaSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho Máximo de Mídia: {field.value} MB</FormLabel>
                    <FormControl>
                      <Slider
                        min={5}
                        max={500}
                        step={5}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Tamanho máximo para arquivos de mídia (imagens, áudio, vídeo)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxDocumentSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho Máximo de Documento: {field.value} MB</FormLabel>
                    <FormControl>
                      <Slider
                        min={5}
                        max={500}
                        step={5}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Tamanho máximo para documentos (PDF, DOC, XLS, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Comportamento ao Atingir Limite</h4>
            
            <FormField
              control={form.control}
              name="storageExceededAction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ação ao Exceder Limite</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma ação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="block">Bloquear novos uploads</SelectItem>
                      <SelectItem value="delete-oldest">Excluir arquivos mais antigos</SelectItem>
                      <SelectItem value="notify">Apenas notificar usuário</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    O que acontece quando um usuário atinge seu limite de armazenamento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="notifyOnStorageWarning"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Notificar Sobre Alerta</FormLabel>
                      <FormDescription>
                        Enviar notificação ao usuário quando se aproximar do limite
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="warningThresholdPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite para Alerta: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={50}
                        max={95}
                        step={5}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Percentual de uso para começar a alertar o usuário
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Limpeza Automática</h4>
            
            <FormField
              control={form.control}
              name="enableAutoCleanup"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Limpeza Automática</FormLabel>
                    <FormDescription>
                      Remover automaticamente arquivos antigos para liberar espaço
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {form.watch('enableAutoCleanup') && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cleanupOlderThan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remover Arquivos Mais Antigos que: {field.value} dias</FormLabel>
                      <FormControl>
                        <Slider
                          min={30}
                          max={730}
                          step={30}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormDescription>
                        Arquivos mais antigos que este período serão removidos automaticamente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="excludeImportantFiles"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Excluir Arquivos Importantes</FormLabel>
                        <FormDescription>
                          Não remover arquivos marcados como importantes durante a limpeza
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          
          <div className="p-4 border rounded-md bg-amber-50 dark:bg-amber-950">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <p className="font-medium mb-1">Atenção</p>
                <p>A limpeza automática de arquivos é irreversível. Certifique-se de que os usuários estejam cientes dessa política e façam backup de arquivos importantes.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Armazenamento Externo</h4>
              
              <FormField
                control={form.control}
                name="enableExternalStorage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Ativar Armazenamento Externo</FormLabel>
                      <FormDescription>
                        Armazenar arquivos em serviços de armazenamento em nuvem externos
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch('enableExternalStorage') && (
                <FormField
                  control={form.control}
                  name="externalStorageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Armazenamento Externo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um serviço" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="s3">Amazon S3</SelectItem>
                          <SelectItem value="google-drive">Google Drive</SelectItem>
                          <SelectItem value="dropbox">Dropbox</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Serviço de armazenamento em nuvem para armazenar arquivos
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <Button 
              type="submit" 
              className="bg-datazap-green hover:bg-datazap-green/90 gap-2"
              disabled={loading}
            >
              {loading ? (
                <>Salvando...</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
