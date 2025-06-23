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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Save, 
  Bell, 
  Clock, 
  AlertTriangle, 
  Mail, 
  MessageSquare, 
  Calendar 
} from 'lucide-react'
import { useConfig } from '@/contexts/ConfigContext'

// Schema de validação para configurações de notificações
const notificationsConfigSchema = z.object({
  // Horários de envio
  allowedTimeStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido. Use HH:MM (ex: 08:00)'
  }),
  allowedTimeEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido. Use HH:MM (ex: 18:00)'
  }),
  allowedDays: z.array(z.string()).min(1, {
    message: 'Selecione pelo menos um dia da semana'
  }),
  respectTimezone: z.boolean().default(true),
  
  // Notificações para administradores
  adminNotifyNewUsers: z.boolean().default(true),
  adminNotifyFailedMessages: z.boolean().default(true),
  adminNotifySystemErrors: z.boolean().default(true),
  adminNotificationChannels: z.array(z.enum(['email', 'whatsapp', 'system'])).min(1, {
    message: 'Selecione pelo menos um canal de notificação'
  }),
  adminEmail: z.string().email({ message: 'Email inválido' }).or(z.string().length(0)),
  adminPhone: z.string().regex(/^\+?[0-9]{10,15}$/, { 
    message: 'Número de telefone inválido. Use formato internacional (ex: +5511987654321)' 
  }).or(z.string().length(0)),
  
  // Políticas de reenvio
  enableAutoRetry: z.boolean().default(true),
  maxRetryAttempts: z.number().min(1).max(10),
  retryIntervalMinutes: z.number().min(5).max(1440),
  notifyUserOnRetry: z.boolean().default(true),
  
  // Notificações de eventos
  notifyUpcomingEvents: z.boolean().default(true),
  upcomingEventsDaysAhead: z.number().min(1).max(30),
  eventReminderTemplate: z.string().min(10, {
    message: 'O template deve ter pelo menos 10 caracteres'
  }),
  
  // Configurações avançadas
  batchNotifications: z.boolean().default(true),
  maxDailyNotifications: z.number().min(1),
  prioritizeByEventType: z.boolean().default(true),
})

type NotificationsConfigValues = z.infer<typeof notificationsConfigSchema>

/**
 * Componente de Configurações de Notificações
 * 
 * Permite configurar como e quando as notificações são enviadas
 */
