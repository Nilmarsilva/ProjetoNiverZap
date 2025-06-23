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
import { Save, MessageSquare, AlertTriangle } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useConfig } from '@/contexts/ConfigContext'

// Schema de validação para configurações de limites de mensagens
const messageLimitsSchema = z.object({
  // Limites por instância WhatsApp
  enableInstanceLimits: z.boolean().default(true),
  instanceDailyLimit: z.coerce.number().min(100).max(100000),
  instanceHourlyLimit: z.coerce.number().min(10).max(10000),
  
  // Limites por usuário
  enableUserLimits: z.boolean().default(true),
  userDailyLimit: z.coerce.number().min(100).max(1000000),
  userMonthlyLimit: z.coerce.number().min(1000).max(10000000),
  enableCampaignExceptions: z.boolean().default(true),  // Exceções para campanhas em massa
  
  // Limites por plano
  enablePlanLimits: z.boolean().default(true),
  freePlanLimit: z.coerce.number().min(0).max(5000),
  basicPlanLimit: z.coerce.number().min(0).max(20000),
  proPlanLimit: z.coerce.number().min(0).max(100000),
  
  // Comportamento quando limite é atingido
  limitExceededAction: z.enum(['block', 'queue', 'notify']),
  notifyAdminOnLimitExceeded: z.boolean().default(true),
  allowLimitOverride: z.boolean().default(false),
  
  // Limites de tamanho
  maxMessageLength: z.coerce.number().min(100).max(4096),
  maxAttachmentSize: z.coerce.number().min(1).max(100),
})

type MessageLimitsValues = z.infer<typeof messageLimitsSchema>

/**
 * Componente de Configuração de Limites de Mensagens
 * 
 * Permite configurar os limites de envio de mensagens do sistema
 */
