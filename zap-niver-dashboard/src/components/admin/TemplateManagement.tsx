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
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/store/utils'
import { Edit, Trash, Plus, RefreshCw, MessageSquare } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// Definição do tipo de template
interface Template {
  id: number
  title: string
  event_type: 'aniversario' | 'dia-das-maes' | 'dia-dos-pais' | 'pascoa' | 'natal' | 'ano-novo' | 'outro'
  message: string
  is_active: boolean
  gender_filter: 'todos' | 'masculino' | 'feminino' | 'outro'
  only_active_contacts: boolean
  created_at: string
  updated_at: string
}

// Schema de validação para o formulário
const templateFormSchema = z.object({
  title: z.string().min(3, { message: 'O título deve ter pelo menos 3 caracteres' }),
  event_type: z.enum(['aniversario', 'dia-das-maes', 'dia-dos-pais', 'pascoa', 'natal', 'ano-novo', 'outro'], { 
    message: 'Selecione um tipo de evento válido' 
  }),
  message: z.string().min(10, { message: 'A mensagem deve ter pelo menos 10 caracteres' }),
  gender_filter: z.enum(['todos', 'masculino', 'feminino', 'outro'], { 
    message: 'Selecione um filtro de gênero válido' 
  }),
  only_active_contacts: z.boolean().default(true),
  is_active: z.boolean().default(true)
})

type TemplateFormValues = z.infer<typeof templateFormSchema>

/**
 * Componente de Gerenciamento de Templates
 * 
 * Permite listar, criar, editar e excluir templates para diferentes datas comemorativas
 */
