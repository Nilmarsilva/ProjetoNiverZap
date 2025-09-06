import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { 
  Save, 
  Check, 
  X, 
  Database, 
  Phone, 
  RefreshCw, 
  User 
} from 'lucide-react'

/**
 * ConfiguracoesPage
 * 
 * Página de configurações do sistema e integrações
 * Permite configurar preferências do usuário e conexões com APIs
 */
const ConfiguracoesPage = () => {
  const { toast } = useToast()
  const user = useAuthStore((state) => state.user)
  const [testeConexaoStatus, setTesteConexaoStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  
  // Schema para Z-API
  const zapiFormSchema = z.object({
    numero: z.string().min(10, {
      message: "Número inválido",
    }),
    token: z.string().min(5, {
      message: "Token inválido",
    }),
    instancia_id: z.string().min(5, {
      message: "ID da instância inválido",
    }),
  })
  
  // Schema para API oficial do WhatsApp
  const metaFormSchema = z.object({
    app_id: z.string().min(5, {
      message: "App ID inválido",
    }),
    app_secret: z.string().min(5, {
      message: "App Secret inválido",
    }),
    phone_number_id: z.string().min(5, {
      message: "Phone Number ID inválido",
    }),
    version: z.string().min(1, {
      message: "Versão inválida",
    }),
    access_token: z.string().min(10, {
      message: "Access Token inválido",
    }),
  })
  
  // Schema para Evolution API
  const evolutionFormSchema = z.object({
    base_url: z.string().url({
      message: "URL base inválida",
    }),
    api_key: z.string().min(5, {
      message: "API Key inválida",
    }),
    instance_name: z.string().min(3, {
      message: "Nome da instância inválido",
    }),
  })
  
  // Configuração dos formulários de integração
  const zapiForm = useForm<z.infer<typeof zapiFormSchema>>({
    resolver: zodResolver(zapiFormSchema),
    defaultValues: {
      numero: "",
      token: "",
      instancia_id: "",
    },
  })
  
  const metaForm = useForm<z.infer<typeof metaFormSchema>>({
    resolver: zodResolver(metaFormSchema),
    defaultValues: {
      app_id: "",
      app_secret: "",
      phone_number_id: "",
      version: "v17.0",
      access_token: "",
    },
  })
  
  const evolutionForm = useForm<z.infer<typeof evolutionFormSchema>>({
    resolver: zodResolver(evolutionFormSchema),
    defaultValues: {
      base_url: "https://api.example.com",
      api_key: "",
      instance_name: "niverzap",
    },
  })
  
  // Handlers para formulários de integração
  
  // Handler para envio do formulário Z-API
  const onSubmitZapi = (data: z.infer<typeof zapiFormSchema>) => {
    toast({
      title: "Configurações da Z-API salvas",
      description: "A integração com a Z-API foi configurada com sucesso",
    })
    console.log("Dados da Z-API:", data)
  }
  
  // Handler para envio do formulário Meta API (WhatsApp Oficial)
  const onSubmitMeta = (data: z.infer<typeof metaFormSchema>) => {
    toast({
      title: "Configurações da API do WhatsApp salvas",
      description: "A integração com a API oficial do WhatsApp foi configurada com sucesso",
    })
    console.log("Dados da API oficial:", data)
  }
  
  // Handler para envio do formulário Evolution API
  const onSubmitEvolution = (data: z.infer<typeof evolutionFormSchema>) => {
    toast({
      title: "Configurações da Evolution API salvas",
      description: "A integração com a Evolution API foi configurada com sucesso",
    })
    console.log("Dados da Evolution API:", data)
  }
  
  // Função para testar conexão
  const testConnection = async (apiType: 'zapi' | 'meta' | 'evolution') => {
    setTesteConexaoStatus('loading')
    
    // Simulação de teste de API
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Sucesso para Z-API e Evolution API, erro para Meta API (apenas para demonstração)
      if (apiType === 'meta') {
        setTesteConexaoStatus('error')
        toast({
          title: "Erro na conexão",
          description: "Não foi possível conectar à API do WhatsApp. Verifique suas credenciais.",
          variant: "destructive"
        })
      } else {
        setTesteConexaoStatus('success')
        toast({
          title: "Conexão bem-sucedida",
          description: `A conexão com a ${apiType === 'zapi' ? 'Z-API' : 'Evolution API'} foi estabelecida com sucesso.`,
        })
      }
    } catch (error) {
      setTesteConexaoStatus('error')
      toast({
        title: "Erro na conexão",
        description: "Ocorreu um erro ao testar a conexão. Tente novamente mais tarde.",
        variant: "destructive"
      })
    }
  }

  // Obter parâmetros da URL para definir a aba ativa
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'zapi';
  
  // Redirecionar para a página de perfil completa apenas se o parâmetro tab=perfil for explicitamente definido
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <AppLayout title="Configurações">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
          <p className="text-gray-600 mt-1">Gerencie suas preferências e configurações do sistema</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-2">
            <TabsTrigger value="zapi">Z-API</TabsTrigger>
            <TabsTrigger value="meta">WhatsApp Oficial</TabsTrigger>
            <TabsTrigger value="evolution">Evolution API</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          </TabsList>
          
          {/* Tab de Z-API */}
          <TabsContent value="zapi">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-niverzap-blue" />
                  Integração com Z-API
                </CardTitle>
                <CardDescription>
                  Configure a integração com a Z-API para envio de mensagens via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...zapiForm}>
                  <form onSubmit={zapiForm.handleSubmit(onSubmitZapi)} id="zapi-form" className="space-y-4">
                    <FormField
                      control={zapiForm.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="5511999999999" {...field} />
                          </FormControl>
                          <FormDescription>
                            Número de telefone no formato internacional (com DDI e DDD)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={zapiForm.control}
                      name="token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Token da Z-API" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={zapiForm.control}
                      name="instancia_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID da Instância</FormLabel>
                          <FormControl>
                            <Input placeholder="ID da instância" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => testConnection('zapi')}
                        disabled={testeConexaoStatus === 'loading'}
                      >
                        {testeConexaoStatus === 'loading' ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Testando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Testar conexão
                          </>
                        )}
                      </Button>
                      
                      {testeConexaoStatus === 'success' && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                          <Check className="h-3 w-3 mr-1" /> Conexão estabelecida
                        </Badge>
                      )}
                      
                      {testeConexaoStatus === 'error' && (
                        <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                          <X className="h-3 w-3 mr-1" /> Falha na conexão
                        </Badge>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-2">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Status: Não configurado
                  </Badge>
                </div>
                <Button type="submit" form="zapi-form">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar configuração
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Tab de API Oficial do WhatsApp (Meta) */}
          <TabsContent value="meta">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-niverzap-blue" />
                  API Oficial do WhatsApp (Meta)
                </CardTitle>
                <CardDescription>
                  Configure a integração com a API oficial do WhatsApp Business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertDescription>
                    Para esta integração, você precisa ter uma conta Business no Meta for Developers
                    e um número de telefone verificado.
                  </AlertDescription>
                </Alert>
                
                <Form {...metaForm}>
                  <form onSubmit={metaForm.handleSubmit(onSubmitMeta)} id="meta-form" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={metaForm.control}
                        name="app_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>App ID</FormLabel>
                            <FormControl>
                              <Input placeholder="ID do aplicativo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={metaForm.control}
                        name="app_secret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>App Secret</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Secret do aplicativo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={metaForm.control}
                        name="phone_number_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number ID</FormLabel>
                            <FormControl>
                              <Input placeholder="ID do número de telefone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={metaForm.control}
                        name="version"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Versão da API</FormLabel>
                            <FormControl>
                              <Input placeholder="v17.0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={metaForm.control}
                      name="access_token"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Access Token Permanente</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Token de acesso" {...field} />
                          </FormControl>
                          <FormDescription>
                            Token de acesso permanente gerado no Meta Business Suite
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => testConnection('meta')}
                        disabled={testeConexaoStatus === 'loading'}
                      >
                        {testeConexaoStatus === 'loading' ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Testando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Testar conexão
                          </>
                        )}
                      </Button>
                      
                      {testeConexaoStatus === 'success' && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                          <Check className="h-3 w-3 mr-1" /> Conexão estabelecida
                        </Badge>
                      )}
                      
                      {testeConexaoStatus === 'error' && (
                        <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                          <X className="h-3 w-3 mr-1" /> Falha na conexão
                        </Badge>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-2">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Status: Configuração Incompleta
                  </Badge>
                </div>
                <Button type="submit" form="meta-form">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar configuração
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Tab de Evolution API */}
          <TabsContent value="evolution">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-niverzap-blue" />
                  Evolution API
                </CardTitle>
                <CardDescription>
                  Configure a integração com a Evolution API para mensagens via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...evolutionForm}>
                  <form onSubmit={evolutionForm.handleSubmit(onSubmitEvolution)} id="evolution-form" className="space-y-4">
                    <FormField
                      control={evolutionForm.control}
                      name="base_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Base</FormLabel>
                          <FormControl>
                            <Input placeholder="https://sua-api.com" {...field} />
                          </FormControl>
                          <FormDescription>
                            URL da sua instância da Evolution API
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={evolutionForm.control}
                      name="api_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Chave da API" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={evolutionForm.control}
                      name="instance_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Instância</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da instância" {...field} />
                          </FormControl>
                          <FormDescription>
                            Nome da instância configurada na Evolution API
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => testConnection('evolution')}
                        disabled={testeConexaoStatus === 'loading'}
                      >
                        {testeConexaoStatus === 'loading' ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Testando...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Testar conexão
                          </>
                        )}
                      </Button>
                      
                      {testeConexaoStatus === 'success' && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                          <Check className="h-3 w-3 mr-1" /> Conexão estabelecida
                        </Badge>
                      )}
                      
                      {testeConexaoStatus === 'error' && (
                        <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 border-red-200">
                          <X className="h-3 w-3 mr-1" /> Falha na conexão
                        </Badge>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-2">
                <div className="flex items-center">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Status: Ativo
                  </Badge>
                </div>
                <Button type="submit" form="evolution-form">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar configuração
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          {/* Tab de Notificações */}
          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Notificações</CardTitle>
                <CardDescription>
                  Configure como e quando deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="email-notif" className="flex flex-col space-y-1">
                    <span>Notificações por Email</span>
                    <span className="font-normal text-sm text-gray-500">
                      Receber lembretes sobre aniversariantes do dia
                    </span>
                  </Label>
                  <Switch id="email-notif" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="whatsapp-notif" className="flex flex-col space-y-1">
                    <span>Notificações por WhatsApp</span>
                    <span className="font-normal text-sm text-gray-500">
                      Receber mensagens com resumo de atividades
                    </span>
                  </Label>
                  <Switch id="whatsapp-notif" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="system-notif" className="flex flex-col space-y-1">
                    <span>Notificações do Sistema</span>
                    <span className="font-normal text-sm text-gray-500">
                      Notificações sobre atividades da conta
                    </span>
                  </Label>
                  <Switch id="system-notif" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="aniv-reminder" className="flex flex-col space-y-1">
                    <span>Lembrete de Aniversários</span>
                    <span className="font-normal text-sm text-gray-500">
                      Receber lembretes com antecedência de aniversários
                    </span>
                  </Label>
                  <Switch id="aniv-reminder" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="marketing-notif" className="flex flex-col space-y-1">
                    <span>Comunicações de Marketing</span>
                    <span className="font-normal text-sm text-gray-500">
                      Receber notificações sobre novidades e promoções
                    </span>
                  </Label>
                  <Switch id="marketing-notif" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Salvar preferências</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

export default ConfiguracoesPage
