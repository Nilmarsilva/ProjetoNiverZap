import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/store/utils'
import { Edit, Trash, Plus, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { planService } from '@/services/planService'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// Importar o tipo Plan do serviço de planos para evitar duplicação
import { Plan as ServicePlan } from '@/services/planService'

// Definição do tipo de plano estendido para o componente
interface Plan extends ServicePlan {
  type: string
  allowed_providers: string[]
  updated_at: string
}

// Schema de validação para o formulário
const planFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  description: z.string().min(10, { message: 'A descrição deve ter pelo menos 10 caracteres' }),
  type: z.enum(['free', 'basic', 'premium', 'enterprise'], { 
    message: 'O tipo deve ser free, basic, premium ou enterprise' 
  }),
  price: z.coerce.number().min(0, { message: 'O preço deve ser maior ou igual a zero' }),
  message_limit: z.coerce.number().min(1, { message: 'O limite deve ser maior que zero' }),
  allowed_providers: z.array(z.string()),
  is_active: z.boolean().default(true)
})

type PlanFormValues = z.infer<typeof planFormSchema>

/**
 * Componente de Gerenciamento de Planos
 * 
 * Permite listar, criar, editar e excluir planos
 */
const PlanManagement = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Configuração do formulário
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'basic',
      price: 0,
      message_limit: 10,
      allowed_providers: ['zapi'],
      is_active: true
    }
  })

  // Busca os planos ao carregar o componente
  useEffect(() => {
    fetchPlans()
  }, [])

  // Função para buscar os planos
  const fetchPlans = async () => {
    setLoading(true)
    try {
      // Usar o serviço de planos em vez do Supabase
      const data = await planService.getAllPlans()
      
            // Adaptar os dados para o formato esperado pelo componente
      const adaptedPlans = data.map(plan => ({
        ...plan,
        id: typeof plan.id === 'string' ? parseInt(plan.id) : plan.id,
        type: 'basic', // Valor padrão para o tipo
        allowed_providers: ['zapi'], // Valor padrão para providers permitidos
        updated_at: plan.created_at // Usar created_at como fallback para updated_at
      }));
      
      // Definir os planos adaptados
      setPlans(adaptedPlans as unknown as Plan[])
    } catch (error) {
      console.error('Erro ao buscar planos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os planos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para abrir o diálogo de edição
  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan)
    form.reset({
      name: plan.name,
      description: plan.description,
      type: plan.type as any,
      price: plan.price,
      message_limit: plan.message_limit,
      allowed_providers: plan.allowed_providers,
      is_active: plan.is_active
    })
    setOpenDialog(true)
  }

  // Função para abrir o diálogo de criação
  const openCreateDialog = () => {
    setEditingPlan(null)
    form.reset({
      name: '',
      description: '',
      type: 'basic',
      price: 0,
      message_limit: 10,
      allowed_providers: ['zapi'],
      is_active: true
    })
    setOpenDialog(true)
  }

  // Função para salvar o plano (criar ou atualizar)
  const onSubmit = async (values: PlanFormValues) => {
    setIsSubmitting(true)
    try {
      if (editingPlan) {
        // Atualiza um plano existente usando o serviço de planos
        await planService.updatePlan(editingPlan.id.toString(), {
          name: values.name,
          description: values.description,
          price: values.price,
          message_limit: values.message_limit,
          is_active: values.is_active
        })
        
        toast({
          title: 'Plano atualizado',
          description: `O plano ${values.name} foi atualizado com sucesso`
        })
      } else {
        // Cria um novo plano usando o serviço de planos
        await planService.createPlan({
          name: values.name,
          description: values.description,
          price: values.price,
          message_limit: values.message_limit,
          is_active: values.is_active
        })
        
        toast({
          title: 'Plano criado',
          description: `O plano ${values.name} foi criado com sucesso`
        })
      }
      
      // Fecha o diálogo e atualiza a lista
      setOpenDialog(false)
      fetchPlans()
    } catch (error) {
      console.error('Erro ao salvar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o plano',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openDeleteConfirm = (plan: Plan) => {
    setPlanToDelete(plan)
    setConfirmDeleteOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      setLoading(true)
      // Usar o serviço de planos em vez do Supabase
      await planService.deletePlan(id)

      // Atualiza a lista de planos
      fetchPlans()
      toast({
        title: 'Plano excluído',
        description: 'O plano foi excluído com sucesso.',
      })
    } catch (error) {
      console.error('Erro ao excluir plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o plano. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setPlanToDelete(null)
    }
  }

  // Função para alternar o status de um plano
  const togglePlanStatus = async (plan: Plan) => {
    try {
      // Usar o serviço de planos em vez do Supabase
      await planService.updatePlan(plan.id.toString(), { is_active: !plan.is_active })
      
      toast({
        title: plan.is_active ? 'Plano desativado' : 'Plano ativado',
        description: `O plano ${plan.name} foi ${plan.is_active ? 'desativado' : 'ativado'} com sucesso`
      })
      
      // Atualiza a lista
      fetchPlans()
    } catch (error) {
      console.error('Erro ao alternar status do plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do plano',
        variant: 'destructive'
      })
    }
  }

  // Renderiza o componente
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Button onClick={fetchPlans} variant="outline" className="gap-2">
          <RefreshCw size={16} />
          Atualizar
        </Button>
        
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus size={16} />
          Novo Plano
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Carregando planos...</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-8">Nenhum plano encontrado</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Limite</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.id}</TableCell>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>
                  <Badge variant={
                    plan.type === 'free' ? 'secondary' :
                    plan.type === 'basic' ? 'default' :
                    plan.type === 'premium' ? 'destructive' : 'outline'
                  }>
                    {plan.type}
                  </Badge>
                </TableCell>
                <TableCell>R$ {plan.price.toFixed(2)}</TableCell>
                <TableCell>{plan.message_limit} msgs</TableCell>
                <TableCell>
                  <Badge variant={plan.is_active ? 'default' : 'outline'} className={plan.is_active ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {plan.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => openEditDialog(plan)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => togglePlanStatus(plan)}
                    >
                      <Switch checked={plan.is_active} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => openDeleteConfirm(plan)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {/* Diálogo para criar/editar plano */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? `Editar Plano: ${editingPlan.name}` : 'Criar Novo Plano'}
            </DialogTitle>
            <DialogDescription>
              {editingPlan 
                ? 'Edite os detalhes do plano e clique em salvar quando terminar.' 
                : 'Preencha os detalhes do novo plano e clique em criar quando terminar.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Plano</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Plano Básico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva os benefícios do plano" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="free">Gratuito</option>
                          <option value="basic">Básico</option>
                          <option value="premium">Premium</option>
                          <option value="enterprise">Empresarial</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="message_limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite de Mensagens</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="10" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Mensagens por mês
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-6">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Plano Ativo
                        </FormLabel>
                        <FormDescription>
                          Planos inativos não ficam disponíveis para novos usuários
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
                name="allowed_providers"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Provedores Permitidos</FormLabel>
                      <FormDescription>
                        Selecione os provedores de WhatsApp disponíveis neste plano
                      </FormDescription>
                    </div>
                    <div className="space-y-2">
                      {['zapi', 'whatsapp_official', 'evolution'].map((provider) => (
                        <FormField
                          key={provider}
                          control={form.control}
                          name="allowed_providers"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={provider}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(provider)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, provider])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== provider
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {provider === 'zapi' && 'Z-API'}
                                  {provider === 'whatsapp_official' && 'WhatsApp Cloud API (Oficial)'}
                                  {provider === 'evolution' && 'Evolution API'}
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
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : editingPlan ? 'Salvar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para exclusão */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir plano"
        description={`Tem certeza que deseja excluir o plano ${planToDelete?.name || ''}? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={() => planToDelete && handleDelete(String(planToDelete.id))}
      />
    </div>
  )
}

export default PlanManagement
