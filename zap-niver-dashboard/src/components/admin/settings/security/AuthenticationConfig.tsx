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
import { Save, Fingerprint, Lock, Shield } from 'lucide-react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useConfig } from '@/contexts/ConfigContext'

// Schema de validação para configurações de autenticação
const authConfigSchema = z.object({
  // Configurações de sessão
  sessionTimeout: z.number().min(5).max(1440),
  extendSessionOnActivity: z.boolean().default(true),
  enforceOneSessionPerUser: z.boolean().default(false),
  
  // Autenticação de dois fatores (2FA)
  enable2FA: z.boolean().default(false),
  require2FAForAdmins: z.boolean().default(true),
  allow2FAMethodEmail: z.boolean().default(true),
  allow2FAMethodSMS: z.boolean().default(true),
  allow2FAMethodApp: z.boolean().default(true),
  
  // Configurações de login
  captchaOnLogin: z.boolean().default(true),
  captchaThreshold: z.number().min(1).max(5),
  delayBetweenLoginAttempts: z.boolean().default(true),
  delayProgressiveMultiplier: z.number().min(1).max(10),
  
  // Configurações de IP
  allowedIPs: z.string().optional(),
  blockForeignIPs: z.boolean().default(false),
  notifyOnNewIPLogin: z.boolean().default(true),
  
  // Configurações avançadas
  jwtExpirationMinutes: z.number().min(5).max(1440),
  secureCookies: z.boolean().default(true),
  csrfProtection: z.boolean().default(true),
  httpOnlyFlags: z.boolean().default(true),
})

type AuthConfigValues = z.infer<typeof authConfigSchema>

/**
 * Componente de Configuração de Autenticação
 * 
 * Permite configurar as políticas de autenticação e segurança de sessão
 */