const TemplateManagement = () => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Configuração do formulário
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      title: '',
      event_type: 'aniversario',
      message: '',
      gender_filter: 'todos',
      only_active_contacts: true,
      is_active: true
    }
  })

  // Busca os templates ao carregar o componente
  useEffect(() => {
    fetchTemplates()
  }, [])

  // Função para buscar os templates
  const fetchTemplates = async () => {
    setLoading(true)
    try {
      // Dados mockados para desenvolvimento
      const mockTemplates: Template[] = [
        {
          id: 1,
          title: 'Aniversário',
          event_type: 'aniversario',
          message: 'Feliz aniversário! Desejamos um dia especial cheio de alegria e realizações.',
          is_active: true,
          gender_filter: 'todos',
          only_active_contacts: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Dia das Mães',
          event_type: 'dia-das-maes',
          message: 'Feliz Dia das Mães! Agradecemos por todo seu carinho e dedicação.',
          is_active: true,
          gender_filter: 'feminino',
          only_active_contacts: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          title: 'Dia dos Pais',
          event_type: 'dia-dos-pais',
          message: 'Feliz Dia dos Pais! Agradecemos por todo seu carinho e dedicação.',
          is_active: true,
          gender_filter: 'masculino',
          only_active_contacts: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          title: 'Natal',
          event_type: 'natal',
          message: 'Feliz Natal! Desejamos um feliz natal e próspero ano novo.',
          is_active: false,
          gender_filter: 'todos',
          only_active_contacts: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 5,
          title: 'Ano Novo',
          event_type: 'ano-novo',
          message: 'Feliz Ano Novo! Que este novo ano seja repleto de conquistas e alegrias.',
          is_active: false,
          gender_filter: 'todos',
          only_active_contacts: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Erro ao buscar templates:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os templates',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para abrir o dialog de edição
  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    form.reset({
      title: template.title,
      event_type: template.event_type,
      message: template.message,
      gender_filter: template.gender_filter,
      only_active_contacts: template.only_active_contacts,
      is_active: template.is_active
    })
    setOpenDialog(true)
  }

  // Função para abrir o dialog de confirmação de exclusão
  const handleDeleteClick = (template: Template) => {
    setTemplateToDelete(template)
    setConfirmDeleteOpen(true)
  }

  // Função para excluir um template
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return

    try {
      // Simulação de exclusão (em produção, seria uma chamada à API)
      setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id))
      
      toast({
        title: 'Template excluído',
        description: `O template "${templateToDelete.title}" foi excluído com sucesso`
      })
    } catch (error) {
      console.error('Erro ao excluir template:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o template',
        variant: 'destructive'
      })
    } finally {
      setConfirmDeleteOpen(false)
      setTemplateToDelete(null)
    }
  }

  // Função para alternar o status de um template
  const toggleTemplateStatus = async (template: Template) => {
    try {
      // Simulação de atualização (em produção, seria uma chamada à API)
      setTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, is_active: !t.is_active } : t
      ))
      
      toast({
        title: template.is_active ? 'Template desativado' : 'Template ativado',
        description: `O template "${template.title}" foi ${template.is_active ? 'desativado' : 'ativado'} com sucesso`
      })
    } catch (error) {
      console.error('Erro ao alternar status do template:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do template',
        variant: 'destructive'
      })
    }
  }

  // Função para salvar um template (criar ou editar)
  const onSubmit = async (data: TemplateFormValues) => {
    setIsSubmitting(true)
    
    try {
      if (editingTemplate) {
        // Editar template existente
        const updatedTemplate = {
          ...editingTemplate,
          ...data,
          updated_at: new Date().toISOString()
        }
        
        // Simulação de atualização (em produção, seria uma chamada à API)
        setTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id ? updatedTemplate : t
        ))
        
        toast({
          title: 'Template atualizado',
          description: `O template "${data.title}" foi atualizado com sucesso`
        })
      } else {
        // Criar novo template
        const newTemplate: Template = {
          id: Math.max(0, ...templates.map(t => t.id)) + 1,
          title: data.title,
          event_type: data.event_type,
          message: data.message,
          gender_filter: data.gender_filter,
          only_active_contacts: data.only_active_contacts,
          is_active: data.is_active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Simulação de criação (em produção, seria uma chamada à API)
        setTemplates(prev => [...prev, newTemplate])
        
        toast({
          title: 'Template criado',
          description: `O template "${data.title}" foi criado com sucesso`
        })
      }
      
      // Fechar o dialog e resetar o formulário
      setOpenDialog(false)
      form.reset()
      setEditingTemplate(null)
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o template',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para obter a cor do badge com base no tipo de evento
  const getEventTypeBadgeColor = (eventType: Template['event_type']) => {
    switch (eventType) {
      case 'aniversario':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'dia-das-maes':
        return 'bg-pink-100 text-pink-800 border-pink-300'
      case 'dia-dos-pais':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'pascoa':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'natal':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'ano-novo':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Função para obter o nome formatado do tipo de evento
  const getEventTypeName = (eventType: Template['event_type']) => {
    switch (eventType) {
      case 'aniversario':
        return 'Aniversário'
      case 'dia-das-maes':
        return 'Dia das Mães'
      case 'dia-dos-pais':
        return 'Dia dos Pais'
      case 'pascoa':
        return 'Páscoa'
      case 'natal':
        return 'Natal'
      case 'ano-novo':
        return 'Ano Novo'
      default:
        return 'Outro'
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho e ações */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Templates de Mensagens</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os templates para envio automático de mensagens em datas comemorativas.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Atualizar
          </Button>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-datazap-green hover:bg-datazap-green/90"
                onClick={() => {
                  setEditingTemplate(null)
                  form.reset({
                    title: '',
                    event_type: 'aniversario',
                    message: '',
                    gender_filter: 'todos',
                    only_active_contacts: true,
                    is_active: true
                  })
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Editar Template' : 'Novo Template'}
                </DialogTitle>
                <DialogDescription>
                  {editingTemplate 
                    ? 'Edite as informações do template de mensagem.' 
                    : 'Crie um novo template para envio de mensagens.'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Mensagem de Aniversário" {...field} />
                        </FormControl>
                        <FormDescription>
                          Nome que identifica este template.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="event_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Evento</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aniversario">Aniversário</SelectItem>
                              <SelectItem value="dia-das-maes">Dia das Mães</SelectItem>
                              <SelectItem value="dia-dos-pais">Dia dos Pais</SelectItem>
                              <SelectItem value="pascoa">Páscoa</SelectItem>
                              <SelectItem value="natal">Natal</SelectItem>
                              <SelectItem value="ano-novo">Ano Novo</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Data comemorativa associada a este template.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="gender_filter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Filtro de Gênero</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um filtro" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="todos">Todos</SelectItem>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Filtrar contatos por gênero.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mensagem</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Digite a mensagem que será enviada..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Use {'{nome}'} para incluir o nome do contato na mensagem.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="only_active_contacts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Apenas Contatos Ativos</FormLabel>
                            <FormDescription>
                              Enviar apenas para contatos marcados como ativos.
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
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Template Ativo</FormLabel>
                            <FormDescription>
                              Ativar ou desativar este template.
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
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setOpenDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-datazap-green hover:bg-datazap-green/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar Template'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Tabela de templates */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo de Evento</TableHead>
              <TableHead>Filtro de Gênero</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length > 0 ? (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.title}</TableCell>
                  <TableCell>
                    <Badge className={cn("border", getEventTypeBadgeColor(template.event_type))}>
                      {getEventTypeName(template.event_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {template.gender_filter === 'todos' ? 'Todos' : 
                     template.gender_filter === 'masculino' ? 'Masculino' : 
                     template.gender_filter === 'feminino' ? 'Feminino' : 'Outro'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.is_active ? "default" : "outline"}>
                      {template.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleTemplateStatus(template)}
                      >
                        <MessageSquare className={cn(
                          "h-4 w-4",
                          template.is_active ? "text-green-600" : "text-gray-400"
                        )} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteClick(template)}
                      >
                        <Trash className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      Nenhum template encontrado.
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir Template"
        description={`Tem certeza que deseja excluir o template "${templateToDelete?.title}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteTemplate}
      />
    </div>
  )
}

export default TemplateManagement
