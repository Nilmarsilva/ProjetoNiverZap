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
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Save, Upload, Palette, LayoutGrid } from 'lucide-react'
import { useConfig } from '@/contexts/ConfigContext'

// Schema de validação para configurações de interface
const interfaceConfigSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], { 
    message: 'Selecione um tema válido' 
  }),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Cor inválida. Use formato hexadecimal (ex: #00AB55)'
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: 'Cor inválida. Use formato hexadecimal (ex: #00AB55)'
  }),
  logoUrl: z.string().url({ message: 'URL inválida' }).or(z.string().length(0)),
  companyName: z.string().min(1, { message: 'Nome da empresa é obrigatório' }),
  welcomeMessage: z.string().max(500, { message: 'Mensagem muito longa' }),
  dashboardLayout: z.enum(['compact', 'comfortable', 'spacious'], { 
    message: 'Selecione um layout válido' 
  }),
  showHelpTips: z.boolean().default(true),
  enableAnimations: z.boolean().default(true),
  showNotifications: z.boolean().default(true),
})

type InterfaceConfigValues = z.infer<typeof interfaceConfigSchema>

/**
 * Componente de Configurações de Interface
 * 
 * Permite personalizar a aparência e o comportamento da interface
 */
const InterfaceConfig = () => {
  const [loading, setLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const { toast } = useToast()
  const { configs, updateConfig } = useConfig()
  
  // Configuração do formulário
  const form = useForm<InterfaceConfigValues>({
    resolver: zodResolver(interfaceConfigSchema),
    defaultValues: {
      theme: 'light',
      primaryColor: '#00AB55',
      secondaryColor: '#2D6CDF',
      logoUrl: '',
      companyName: 'DataZAP',
      welcomeMessage: 'Bem-vindo ao DataZAP, sua plataforma de gerenciamento de contatos e envio de mensagens.',
      dashboardLayout: 'comfortable',
      showHelpTips: true,
      enableAnimations: true,
      showNotifications: true,
    }
  })
  
  // Carregar configurações salvas ao iniciar
  useEffect(() => {
    try {
      // Primeiro tenta carregar do contexto global
      if (configs.interface) {
        form.reset(configs.interface)
        
        if (configs.interface.logoUrl) {
          setLogoPreview(configs.interface.logoUrl)
        }
      } else {
        // Fallback para localStorage (compatibilidade com dados existentes)
        const savedConfig = localStorage.getItem('interfaceConfig')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          form.reset(parsedConfig)
          
          if (parsedConfig.logoUrl) {
            setLogoPreview(parsedConfig.logoUrl)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de interface:', error)
    }
  }, [form, configs.interface])
  
  // Atualizar preview do logo quando a URL mudar
  useEffect(() => {
    const logoUrl = form.watch('logoUrl')
    if (logoUrl) {
      setLogoPreview(logoUrl)
    } else {
      setLogoPreview(null)
    }
  }, [form.watch('logoUrl')])
  
  // Função para salvar configurações
  const onSubmit = async (data: InterfaceConfigValues) => {
    setLoading(true)
    try {
      // Salvar no contexto global
      const success = await updateConfig('interface', data)
      
      if (success) {
        // Aplicar algumas configurações imediatamente
        document.documentElement.classList.toggle('dark', data.theme === 'dark')
        
        toast({
          title: 'Configurações salvas',
          description: 'As configurações de interface foram salvas com sucesso.',
        })
      } else {
        throw new Error('Falha ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de interface:', error)
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
            <h3 className="text-lg font-medium">Tema e Cores</h3>
            
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema do Sistema</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="light" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Claro
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="dark" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Escuro
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="system" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Sistema
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Escolha o tema de cores para a interface.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Primária</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <div 
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                    <FormDescription>
                      Cor principal do sistema (botões, links, etc).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor Secundária</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <div 
                        className="w-10 h-10 rounded border"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                    <FormDescription>
                      Cor secundária do sistema (destaques, badges, etc).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Marca e Identidade</h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Sua Empresa" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome que aparecerá no cabeçalho e rodapé.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logotipo</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="https://exemplo.com/logo.png" 
                          {...field} 
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            // Em uma implementação real, abriria um seletor de arquivos
                            // e faria upload do logo para um servidor
                            toast({
                              title: "Upload de logo",
                              description: "Funcionalidade de upload será implementada em breve."
                            })
                          }}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      URL da imagem do logotipo da empresa.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {logoPreview && (
              <div className="mt-2 p-4 border rounded-md">
                <p className="text-sm font-medium mb-2">Preview do Logotipo:</p>
                <div className="flex justify-center bg-gray-100 dark:bg-gray-800 p-4 rounded">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="max-h-16 object-contain"
                    onError={() => {
                      setLogoPreview(null)
                      toast({
                        title: "Erro ao carregar imagem",
                        description: "Não foi possível carregar a imagem do logotipo.",
                        variant: "destructive"
                      })
                    }}
                  />
                </div>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="welcomeMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem de Boas-vindas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite a mensagem de boas-vindas..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Mensagem exibida na tela de login e dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Layout e Comportamento</h3>
            
            <FormField
              control={form.control}
              name="dashboardLayout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Layout do Dashboard</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um layout" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="compact">Compacto</SelectItem>
                      <SelectItem value="comfortable">Confortável</SelectItem>
                      <SelectItem value="spacious">Espaçoso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Densidade de informações e espaçamento no dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="showHelpTips"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Dicas de Ajuda</FormLabel>
                      <FormDescription>
                        Mostrar dicas e tooltips de ajuda na interface.
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
                name="enableAnimations"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Animações</FormLabel>
                      <FormDescription>
                        Habilitar animações e transições na interface.
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
              name="showNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Notificações na Interface</FormLabel>
                    <FormDescription>
                      Mostrar notificações e alertas na interface.
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
                Salvar Configurações de Interface
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default InterfaceConfig
