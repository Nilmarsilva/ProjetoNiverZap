import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { userService, UserProfile } from '@/services/userService'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon, Camera, Upload, UserCircle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/store/utils'

// Schema de validação para o formulário de perfil
const profileFormSchema = z.object({
  name: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres",
  }),
  email: z.string().email({
    message: "Email inválido",
  }),
  phone: z.string().min(10, {
    message: "Telefone inválido. Informe DDD + número",
  }),
  mobile_phone: z.string().optional(),
  document_type: z.enum(['cpf', 'cnpj'], {
    required_error: "Selecione o tipo de documento",
  }),
  document: z.string().min(11, {
    message: "Documento inválido",
  }),
  birth_date: z.date().optional(),
  address: z.string().min(3, {
    message: "Endereço inválido",
  }),
  address_number: z.string().min(1, {
    message: "Número inválido",
  }),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, {
    message: "Bairro inválido",
  }),
  city: z.string().min(2, {
    message: "Cidade inválida",
  }),
  state: z.string().min(2, {
    message: "Estado inválido",
  }),
  zipcode: z.string().min(8, {
    message: "CEP inválido",
  }),
  company_name: z.string().optional(),
  trading_name: z.string().optional(),
  profile_image: z.string().optional(),
})

/**
 * Página de Perfil do Usuário
 * 
 * Permite ao usuário visualizar e editar suas informações pessoais
 */
