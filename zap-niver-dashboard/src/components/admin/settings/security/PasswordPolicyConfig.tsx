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
import { Save, Key, ShieldCheck } from 'lucide-react'
import { useConfig } from '@/contexts/ConfigContext'

// Schema de validação para políticas de senha
const passwordPolicySchema = z.object({
  // Requisitos de complexidade
  minLength: z.number().min(8).max(32),
  requireUppercase: z.boolean().default(true),
  requireLowercase: z.boolean().default(true),
  requireNumbers: z.boolean().default(true),
  requireSpecialChars: z.boolean().default(true),
  
  // Políticas de expiração
  passwordExpiration: z.boolean().default(true),
  passwordExpirationDays: z.number().min(30).max(365),
  
  // Histórico de senhas
  preventPasswordReuse: z.boolean().default(true),
  passwordHistoryCount: z.number().min(3).max(24),
  
  // Bloqueio de conta
  accountLockout: z.boolean().default(true),
  maxLoginAttempts: z.number().min(3).max(10),
  lockoutDurationMinutes: z.number().min(5).max(1440),
  
  // Requisitos adicionais
  preventCommonPasswords: z.boolean().default(true),
  preventSequentialChars: z.boolean().default(true),
  preventUserInfoInPassword: z.boolean().default(true),
})

type PasswordPolicyValues = z.infer<typeof passwordPolicySchema>

/**
 * Componente de Configuração de Políticas de Senha
 * 
 * Permite configurar as políticas de segurança relacionadas a senhas
 */
