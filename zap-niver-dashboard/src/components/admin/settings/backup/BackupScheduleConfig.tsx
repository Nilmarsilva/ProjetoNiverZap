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
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Save, Clock, Calendar } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useConfig } from '@/contexts/ConfigContext'

// Schema de validação para configurações de agendamento de backup
const backupScheduleSchema = z.object({
  // Configurações de backup automático
  enableAutoBackup: z.boolean().default(true),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly'], {
    message: 'Selecione uma frequência válida'
  }),
  backupTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido. Use HH:MM (ex: 03:30)'
  }),
  backupDay: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], {
    message: 'Selecione um dia da semana válido'
  }).optional(),
  backupDate: z.coerce.number().min(1).max(28).optional(),
  
  // Configurações de retenção
  retentionPolicy: z.enum(['keep-all', 'keep-last-n', 'keep-days'], {
    message: 'Selecione uma política de retenção válida'
  }),
  retentionCount: z.coerce.number().min(1).max(100).optional(),
  retentionDays: z.coerce.number().min(1).max(365).optional(),
  
  // Notificações
  notifyOnSuccess: z.boolean().default(true),
  notifyOnFailure: z.boolean().default(true),
  notifyAdminEmail: z.string().email({ message: 'Email inválido' }).or(z.string().length(0)),
})

type BackupScheduleValues = z.infer<typeof backupScheduleSchema>

/**
 * Componente de Configuração de Agendamento de Backup
 * 
 * Permite configurar a frequência e retenção de backups automáticos
 */
export const BackupScheduleConfig = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { configs, updateConfig } = useConfig()
  
  // Configuração do formulário
  const form = useForm<BackupScheduleValues>({
    resolver: zodResolver(backupScheduleSchema),
    defaultValues: {
      // Configurações de backup automático
      enableAutoBackup: true,
      backupFrequency: 'daily',
      backupTime: '03:00',
      backupDay: 'sunday',
      backupDate: 1,
      
      // Configurações de retenção
      retentionPolicy: 'keep-last-n',
      retentionCount: 7,
      retentionDays: 30,
      
      // Notificações
      notifyOnSuccess: true,
      notifyOnFailure: true,
      notifyAdminEmail: '',
    }
  })
  
  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    try {
      // Primeiro tenta carregar do contexto global
      if (configs.backup?.schedule) {
        form.reset(configs.backup.schedule)
      } else {
        // Fallback para localStorage (compatibilidade com dados existentes)
        const savedConfig = localStorage.getItem('backupScheduleConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          form.reset(parsedConfig)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de agendamento de backup:', error)
    }
  }, [form, configs.backup?.schedule])
  
  // Função para salvar configurações
  const onSubmit = async (data: BackupScheduleValues) => {
    setLoading(true)
    try {
      // Obter configurações de backup atuais ou criar um objeto vazio
      const currentBackupConfig = configs.backup || {}
      
      // Atualizar apenas a parte de agendamento de backup
      const updatedBackupConfig = {
        ...currentBackupConfig,
        schedule: data
      }
      
      // Salvar no contexto global
      const success = await updateConfig('backup', updatedBackupConfig)
      
      if (success) {
        toast({
          title: 'Configurações salvas',
          description: 'As configurações de agendamento de backup foram salvas com sucesso.',
        })
      } else {
        throw new Error('Falha ao salvar configurações de agendamento de backup')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de agendamento de backup:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const daysOfWeek = [
    { id: 'monday', label: 'Segunda-feira' },
    { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' },
    { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' },
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-datazap-green" />
        <h3 className="text-lg font-medium">Agendamento de Backup</h3>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="enableAutoBackup"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Backup Automático</FormLabel>
                    <FormDescription>
                      Realizar backups automáticos do sistema
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
            
            {form.watch('enableAutoBackup') && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="backupFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a frequência" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Com que frequência o backup automático deve ser executado
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="backupTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>
                          Horário para execução do backup (recomendado: fora do horário comercial)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {form.watch('backupFrequency') === 'weekly' && (
                  <FormField
                    control={form.control}
                    name="backupDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia da Semana</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o dia da semana" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day.id} value={day.id}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Em qual dia da semana o backup deve ser executado
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {form.watch('backupFrequency') === 'monthly' && (
                  <FormField
                    control={form.control}
                    name="backupDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do Mês</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o dia do mês" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Em qual dia do mês o backup deve ser executado
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Política de Retenção
            </h4>
            
            <FormField
              control={form.control}
              name="retentionPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Política de Retenção</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a política de retenção" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="keep-all">Manter todos os backups</SelectItem>
                      <SelectItem value="keep-last-n">Manter apenas os N últimos backups</SelectItem>
                      <SelectItem value="keep-days">Manter backups por X dias</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Como os backups antigos devem ser gerenciados
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {form.watch('retentionPolicy') === 'keep-last-n' && (
              <FormField
                control={form.control}
                name="retentionCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Backups</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={100} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Quantos backups mais recentes devem ser mantidos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {form.watch('retentionPolicy') === 'keep-days' && (
              <FormField
                control={form.control}
                name="retentionDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dias de Retenção</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        max={365} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Por quantos dias os backups devem ser mantidos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notificações</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="notifyOnSuccess"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Notificar Sucesso</FormLabel>
                      <FormDescription>
                        Enviar notificação quando um backup for concluído com sucesso
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
                name="notifyOnFailure"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Notificar Falha</FormLabel>
                      <FormDescription>
                        Enviar notificação quando um backup falhar
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
            
            <FormField
              control={form.control}
              name="notifyAdminEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email para Notificações</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="admin@exemplo.com" 
                      type="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Email para receber notificações sobre backups (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
        </form>
      </Form>
    </div>
  )
}
