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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { MessageSquare, Save, Key } from 'lucide-react'
import { useConfig } from '@/contexts/ConfigContext'

// Schema de validação para configurações do WhatsApp
const whatsAppConfigSchema = z.object({
  apiKey: z.string().min(1, { message: 'A chave de API é obrigatória' }),
  apiUrl: z.string().url({ message: 'URL inválida' }),
  defaultPhone: z.string().regex(/^\+?[0-9]{10,15}$/, { 
    message: 'Número de telefone inválido. Use formato internacional (ex: +5511987654321)' 
  }),
  provider: z.enum(['zapi', 'twilio', 'messagebird', 'outro'], { 
    message: 'Selecione um provedor válido' 
  }),
  rateLimit: z.number().min(1).max(100),
  messageDelay: z.number().min(0).max(60),
  enableDeliveryReceipts: z.boolean().default(true),
  enableReadReceipts: z.boolean().default(true),
  enableTypingIndicator: z.boolean().default(true),
})

type WhatsAppConfigValues = z.infer<typeof whatsAppConfigSchema>

/**
 * Componente de Configurações de WhatsApp
 * 
 * Permite configurar integrações com WhatsApp e parâmetros de envio
 */
const WhatsAppConfig = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { configs, updateConfig } = useConfig()
  
  // Configuração do formulário
  const form = useForm<WhatsAppConfigValues>({
    resolver: zodResolver(whatsAppConfigSchema),
    defaultValues: {
      apiKey: '',
      apiUrl: 'https://api.whatsapp.com/v1',
      defaultPhone: '',
      provider: 'zapi',
      rateLimit: 20,
      messageDelay: 2,
      enableDeliveryReceipts: true,
      enableReadReceipts: true,
      enableTypingIndicator: true,
    }
  })
  
  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    try {
      // Primeiro tenta carregar do contexto global
      if (configs.whatsapp) {
        form.reset(configs.whatsapp)
      } else {
        // Fallback para localStorage (compatibilidade com dados existentes)
        const savedConfig = localStorage.getItem('whatsAppConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          form.reset(parsedConfig)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do WhatsApp:', error)
    }
  }, [form, configs.whatsapp])
  
  // Função para salvar configurações
  const onSubmit = async (data: WhatsAppConfigValues) => {
    setLoading(true)
    try {
      // Salvar no contexto global
      const success = await updateConfig('whatsapp', data)
      
      if (success) {
        toast({
          title: 'Configurações salvas',
          description: 'As configurações do WhatsApp foram salvas com sucesso.',
        })
      } else {
        throw new Error('Falha ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações do WhatsApp:', error)
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Credenciais de API</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provedor de WhatsApp</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um provedor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="zapi">ZAPI</SelectItem>
                        <SelectItem value="twilio">Twilio</SelectItem>
                        <SelectItem value="messagebird">MessageBird</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecione o provedor de API do WhatsApp.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave de API</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="password" 
                          placeholder="Insira sua chave de API" 
                          {...field} 
                        />
                        <Key className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Chave de autenticação para a API do WhatsApp.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="apiUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da API</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://api.exemplo.com/v1" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      URL base da API do provedor de WhatsApp.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="defaultPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Telefone Padrão</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+5511987654321" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Número padrão para envio de mensagens.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Limites e Comportamento</h3>
            
            <FormField
              control={form.control}
              name="rateLimit"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Limite de Mensagens por Minuto: {value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      value={[value]}
                      onValueChange={(vals) => onChange(vals[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription>
                    Número máximo de mensagens que podem ser enviadas por minuto.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="messageDelay"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Atraso Entre Mensagens: {value} segundos</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={60}
                      step={1}
                      value={[value]}
                      onValueChange={(vals) => onChange(vals[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription>
                    Tempo de espera entre o envio de mensagens consecutivas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recursos Adicionais</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="enableDeliveryReceipts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Confirmação de Entrega</FormLabel>
                      <FormDescription>
                        Receber confirmações quando as mensagens forem entregues.
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
                name="enableReadReceipts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Confirmação de Leitura</FormLabel>
                      <FormDescription>
                        Receber confirmações quando as mensagens forem lidas.
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
              name="enableTypingIndicator"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Indicador de Digitação</FormLabel>
                    <FormDescription>
                      Mostrar indicador "digitando..." antes de enviar mensagens.
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
                Salvar Configurações do WhatsApp
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default WhatsAppConfig
