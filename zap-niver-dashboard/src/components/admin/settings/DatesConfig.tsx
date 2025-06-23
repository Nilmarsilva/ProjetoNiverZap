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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Calendar, Save, Plus, Trash } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { HolidayManager } from './dates/HolidayManager'
import { useConfig } from '@/contexts/ConfigContext'

// Schema de validação para configurações de datas
const datesConfigSchema = z.object({
  // Configurações gerais
  enableBirthdays: z.boolean().default(true),
  enableHolidays: z.boolean().default(true),
  enableCustomDates: z.boolean().default(true),
  
  // Configurações de aniversários
  sendBirthdayMessageAtMidnight: z.boolean().default(false),
  birthdayMessageTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de hora inválido. Use HH:MM (ex: 08:00)'
  }),
  sendAdvanceBirthdayReminder: z.boolean().default(false),
  birthdayReminderDaysBefore: z.number().min(1).max(30),
  
  // Configurações de datas móveis
  calculateMovingHolidays: z.boolean().default(true),
  prioritizeEventTypes: z.boolean().default(true),
})

type DatesConfigValues = z.infer<typeof datesConfigSchema>

// Tipos de eventos disponíveis no sistema
const eventTypes = [
  { id: 'aniversario', name: 'Aniversário', default: true, color: 'bg-blue-500' },
  { id: 'dia-das-maes', name: 'Dia das Mães', default: true, color: 'bg-pink-500' },
  { id: 'dia-dos-pais', name: 'Dia dos Pais', default: true, color: 'bg-indigo-500' },
  { id: 'pascoa', name: 'Páscoa', default: true, color: 'bg-yellow-500' },
  { id: 'natal', name: 'Natal', default: true, color: 'bg-red-500' },
  { id: 'ano-novo', name: 'Ano Novo', default: true, color: 'bg-green-500' },
  { id: 'outro', name: 'Outro', default: true, color: 'bg-gray-500' }
]

/**
 * Componente de Configurações de Datas Comemorativas
 * 
 * Permite configurar como as datas comemorativas são tratadas no sistema
 */
const DatesConfig = () => {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const { toast } = useToast()
  const { configs, updateConfig } = useConfig()
  
  // Configuração do formulário
  const form = useForm<DatesConfigValues>({
    resolver: zodResolver(datesConfigSchema),
    defaultValues: {
      // Configurações gerais
      enableBirthdays: true,
      enableHolidays: true,
      enableCustomDates: true,
      
      // Configurações de aniversários
      sendBirthdayMessageAtMidnight: false,
      birthdayMessageTime: '09:00',
      sendAdvanceBirthdayReminder: false,
      birthdayReminderDaysBefore: 3,
      
      // Configurações de datas móveis
      calculateMovingHolidays: true,
      prioritizeEventTypes: true,
    }
  })
  
  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    try {
      // Primeiro tenta carregar do contexto global
      if (configs.dates) {
        form.reset(configs.dates)
      } else {
        // Fallback para localStorage (compatibilidade com dados existentes)
        const savedConfig = localStorage.getItem('datesConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          form.reset(parsedConfig)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de datas:', error)
    }
  }, [form, configs.dates])
  
  // Função para salvar configurações
  const onSubmit = async (data: DatesConfigValues) => {
    setLoading(true)
    try {
      // Salvar no contexto global
      const success = await updateConfig('dates', data)
      
      if (success) {
        toast({
          title: 'Configurações salvas',
          description: 'As configurações de datas foram salvas com sucesso.',
        })
      } else {
        throw new Error('Falha ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de datas:', error)
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="general">Configurações Gerais</TabsTrigger>
          <TabsTrigger value="holidays">Feriados e Datas Especiais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tipos de Datas</h3>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="enableBirthdays"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Aniversários</FormLabel>
                          <FormDescription>
                            Ativar mensagens de aniversário
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
                    name="enableHolidays"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Feriados</FormLabel>
                          <FormDescription>
                            Ativar mensagens em feriados
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
                    name="enableCustomDates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Datas Personalizadas</FormLabel>
                          <FormDescription>
                            Ativar datas personalizadas
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
                <h3 className="text-lg font-medium">Configurações de Aniversários</h3>
                
                <FormField
                  control={form.control}
                  name="sendBirthdayMessageAtMidnight"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Enviar à Meia-noite</FormLabel>
                        <FormDescription>
                          Enviar mensagens de aniversário à meia-noite
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
                
                {!form.watch('sendBirthdayMessageAtMidnight') && (
                  <FormField
                    control={form.control}
                    name="birthdayMessageTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de Envio</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>
                          Horário para envio de mensagens de aniversário
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="sendAdvanceBirthdayReminder"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Lembrete Antecipado</FormLabel>
                        <FormDescription>
                          Enviar lembrete antes da data de aniversário
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
                
                {form.watch('sendAdvanceBirthdayReminder') && (
                  <FormField
                    control={form.control}
                    name="birthdayReminderDaysBefore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dias de Antecedência</FormLabel>
                        <FormControl>
                          <Select 
                            value={field.value.toString()} 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione os dias" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 5, 7, 10, 15, 30].map((days) => (
                                <SelectItem key={days} value={days.toString()}>
                                  {days} {days === 1 ? 'dia' : 'dias'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Quantos dias antes enviar o lembrete
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Configurações Avançadas</h3>
                
                <FormField
                  control={form.control}
                  name="calculateMovingHolidays"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Calcular Datas Móveis</FormLabel>
                        <FormDescription>
                          Calcular automaticamente datas móveis como Páscoa
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
                  name="prioritizeEventTypes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Priorizar Tipos de Eventos</FormLabel>
                        <FormDescription>
                          Quando múltiplos eventos ocorrem no mesmo dia, priorizar por tipo
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
                <h3 className="text-lg font-medium">Tipos de Eventos Disponíveis</h3>
                
                <div className="flex flex-wrap gap-2">
                  {eventTypes.map((type) => (
                    <Badge 
                      key={type.id} 
                      className={`${type.color} hover:${type.color}/80`}
                    >
                      {type.name}
                    </Badge>
                  ))}
                </div>
                <FormDescription>
                  Estes são os tipos de eventos configurados no sistema. Para gerenciar templates para cada tipo, use a aba "Templates" na página de administração.
                </FormDescription>
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
        </TabsContent>
        
        <TabsContent value="holidays" className="space-y-6">
          <HolidayManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DatesConfig