const NotificationsConfig = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { configs, updateConfig } = useConfig()
  
  // Configuração do formulário
  const form = useForm<NotificationsConfigValues>({
    resolver: zodResolver(notificationsConfigSchema),
    defaultValues: {
      // Horários de envio
      allowedTimeStart: '08:00',
      allowedTimeEnd: '20:00',
      allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      respectTimezone: true,
      
      // Notificações para administradores
      adminNotifyNewUsers: true,
      adminNotifyFailedMessages: true,
      adminNotifySystemErrors: true,
      adminNotificationChannels: ['email', 'system'],
      adminEmail: '',
      adminPhone: '',
      
      // Políticas de reenvio
      enableAutoRetry: true,
      maxRetryAttempts: 3,
      retryIntervalMinutes: 60,
      notifyUserOnRetry: true,
      
      // Notificações de eventos
      notifyUpcomingEvents: true,
      upcomingEventsDaysAhead: 7,
      eventReminderTemplate: 'Olá {nome}, lembrete: você tem um evento ({evento}) chegando em {dias} dias!',
      
      // Configurações avançadas
      batchNotifications: true,
      maxDailyNotifications: 100,
      prioritizeByEventType: true,
    }
  })
  
  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    try {
      // Primeiro tenta carregar do contexto global
      if (configs.notifications) {
        form.reset(configs.notifications)
      } else {
        // Fallback para localStorage (compatibilidade com dados existentes)
        const savedConfig = localStorage.getItem('notificationsConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          form.reset(parsedConfig)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de notificações:', error)
    }
  }, [form, configs.notifications])
  
  // Função para salvar configurações
  const onSubmit = async (data: NotificationsConfigValues) => {
    setLoading(true)
    try {
      // Salvar no contexto global
      const success = await updateConfig('notifications', data)
      
      if (success) {
        toast({
          title: 'Configurações salvas',
          description: 'As configurações de notificações foram salvas com sucesso.',
        })
      } else {
        throw new Error('Falha ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de notificações:', error)
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
  
  const notificationChannels = [
    { id: 'email', label: 'Email' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'system', label: 'Sistema (in-app)' },
  ]
  
  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Clock className="h-5 w-5 text-datazap-green" />
              Horários de Envio
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="allowedTimeStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Horário a partir do qual as mensagens podem ser enviadas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allowedTimeEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário de Término</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormDescription>
                      Horário até o qual as mensagens podem ser enviadas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="allowedDays"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Dias da Semana Permitidos</FormLabel>
                    <FormDescription>
                      Selecione os dias em que as mensagens podem ser enviadas.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {daysOfWeek.map((day) => (
                      <FormField
                        key={day.id}
                        control={form.control}
                        name="allowedDays"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, day.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {day.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="respectTimezone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Respeitar Fuso Horário</FormLabel>
                    <FormDescription>
                      Ajustar horários de envio de acordo com o fuso horário do destinatário.
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
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Bell className="h-5 w-5 text-datazap-green" />
              Notificações para Administradores
            </h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="adminNotifyNewUsers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Novos Usuários</FormLabel>
                      <FormDescription>
                        Notificar quando novos usuários se registrarem.
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
                name="adminNotifyFailedMessages"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Falhas de Envio</FormLabel>
                      <FormDescription>
                        Notificar quando mensagens falharem ao enviar.
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
                name="adminNotifySystemErrors"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Erros do Sistema</FormLabel>
                      <FormDescription>
                        Notificar sobre erros críticos do sistema.
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
              name="adminNotificationChannels"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Canais de Notificação</FormLabel>
                    <FormDescription>
                      Selecione os canais para receber notificações administrativas.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {notificationChannels.map((channel) => (
                      <FormField
                        key={channel.id}
                        control={form.control}
                        name="adminNotificationChannels"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={channel.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(channel.id as any)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, channel.id as any])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== channel.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {channel.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="adminEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Administrador</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="admin@exemplo.com" 
                        type="email"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Email para receber notificações administrativas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="adminPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone do Administrador</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+5511987654321" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Telefone para receber notificações via WhatsApp.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-datazap-green" />
              Políticas de Reenvio
            </h3>
            
            <FormField
              control={form.control}
              name="enableAutoRetry"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Reenvio Automático</FormLabel>
                    <FormDescription>
                      Tentar reenviar mensagens que falharam automaticamente.
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
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="maxRetryAttempts"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Número Máximo de Tentativas: {value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[value]}
                        onValueChange={(vals) => onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Quantas vezes o sistema tentará reenviar mensagens que falharam.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="retryIntervalMinutes"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Intervalo Entre Tentativas: {value} minutos</FormLabel>
                    <FormControl>
                      <Slider
                        min={5}
                        max={1440}
                        step={5}
                        value={[value]}
                        onValueChange={(vals) => onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Tempo de espera entre tentativas de reenvio.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notifyUserOnRetry"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Notificar Usuário sobre Reenvios</FormLabel>
                    <FormDescription>
                      Enviar notificações ao usuário sobre tentativas de reenvio.
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
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-datazap-green" />
              Notificações de Eventos
            </h3>
            
            <FormField
              control={form.control}
              name="notifyUpcomingEvents"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Notificar Eventos Próximos</FormLabel>
                    <FormDescription>
                      Enviar lembretes para eventos que estão se aproximando.
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
              name="upcomingEventsDaysAhead"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Dias de Antecedência: {value} dias</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={30}
                      step={1}
                      value={[value]}
                      onValueChange={(vals) => onChange(vals[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription>
                    Com quantos dias de antecedência enviar lembretes de eventos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="eventReminderTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template de Lembrete</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite o template de mensagem para lembretes..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Use {'{nome}'} para o nome do contato, {'{evento}'} para o tipo de evento, e {'{dias}'} para os dias restantes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-datazap-green" />
              Configurações Avançadas
            </h3>
            
            <FormField
              control={form.control}
              name="batchNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Agrupar Notificações</FormLabel>
                    <FormDescription>
                      Combinar múltiplas notificações em um único envio.
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
              name="maxDailyNotifications"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Limite Diário de Notificações: {value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={500}
                      step={10}
                      value={[value]}
                      onValueChange={(vals) => onChange(vals[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription>
                    Número máximo de notificações que podem ser enviadas por dia.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="prioritizeByEventType"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Priorizar por Tipo de Evento</FormLabel>
                    <FormDescription>
                      Dar prioridade a certos tipos de eventos (ex: aniversários) sobre outros.
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
                Salvar Configurações de Notificações
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default NotificationsConfig