const ProfilePage = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Estado para controlar o upload de imagem
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função para lidar com o upload de imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    // Simular upload (em produção, isso seria um upload real para o servidor)
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setProfileImage(imageDataUrl)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  // Configuração do formulário de perfil
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      mobile_phone: "",
      document_type: "cpf" as "cpf" | "cnpj",
      document: "",
      address: "",
      address_number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipcode: "",
      company_name: "",
      trading_name: "",
      profile_image: "",
    },
  })
  
  // Carregar o perfil do usuário ao montar o componente
  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    if (!user) {
      navigate('/login?redirect=/configuracoes/perfil')
      return
    }
    
    const loadUserProfile = async () => {
      try {
        setIsLoading(true)
        
        // Usar a nova API para buscar o perfil do usuário atual
        const profile = await userService.getCurrentUserProfile()
        setUserProfile(profile)
        
        if (profile) {
          // Definir a imagem de perfil, se existir
          if (profile.profile_image) {
            setProfileImage(profile.profile_image)
          }
          
          // Converter a data de nascimento de string para objeto Date, se existir
          let birthDate: Date | undefined = undefined
          if (profile.birth_date) {
            birthDate = new Date(profile.birth_date)
          }
          
          profileForm.reset({
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            mobile_phone: profile.mobile_phone || "",
            document_type: profile.document_type || "cpf",
            document: profile.document || "",
            birth_date: birthDate,
            address: profile.address || "",
            address_number: profile.address_number || "",
            complement: profile.complement || "",
            neighborhood: profile.neighborhood || "",
            city: profile.city || "",
            state: profile.state || "",
            zipcode: profile.zipcode || "",
            company_name: profile.company_name || "",
            trading_name: profile.trading_name || "",
            profile_image: profile.profile_image || "",
          })
        }
      } catch (error) {
        console.error('Erro ao carregar perfil do usuário:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar seu perfil',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    loadUserProfile()
  }, [user, navigate, toast, profileForm])
  
  // Handler para envio do formulário de perfil
  const onSubmitProfile = async (data: z.infer<typeof profileFormSchema>) => {
    if (!user) return
    
    setIsSaving(true)
    try {
      // Preparar os dados para salvar
      // Converter a data de nascimento para string ISO
      let birthDateStr: string | undefined = undefined
      if (data.birth_date) {
        birthDateStr = data.birth_date.toISOString()
      }
      
      // Atualizar o perfil do usuário usando o userService com a nova API
      const updatedProfile = await userService.updateUserProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        mobile_phone: data.mobile_phone,
        document_type: data.document_type,
        document: data.document,
        birth_date: birthDateStr,
        address: data.address,
        address_number: data.address_number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        zipcode: data.zipcode,
        company_name: data.company_name,
        trading_name: data.trading_name,
        profile_image: profileImage || undefined,
      })
      
      // Atualizar o estado local com o perfil atualizado
      setUserProfile(updatedProfile)
      
      // Verificar se o perfil está completo para criar cliente no Stripe
      const isProfileComplete = await userService.isProfileComplete()
      
      // Se o perfil estiver completo e o usuário ainda não tiver um cliente Stripe, criar automaticamente
      if (isProfileComplete && !updatedProfile.stripe_customer_id) {
        try {
          const stripeCustomerId = await userService.createStripeCustomer()
          toast({
            title: "Cliente Stripe criado",
            description: "Seu perfil está pronto para realizar compras",
          })
        } catch (stripeError) {
          console.error('Erro ao criar cliente no Stripe:', stripeError)
          // Não interromper o fluxo se houver erro no Stripe
        }
      }
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações pessoais foram atualizadas com sucesso",
      })
      
      // Verificar se há um redirecionamento pendente
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect')
      
      if (redirect) {
        window.location.href = redirect
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }
  
  return (
    <AppLayout title="Meu Perfil">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e dados de contato para faturamento e emissão de notas fiscais
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner className="w-8 h-8" />
                <span className="ml-2">Carregando seu perfil...</span>
              </div>
            ) : (
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                  {/* Foto de perfil */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-2 border-gray-200">
                        <AvatarImage src={profileImage || undefined} alt="Foto de perfil" />
                        <AvatarFallback>
                          <UserCircle className="w-12 h-12 text-gray-400" />
                        </AvatarFallback>
                      </Avatar>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        className="absolute bottom-0 right-0 rounded-full bg-white" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {uploading ? "Enviando..." : "Clique para alterar sua foto de perfil"}
                    </p>
                  </div>

                    {/* Abas para alternar entre dados pessoais e dados de faturamento */}
                    <Tabs defaultValue="personal" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                        <TabsTrigger value="billing">Dados de Faturamento</TabsTrigger>
                      </TabsList>
                    
                    {/* Aba de dados pessoais */}
                    <TabsContent value="personal" className="space-y-4 mt-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo*</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email*</FormLabel>
                            <FormControl>
                              <Input placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone Principal*</FormLabel>
                              <FormControl>
                                <Input placeholder="(00) 00000-0000" {...field} />
                              </FormControl>
                              <FormDescription>
                                Número para contato e envio de mensagens
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="mobile_phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone Alternativo</FormLabel>
                              <FormControl>
                                <Input placeholder="(00) 00000-0000" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={profileForm.control}
                        name="birth_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data de Nascimento</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy")
                                    ) : (
                                      <span>Selecione uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    {/* Aba de dados de faturamento */}
                    <TabsContent value="billing" className="space-y-4 mt-4">
                      <FormField
                        control={profileForm.control}
                        name="document_type"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Tipo de Documento*</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-row space-x-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="cpf" id="cpf" />
                                  <Label htmlFor="cpf">CPF (Pessoa Física)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="cnpj" id="cnpj" />
                                  <Label htmlFor="cnpj">CNPJ (Pessoa Jurídica)</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="document"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {profileForm.watch("document_type") === "cpf" ? "CPF*" : "CNPJ*"}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={profileForm.watch("document_type") === "cpf" ? "000.000.000-00" : "00.000.000/0001-00"} 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Necessário para emissão de faturas e notas fiscais
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {profileForm.watch("document_type") === "cnpj" && (
                        <>
                          <FormField
                            control={profileForm.control}
                            name="company_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Razão Social*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Razão Social da Empresa" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="trading_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome Fantasia</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome Fantasia (opcional)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                      
                      <div className="pt-2">
                        <h3 className="text-lg font-medium mb-2">Endereço</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <FormField
                              control={profileForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Logradouro*</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Rua, Avenida, etc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={profileForm.control}
                            name="address_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Número" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <FormField
                            control={profileForm.control}
                            name="complement"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Complemento</FormLabel>
                                <FormControl>
                                  <Input placeholder="Apto, Sala, Conjunto, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="neighborhood"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bairro*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Bairro" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <FormField
                            control={profileForm.control}
                            name="zipcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CEP*</FormLabel>
                                <FormControl>
                                  <Input placeholder="00000-000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade*</FormLabel>
                                <FormControl>
                                  <Input placeholder="Cidade" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado*</FormLabel>
                                <FormControl>
                                  <Input placeholder="UF" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="bg-datazap-green hover:bg-datazap-green/90"
                    >
                      {isSaving ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Salvando...
                        </>
                      ) : (
                        'Salvar Alterações'
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    * Campos obrigatórios
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default ProfilePage