export const MessageLimitsConfig = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { configs, updateConfig } = useConfig()
  
  // Configuração do formulário
  const form = useForm<MessageLimitsValues>({
    resolver: zodResolver(messageLimitsSchema),
    defaultValues: {
      // Limites por instância WhatsApp
      enableInstanceLimits: true,
      instanceDailyLimit: 10000,
      instanceHourlyLimit: 1000,
      
      // Limites por usuário
      enableUserLimits: true,
      userDailyLimit: 50000,
      userMonthlyLimit: 500000,
      enableCampaignExceptions: true,
      
      // Limites por plano
      enablePlanLimits: true,
      freePlanLimit: 1000,
      basicPlanLimit: 5000,
      proPlanLimit: 50000,
      
      // Comportamento quando limite é atingido
      limitExceededAction: 'queue',
      notifyAdminOnLimitExceeded: true,
      allowLimitOverride: true,
      
      // Limites de tamanho
      maxMessageLength: 2048,
      maxAttachmentSize: 16,
    }
  })
  
  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    try {
      // Primeiro tenta carregar do contexto global
      if (configs.limits?.messages) {
        form.reset(configs.limits.messages)
      } else {
        // Fallback para localStorage (compatibilidade com dados existentes)
        const savedConfig = localStorage.getItem('messageLimitsConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          form.reset(parsedConfig)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de limites de mensagens:', error)
    }
  }, [form, configs.limits?.messages])
  
  // Função para salvar configurações
  const onSubmit = async (data: MessageLimitsValues) => {
    setLoading(true)
    try {
      // Obter configurações de limites atuais ou criar um objeto vazio
      const currentLimitsConfig = configs.limits || {}
      
      // Atualizar apenas a parte de limites de mensagens
      const updatedLimitsConfig = {
        ...currentLimitsConfig,
        messages: data
      }
      
      // Salvar no contexto global
      const success = await updateConfig('limits', updatedLimitsConfig)
      
      if (success) {
        toast({
          title: 'Configurações salvas',
          description: 'As configurações de limites de mensagens foram salvas com sucesso.',
        })
      } else {
        throw new Error('Falha ao salvar configurações de limites de mensagens')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de limites de mensagens:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-datazap-green" />
        <h3 className="text-lg font-medium">Limites de Mensagens</h3>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Limites por Instância WhatsApp</h4>
            
            <FormField
              control={form.control}
              name="enableInstanceLimits"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Limites por Instância</FormLabel>
                    <FormDescription>
                      Ativar limites por instância do WhatsApp (cada cliente usa sua própria instância)
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
            
            {form.watch('enableInstanceLimits') && (
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="instanceDailyLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite Diário por Instância: {field.value} mensagens</FormLabel>
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
                        Número máximo de mensagens que podem ser enviadas por dia em cada instância
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="instanceHourlyLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite Horário por Instância: {field.value} mensagens</FormLabel>
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
                        Número máximo de mensagens que podem ser enviadas por hora em cada instância
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Limites por Usuário</h4>
            
            <FormField
              control={form.control}
              name="enableUserLimits"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Limites por Usuário</FormLabel>
                    <FormDescription>
                      Ativar limites de mensagens por usuário
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
            
            {form.watch('enableUserLimits') && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="userDailyLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite Diário por Usuário: {field.value.toLocaleString()}</FormLabel>
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
                          Número máximo de mensagens por usuário por dia
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="userMonthlyLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite Mensal por Usuário: {field.value.toLocaleString()}</FormLabel>
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
                          Número máximo de mensagens por usuário por mês
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="enableCampaignExceptions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-amber-50 dark:bg-amber-950">
                      <div className="space-y-0.5">
                        <FormLabel>Exceções para Campanhas em Massa</FormLabel>
                        <FormDescription>
                          Ignorar limites diários para campanhas programadas em datas comemorativas (Natal, Ano Novo, etc.)
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
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Limites por Plano</h4>
            
            <FormField
              control={form.control}
              name="enablePlanLimits"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Limites por Plano</FormLabel>
                    <FormDescription>
                      Ativar limites de mensagens baseados no plano do usuário
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
            
            {form.watch('enablePlanLimits') && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="freePlanLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano Gratuito: {field.value} mensagens/mês</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1000}
                          step={10}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormDescription>
                        Limite mensal para usuários do plano gratuito
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="basicPlanLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano Básico: {field.value} mensagens/mês</FormLabel>
                      <FormControl>
                        <Slider
                          min={100}
                          max={5000}
                          step={100}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormDescription>
                        Limite mensal para usuários do plano básico
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="proPlanLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano Pro: {field.value} mensagens/mês</FormLabel>
                      <FormControl>
                        <Slider
                          min={1000}
                          max={20000}
                          step={1000}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormDescription>
                        Limite mensal para usuários do plano profissional
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Comportamento ao Atingir Limite</h4>
            
            <FormField
              control={form.control}
              name="limitExceededAction"
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
                      <SelectItem value="block">Bloquear envio</SelectItem>
                      <SelectItem value="queue">Enfileirar para envio posterior</SelectItem>
                      <SelectItem value="notify">Apenas notificar usuário</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    O que acontece quando um usuário atinge seu limite de mensagens
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="notifyAdminOnLimitExceeded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Notificar Administrador</FormLabel>
                      <FormDescription>
                        Enviar notificação ao administrador quando limites forem excedidos
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
                name="allowLimitOverride"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Permitir Sobrescrever Limites</FormLabel>
                      <FormDescription>
                        Permitir que administradores sobrescrevam limites para usuários específicos
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
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Limites de Tamanho</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="maxMessageLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho Máximo de Mensagem: {field.value} caracteres</FormLabel>
                    <FormControl>
                      <Slider
                        min={100}
                        max={4096}
                        step={100}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Número máximo de caracteres permitidos em uma mensagem
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxAttachmentSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho Máximo de Anexo: {field.value} MB</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Tamanho máximo de anexos em megabytes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="p-4 border rounded-md bg-amber-50 dark:bg-amber-950">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <p className="font-medium mb-1">Atenção</p>
                <p>Alterar os limites de mensagens pode afetar a experiência dos usuários e os custos operacionais. Recomendamos monitorar o uso após fazer alterações.</p>
              </div>
            </div>
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