export const PasswordPolicyConfig = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { configs, updateConfig } = useConfig()
  
  // Configuração do formulário
  const form = useForm<PasswordPolicyValues>({
    resolver: zodResolver(passwordPolicySchema),
    defaultValues: {
      // Requisitos de complexidade
      minLength: 10,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      
      // Políticas de expiração
      passwordExpiration: true,
      passwordExpirationDays: 90,
      
      // Histórico de senhas
      preventPasswordReuse: true,
      passwordHistoryCount: 5,
      
      // Bloqueio de conta
      accountLockout: true,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 30,
      
      // Requisitos adicionais
      preventCommonPasswords: true,
      preventSequentialChars: true,
      preventUserInfoInPassword: true,
    }
  })
  
  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    try {
      // Primeiro tenta carregar do contexto global
      if (configs.security?.passwordPolicy) {
        form.reset(configs.security.passwordPolicy)
      } else {
        // Fallback para localStorage (compatibilidade com dados existentes)
        const savedPolicy = localStorage.getItem('passwordPolicy')
        if (savedPolicy) {
          const parsedPolicy = JSON.parse(savedPolicy)
          form.reset(parsedPolicy)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar políticas de senha:', error)
    }
  }, [form, configs.security?.passwordPolicy])
  
  // Função para salvar configurações
  const onSubmit = async (data: PasswordPolicyValues) => {
    setLoading(true)
    try {
      // Obter configurações de segurança atuais ou criar um objeto vazio
      const currentSecurityConfig = configs.security || {}
      
      // Atualizar apenas a parte de políticas de senha
      const updatedSecurityConfig = {
        ...currentSecurityConfig,
        passwordPolicy: data
      }
      
      // Salvar no contexto global
      const success = await updateConfig('security', updatedSecurityConfig)
      
      if (success) {
        toast({
          title: 'Políticas de senha salvas',
          description: 'As políticas de senha foram atualizadas com sucesso.',
        })
      } else {
        throw new Error('Falha ao salvar políticas de senha')
      }
    } catch (error) {
      console.error('Erro ao salvar políticas de senha:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as políticas de senha.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Calcular a força da política de senha
  const calculatePasswordStrength = () => {
    const values = form.getValues()
    let strength = 0
    
    // Avaliar comprimento mínimo
    if (values.minLength >= 8) strength += 1
    if (values.minLength >= 10) strength += 1
    if (values.minLength >= 12) strength += 1
    if (values.minLength >= 16) strength += 1
    
    // Avaliar complexidade
    if (values.requireUppercase) strength += 1
    if (values.requireLowercase) strength += 1
    if (values.requireNumbers) strength += 1
    if (values.requireSpecialChars) strength += 1
    
    // Avaliar políticas adicionais
    if (values.preventCommonPasswords) strength += 1
    if (values.preventSequentialChars) strength += 1
    if (values.preventUserInfoInPassword) strength += 1
    
    // Avaliar expiração e histórico
    if (values.passwordExpiration) strength += 1
    if (values.preventPasswordReuse) strength += 1
    
    // Avaliar bloqueio de conta
    if (values.accountLockout) strength += 1
    
    // Retornar classificação
    if (strength >= 13) return { label: 'Muito Alta', color: 'bg-green-500' }
    if (strength >= 10) return { label: 'Alta', color: 'bg-blue-500' }
    if (strength >= 7) return { label: 'Média', color: 'bg-yellow-500' }
    if (strength >= 4) return { label: 'Baixa', color: 'bg-orange-500' }
    return { label: 'Muito Baixa', color: 'bg-red-500' }
  }
  
  const passwordStrength = calculatePasswordStrength()
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-datazap-green" />
          <h3 className="text-lg font-medium">Políticas de Senha</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm">Força da Política:</span>
          <span className={`px-2 py-1 rounded-md text-xs text-white ${passwordStrength.color}`}>
            {passwordStrength.label}
          </span>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Requisitos de Complexidade
            </h4>
            
            <FormField
              control={form.control}
              name="minLength"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Comprimento Mínimo: {value} caracteres</FormLabel>
                  <FormControl>
                    <Slider
                      min={8}
                      max={32}
                      step={1}
                      value={[value]}
                      onValueChange={(vals) => onChange(vals[0])}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription>
                    Número mínimo de caracteres exigidos para senhas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="requireUppercase"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Letras Maiúsculas</FormLabel>
                      <FormDescription>
                        Exigir pelo menos uma letra maiúscula
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
                name="requireLowercase"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Letras Minúsculas</FormLabel>
                      <FormDescription>
                        Exigir pelo menos uma letra minúscula
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
                name="requireNumbers"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Números</FormLabel>
                      <FormDescription>
                        Exigir pelo menos um número
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
                name="requireSpecialChars"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Caracteres Especiais</FormLabel>
                      <FormDescription>
                        Exigir pelo menos um caractere especial
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
            <h4 className="text-sm font-medium">Políticas de Expiração</h4>
            
            <FormField
              control={form.control}
              name="passwordExpiration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Expiração de Senha</FormLabel>
                    <FormDescription>
                      Forçar usuários a alterar suas senhas periodicamente
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
            
            {form.watch('passwordExpiration') && (
              <FormField
                control={form.control}
                name="passwordExpirationDays"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Período de Expiração: {value} dias</FormLabel>
                    <FormControl>
                      <Slider
                        min={30}
                        max={365}
                        step={30}
                        value={[value]}
                        onValueChange={(vals) => onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Número de dias até que a senha expire e precise ser alterada.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Histórico de Senhas</h4>
            
            <FormField
              control={form.control}
              name="preventPasswordReuse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Prevenir Reuso de Senhas</FormLabel>
                    <FormDescription>
                      Impedir que usuários reutilizem senhas antigas
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
            
            {form.watch('preventPasswordReuse') && (
              <FormField
                control={form.control}
                name="passwordHistoryCount"
                render={({ field: { value, onChange } }) => (
                  <FormItem>
                    <FormLabel>Histórico de Senhas: {value} senhas</FormLabel>
                    <FormControl>
                      <Slider
                        min={3}
                        max={24}
                        step={1}
                        value={[value]}
                        onValueChange={(vals) => onChange(vals[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormDescription>
                      Número de senhas antigas que não podem ser reutilizadas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Bloqueio de Conta</h4>
            
            <FormField
              control={form.control}
              name="accountLockout"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Bloqueio de Conta</FormLabel>
                    <FormDescription>
                      Bloquear conta após múltiplas tentativas de login malsucedidas
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
            
            {form.watch('accountLockout') && (
              <>
                <FormField
                  control={form.control}
                  name="maxLoginAttempts"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>Tentativas Máximas: {value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={3}
                          max={10}
                          step={1}
                          value={[value]}
                          onValueChange={(vals) => onChange(vals[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormDescription>
                        Número máximo de tentativas de login antes do bloqueio.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lockoutDurationMinutes"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>Duração do Bloqueio: {value} minutos</FormLabel>
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
                        Tempo que a conta permanecerá bloqueada após exceder o limite de tentativas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Requisitos Adicionais</h4>
            
            <div className="grid gap-4 md:grid-cols-1">
              <FormField
                control={form.control}
                name="preventCommonPasswords"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Bloquear Senhas Comuns</FormLabel>
                      <FormDescription>
                        Impedir o uso de senhas frequentemente utilizadas e conhecidas
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
                name="preventSequentialChars"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Bloquear Sequências</FormLabel>
                      <FormDescription>
                        Impedir sequências óbvias como "123456" ou "abcdef"
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
                name="preventUserInfoInPassword"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Bloquear Informações do Usuário</FormLabel>
                      <FormDescription>
                        Impedir que a senha contenha nome, email ou outras informações do usuário
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
                Salvar Políticas de Senha
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
