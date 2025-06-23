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
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Calendar, Plus, Trash, Edit, Save } from 'lucide-react'
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'

// Interface para feriados
interface Holiday {
  id: number
  name: string
  date: Date | string
  type: 'fixed' | 'moving' | 'custom'
  active: boolean
  national: boolean
  description?: string
}

// Schema de validação para o formulário de feriados
const holidayFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  date: z.date({
    required_error: "Por favor selecione uma data",
  }),
  type: z.enum(['fixed', 'moving', 'custom'], {
    message: 'Selecione um tipo válido'
  }),
  active: z.boolean().default(true),
  national: z.boolean().default(true),
  description: z.string().optional(),
})

type HolidayFormValues = z.infer<typeof holidayFormSchema>

/**
 * Componente para gerenciamento de feriados e datas especiais
 */
export const HolidayManager = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null)
  const { toast } = useToast()

  // Configuração do formulário
  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      name: '',
      date: new Date(),
      type: 'fixed',
      active: true,
      national: true,
      description: '',
    }
  })

  // Buscar feriados ao carregar o componente
  useEffect(() => {
    fetchHolidays()
  }, [])

  // Função para buscar feriados
  const fetchHolidays = async () => {
    setLoading(true)
    try {
      // Dados mockados para desenvolvimento
      const mockHolidays: Holiday[] = [
        {
          id: 1,
          name: 'Ano Novo',
          date: new Date(new Date().getFullYear(), 0, 1),
          type: 'fixed',
          active: true,
          national: true,
          description: 'Celebração do primeiro dia do ano'
        },
        {
          id: 2,
          name: 'Carnaval',
          date: new Date(new Date().getFullYear(), 1, 20), // Data aproximada
          type: 'moving',
          active: true,
          national: true,
          description: 'Feriado móvel baseado na Páscoa'
        },
        {
          id: 3,
          name: 'Páscoa',
          date: new Date(new Date().getFullYear(), 3, 4), // Data aproximada
          type: 'moving',
          active: true,
          national: true,
          description: 'Domingo de Páscoa'
        },
        {
          id: 4,
          name: 'Tiradentes',
          date: new Date(new Date().getFullYear(), 3, 21),
          type: 'fixed',
          active: true,
          national: true,
          description: 'Feriado nacional em homenagem a Tiradentes'
        },
        {
          id: 5,
          name: 'Dia do Trabalho',
          date: new Date(new Date().getFullYear(), 4, 1),
          type: 'fixed',
          active: true,
          national: true,
          description: 'Dia Internacional do Trabalho'
        },
        {
          id: 6,
          name: 'Independência do Brasil',
          date: new Date(new Date().getFullYear(), 8, 7),
          type: 'fixed',
          active: true,
          national: true,
          description: 'Celebração da independência do Brasil'
        },
        {
          id: 7,
          name: 'Nossa Senhora Aparecida',
          date: new Date(new Date().getFullYear(), 9, 12),
          type: 'fixed',
          active: true,
          national: true,
          description: 'Dia da padroeira do Brasil'
        },
        {
          id: 8,
          name: 'Finados',
          date: new Date(new Date().getFullYear(), 10, 2),
          type: 'fixed',
          active: true,
          national: true,
          description: 'Dia de Finados'
        },
        {
          id: 9,
          name: 'Proclamação da República',
          date: new Date(new Date().getFullYear(), 10, 15),
          type: 'fixed',
          active: true,
          national: true,
          description: 'Proclamação da República do Brasil'
        },
        {
          id: 10,
          name: 'Natal',
          date: new Date(new Date().getFullYear(), 11, 25),
          type: 'fixed',
          active: true,
          national: true,
          description: 'Celebração do Natal'
        }
      ]
      
      setHolidays(mockHolidays)
    } catch (error) {
      console.error('Erro ao buscar feriados:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os feriados',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para abrir o dialog de edição
  const handleEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday)
    form.reset({
      name: holiday.name,
      date: new Date(holiday.date),
      type: holiday.type,
      active: holiday.active,
      national: holiday.national,
      description: holiday.description || '',
    })
    setOpenDialog(true)
  }

  // Função para abrir o dialog de confirmação de exclusão
  const handleDeleteClick = (holiday: Holiday) => {
    setHolidayToDelete(holiday)
    setConfirmDeleteOpen(true)
  }

  // Função para excluir um feriado
  const handleDeleteHoliday = async () => {
    if (!holidayToDelete) return
    
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Atualizar a lista local
      setHolidays(holidays.filter(h => h.id !== holidayToDelete.id))
      
      toast({
        title: 'Feriado excluído',
        description: `O feriado "${holidayToDelete.name}" foi excluído com sucesso.`
      })
    } catch (error) {
      console.error('Erro ao excluir feriado:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o feriado',
        variant: 'destructive'
      })
    } finally {
      setConfirmDeleteOpen(false)
      setHolidayToDelete(null)
    }
  }

  // Função para alternar o status ativo de um feriado
  const toggleHolidayStatus = async (holiday: Holiday) => {
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Atualizar a lista local
      const updatedHolidays = holidays.map(h => {
        if (h.id === holiday.id) {
          return { ...h, active: !h.active }
        }
        return h
      })
      
      setHolidays(updatedHolidays)
      
      toast({
        title: 'Status atualizado',
        description: `O feriado "${holiday.name}" foi ${!holiday.active ? 'ativado' : 'desativado'}.`
      })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status',
        variant: 'destructive'
      })
    }
  }

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: HolidayFormValues) => {
    setLoading(true)
    try {
      // Simulação de chamada à API
      await new Promise(resolve => setTimeout(resolve, 800))
      
      if (editingHoliday) {
        // Atualizar feriado existente
        const updatedHolidays = holidays.map(h => {
          if (h.id === editingHoliday.id) {
            return { 
              ...h, 
              name: data.name,
              date: data.date,
              type: data.type,
              active: data.active,
              national: data.national,
              description: data.description
            }
          }
          return h
        })
        
        setHolidays(updatedHolidays)
        
        toast({
          title: 'Feriado atualizado',
          description: `O feriado "${data.name}" foi atualizado com sucesso.`
        })
      } else {
        // Criar novo feriado
        const newHoliday: Holiday = {
          id: Math.max(0, ...holidays.map(h => h.id)) + 1,
          name: data.name,
          date: data.date,
          type: data.type,
          active: data.active,
          national: data.national,
          description: data.description
        }
        
        setHolidays([...holidays, newHoliday])
        
        toast({
          title: 'Feriado criado',
          description: `O feriado "${data.name}" foi criado com sucesso.`
        })
      }
      
      // Fechar o dialog e resetar o formulário
      setOpenDialog(false)
      setEditingHoliday(null)
      form.reset()
    } catch (error) {
      console.error('Erro ao salvar feriado:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o feriado',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para formatar a data
  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('pt-BR')
  }

  // Função para obter a badge de tipo
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed':
        return { label: 'Fixo', color: 'bg-blue-500' }
      case 'moving':
        return { label: 'Móvel', color: 'bg-amber-500' }
      case 'custom':
        return { label: 'Personalizado', color: 'bg-purple-500' }
      default:
        return { label: type, color: 'bg-gray-500' }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5 text-datazap-green" />
          Feriados e Datas Especiais
        </h3>
        
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button 
              className="bg-datazap-green hover:bg-datazap-green/90 gap-2"
              onClick={() => {
                setEditingHoliday(null)
                form.reset({
                  name: '',
                  date: new Date(),
                  type: 'fixed',
                  active: true,
                  national: true,
                  description: '',
                })
              }}
            >
              <Plus className="h-4 w-4" />
              Adicionar Feriado
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingHoliday ? 'Editar Feriado' : 'Adicionar Feriado'}
              </DialogTitle>
              <DialogDescription>
                {editingHoliday 
                  ? 'Edite os detalhes do feriado selecionado.' 
                  : 'Adicione um novo feriado ou data especial ao sistema.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do feriado" {...field} />
                      </FormControl>
                      <FormDescription>
                        Nome do feriado ou data especial
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <DatePicker 
                        date={field.value} 
                        setDate={field.onChange}
                      />
                      <FormDescription>
                        Data do feriado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fixed">Fixo</SelectItem>
                          <SelectItem value="moving">Móvel</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Tipo de data (fixo, móvel ou personalizado)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                        <div className="space-y-1">
                          <FormLabel>Ativo</FormLabel>
                          <FormDescription>
                            Feriado está ativo
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
                    name="national"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                        <div className="space-y-1">
                          <FormLabel>Nacional</FormLabel>
                          <FormDescription>
                            Feriado nacional
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Descrição do feriado" {...field} />
                      </FormControl>
                      <FormDescription>
                        Descrição opcional do feriado
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
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
                        {editingHoliday ? 'Atualizar' : 'Adicionar'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhum feriado encontrado
                </TableCell>
              </TableRow>
            ) : (
              holidays.map((holiday) => {
                const typeInfo = getTypeLabel(holiday.type)
                return (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">
                      {holiday.name}
                      {holiday.national && (
                        <Badge variant="outline" className="ml-2">
                          Nacional
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(holiday.date)}</TableCell>
                    <TableCell>
                      <Badge className={`${typeInfo.color} hover:${typeInfo.color}/80`}>
                        {typeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={holiday.active ? "default" : "outline"}>
                        {holiday.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleHolidayStatus(holiday)}
                          title={holiday.active ? 'Desativar' : 'Ativar'}
                        >
                          <Switch checked={holiday.active} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditHoliday(holiday)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(holiday)}
                          title="Excluir"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir Feriado"
        description={`Tem certeza que deseja excluir o feriado "${holidayToDelete?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteHoliday}
      />
      
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>Tipos de Feriados:</strong>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Fixos:</strong> Ocorrem sempre na mesma data (ex: Natal - 25/12)</li>
          <li><strong>Móveis:</strong> Mudam de data a cada ano (ex: Páscoa)</li>
          <li><strong>Personalizados:</strong> Datas especiais específicas da sua empresa</li>
        </ul>
      </div>
    </div>
  )
}