export const AuthenticationConfig = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { configs, updateConfig } = useConfig()
  
  // Configuração do formulário
  const form = useForm<AuthConfigValues>({
    resolver: zodResolver(authConfigSchema),
    defaultValues: {
      // Configurações de sessão
      sessionTimeout: 60,
      extendSessionOnActivity: true,
      enforceOneSessionPerUser: false,
      
      // Autenticação de dois fatores (2FA)
      enable2FA: true,
      require2FAForAdmins: true,
      allow2FAMethodEmail: true,
      allow2FAMethodSMS: true,
      allow2FAMethodApp: true,
      
      // Configurações de login
      captchaOnLogin: true,
      captchaThreshold: 3,
      delayBetweenLoginAttempts: true,
      delayProgressiveMultiplier: 2,
      
      // Configurações de IP
      allowedIPs: '',
      blockForeignIPs: false,
      notifyOnNewIPLogin: true,
      
      // Configurações avançadas
      jwtExpirationMinutes: 60,
      secureCookies: true,
      csrfProtection: true,
      httpOnlyFlags: true,
    }
  })
  
  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    try {
      // Primeiro tenta carregar do contexto global
      if (configs.security?.authentication) {
        form.reset(configs.security.authentication)
      } else {
        // Fallback para localStorage (compatibilidade com dados existentes)
        const savedConfig = localStorage.getItem('authConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          form.reset(parsedConfig)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de autenticação:', error)
    }
  }, [form, configs.security?.authentication])
  
  // Função para salvar configurações
  const onSubmit = async (data: AuthConfigValues) => {
    setLoading(true)
    try {
      // Obter configurações de segurança atuais ou criar um objeto vazio
      const currentSecurityConfig = configs.security || {}
      
      // Atualizar apenas a parte de autenticação
      const updatedSecurityConfig = {
        ...currentSecurityConfig,
        authentication: data
      }
      
      // Salvar no contexto global
      const success = await updateConfig('security', updatedSecurityConfig)
      
      if (success) {
        toast({
          title: 'Configurações salvas',
          description: 'As configurações de autenticação foram salvas com sucesso.',
        })
      } else {
        throw new Error('Falha ao salvar configurações de autenticação')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de autenticação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Calcular o nível de segurança
  const calculateSecurityLevel = () => {
    const values = form.getValues()
    let level = 0
    
    // Avaliar configurações de sessão
    if (values.sessionTimeout <= 30) level += 2
    else if (values.sessionTimeout <= 60) level += 1
    if (values.enforceOneSessionPerUser) level += 2
    
    // Avaliar 2FA
    if (values.enable2FA) level += 3
    if (values.require2FAForAdmins) level += 1
    
    // Avaliar configurações de login
    if (values.captchaOnLogin) level += 1
    if (values.delayBetweenLoginAttempts) level += 1
    
    // Avaliar configurações de IP
    if (values.blockForeignIPs) level += 2
    if (values.notifyOnNewIPLogin) level += 1
    if (values.allowedIPs && values.allowedIPs.trim().length > 0) level += 2
    
    // Avaliar configurações avançadas
    if (values.secureCookies) level += 1
    if (values.csrfProtection) level += 1
    if (values.httpOnlyFlags) level += 1
    
    // Retornar classificação
    if (level >= 15) return { label: 'Muito Alto', color: 'bg-green-500' }
    if (level >= 10) return { label: 'Alto', color: 'bg-blue-500' }
    if (level >= 7) return { label: 'Médio', color: 'bg-yellow-500' }
    if (level >= 4) return { label: 'Baixo', color: 'bg-orange-500' }
    return { label: 'Muito Baixo', color: 'bg-red-500' }
  }
  
  const securityLevel = calculateSecurityLevel()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-datazap-green" />
          <h3 className="text-lg font-medium">Configurações de Autenticação</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Nível de Segurança:</span>
          <span className={`px-2 py-1 rounded-md text-xs text-white ${securityLevel.color}`}>
            {securityLevel.label}
          </span>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Configurações de Sessão
            </h4>
            
            <FormField
              control={form.control}
              name="sessionTimeout"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Tempo Limite de Sessão: {value} minutos</FormLabel>
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
                    Tempo em minutos até que a sessão expire por inatividade.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="extendSessionOnActivity"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Estender Sessão em Atividade</FormLabel>
                      <FormDescription>
                        Renovar o tempo de sessão quando o usuário estiver ativo
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
                name="enforceOneSessionPerUser"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Uma Sessão por Usuário</FormLabel>
                      <FormDescription>
                        Encerrar sessões anteriores quando um usuário fizer login
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
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Autenticação de Dois Fatores (2FA)
            </h4>
            
            <FormField
              control={form.control}
              name="enable2FA"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Habilitar 2FA</FormLabel>
                    <FormDescription>
                      Permitir autenticação de dois fatores para contas de usuário
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
            
            {form.watch('enable2FA') && (
              <>
                <FormField
                  control={form.control}
                  name="require2FAForAdmins"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Obrigatório para Administradores</FormLabel>
                        <FormDescription>
                          Exigir 2FA para todas as contas de administrador
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
                
                <div className="space-y-2">
                  <FormLabel>Métodos de 2FA Permitidos</FormLabel>
                  <FormDescription>
                    Selecione quais métodos de autenticação de dois fatores serão permitidos
                  </FormDescription>
                  
                  <div className="grid gap-4 md:grid-cols-3 mt-2">
                    <FormField
                      control={form.control}
                      name="allow2FAMethodEmail"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <FormLabel>Email</FormLabel>
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
                      name="allow2FAMethodSMS"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <FormLabel>SMS</FormLabel>
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
                      name="allow2FAMethodApp"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <FormLabel>Aplicativo Autenticador</FormLabel>
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
              </>
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Proteção de Login</h4>
            
            <FormField
              control={form.control}
              name="captchaOnLogin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>CAPTCHA em Login</FormLabel>
                    <FormDescription>
                      Exigir verificação CAPTCHA em tentativas de login
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
            
            {form.watch('captchaOnLogin') && (
              <FormField
                control={form.control}
                name="captchaThreshold"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Limite para CAPTCHA: após {value} tentativas</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[value]}
                        onValueChange={(vals) => onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Número de tentativas de login antes de exigir CAPTCHA.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="delayBetweenLoginAttempts"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Atraso Entre Tentativas</FormLabel>
                    <FormDescription>
                      Aumentar o tempo de espera após tentativas de login malsucedidas
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
            
            {form.watch('delayBetweenLoginAttempts') && (
              <FormField
                control={form.control}
                name="delayProgressiveMultiplier"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Multiplicador de Atraso: {value}x</FormLabel>
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
                      Fator pelo qual o atraso aumenta a cada tentativa malsucedida.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Restrições de IP</h4>
            
            <FormField
              control={form.control}
              name="allowedIPs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IPs Permitidos (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 192.168.1.1, 10.0.0.0/24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Lista de IPs ou faixas CIDR permitidos, separados por vírgula. Deixe em branco para permitir todos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="blockForeignIPs"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Bloquear IPs Estrangeiros</FormLabel>
                      <FormDescription>
                        Bloquear tentativas de login de IPs fora do país
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
                name="notifyOnNewIPLogin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Notificar Novos IPs</FormLabel>
                      <FormDescription>
                        Enviar notificação quando um login ocorrer de um novo IP
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
            <h4 className="text-sm font-medium">Configurações Avançadas</h4>
            
            <FormField
              control={form.control}
              name="jwtExpirationMinutes"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Expiração de JWT: {value} minutos</FormLabel>
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
                    Tempo de expiração dos tokens JWT em minutos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="secureCookies"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Cookies Seguros</FormLabel>
                      <FormDescription>
                        Usar flag Secure em cookies
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
                name="csrfProtection"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Proteção CSRF</FormLabel>
                      <FormDescription>
                        Habilitar proteção contra CSRF
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
                name="httpOnlyFlags"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Flags HttpOnly</FormLabel>
                      <FormDescription>
                        Usar flag HttpOnly em cookies
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
                Salvar Configurações de Autenticação
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
