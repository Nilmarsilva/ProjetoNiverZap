import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { useConfig } from '@/contexts/ConfigContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/store/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  FileText, 
  Plus, 
  Edit2, 
  Copy, 
  Save, 
  Trash2, 
  Image,
  Users,
  Filter,
  Send,
  Eye,
  EyeOff,
  Upload,
  X
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

/**
 * Schema de validação para o formulário de template comemorativo
 */
const templateComemorativoSchema = z.object({
  titulo: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  dataComemorativa: z.enum(['aniversario', 'dia-das-maes', 'dia-dos-pais', 'pascoa', 'natal', 'ano-novo', 'tiradentes', 'dia-do-trabalho', 'independencia-do-brasil', 'proclamacao-da-republica'], { required_error: "Selecione uma data comemorativa" }),
  mensagem: z.string().min(10, { message: "A mensagem deve ter pelo menos 10 caracteres" }),
  diaEnvio: z.number().min(1, { message: "Dia deve ser entre 1 e 31" }).max(31, { message: "Dia deve ser entre 1 e 31" }),
  mesEnvio: z.number().min(1, { message: "Mês deve ser entre 1 e 12" }).max(12, { message: "Mês deve ser entre 1 e 12" }),
  filtroGenero: z.enum(['todos', 'masculino', 'feminino', 'outro'], { required_error: "Selecione um filtro de gênero" }).default('todos'),
  apenasAtivos: z.boolean().default(true),
  incluirImagem: z.boolean().default(false),
  categoria: z.string().optional(),
  // Definindo apenas WhatsApp como canal
  canal: z.literal('whatsapp').default('whatsapp'),
  descricao: z.string().optional(),
  ativo: z.boolean().default(false),
})

type TemplateComemorativoFormValues = z.infer<typeof templateComemorativoSchema>

/**
 * Tipo para representar um template comemorativo
 */
interface TemplateComemorativos {
  id: number
  titulo: string
  dataComemorativa: 'aniversario' | 'dia-das-maes' | 'dia-dos-pais' | 'pascoa' | 'natal' | 'ano-novo' | 'tiradentes' | 'dia-do-trabalho' | 'independencia-do-brasil' | 'proclamacao-da-republica'
  mensagem: string
  ativo: boolean
  dataEnvio: string
  diaEnvio: number
  mesEnvio: number
  filtroGenero: 'todos' | 'masculino' | 'feminino' | 'outro'
  apenasAtivos: boolean
  incluirImagem: boolean
  status: 'rascunho' | 'agendado' | 'enviado'
  categoria?: string
  canal: 'whatsapp' // Apenas WhatsApp como canal
  descricao?: string
  imagemUrl?: string
  totalDestinatarios?: number
}

/**
 * TemplatesComemorativosPage
 * 
 * Página para gerenciamento de templates para datas comemorativas
 * Permite criar campanhas para datas específicas com filtros automáticos
 */
const TemplatesComemorativosPage = () => {
  const [templates, setTemplates] = useState<TemplateComemorativos[]>([
    {
      id: 1,
      titulo: 'Dia das Mães',
      dataComemorativa: 'dia-das-maes',
      mensagem: 'Feliz Dia das Mães! Que seu dia seja tão especial quanto você é para todos nós.',
      diaEnvio: 14,
      mesEnvio: 5,
      dataEnvio: '14/05',
      filtroGenero: 'feminino',
      apenasAtivos: true,
      incluirImagem: false,
      totalDestinatarios: 120,
      status: 'rascunho',
      canal: 'whatsapp',
      ativo: true
    },
    {
      id: 2,
      titulo: 'Dia dos Pais',
      dataComemorativa: 'dia-dos-pais',
      mensagem: 'Feliz Dia dos Pais! Agradecemos por todo seu carinho, dedicação e ensinamentos.',
      diaEnvio: 13,
      mesEnvio: 8,
      dataEnvio: '13/08',
      filtroGenero: 'masculino',
      apenasAtivos: true,
      incluirImagem: false,
      totalDestinatarios: 85,
      status: 'rascunho',
      canal: 'whatsapp',
      ativo: true
    },
    {
      id: 3,
      titulo: 'Natal',
      dataComemorativa: 'natal',
      mensagem: 'Desejamos um Feliz Natal e que o próximo ano seja repleto de realizações!',
      diaEnvio: 24,
      mesEnvio: 12,
      dataEnvio: '24/12',
      filtroGenero: 'todos',
      apenasAtivos: true,
      incluirImagem: false,
      totalDestinatarios: 200,
      status: 'rascunho',
      canal: 'whatsapp',
      ativo: true
    },
    {
      id: 4,
      titulo: 'Ano Novo',
      dataComemorativa: 'ano-novo',
      mensagem: 'Feliz Ano Novo! Que o novo ano seja repleto de muitas conquistas e alegrias para você e sua família.',
      diaEnvio: 1,
      mesEnvio: 1,
      dataEnvio: '01/01',
      filtroGenero: 'todos',
      apenasAtivos: true,
      incluirImagem: false,
      totalDestinatarios: 200,
      status: 'rascunho',
      canal: 'whatsapp',
      ativo: true
    },
    // Templates de aniversário migrados
    {
      id: 5,
      titulo: 'Aniversário Formal',
      dataComemorativa: 'aniversario',
      descricao: 'Template formal para relações profissionais',
      mensagem: 'Prezado(a) {{nome}}, em nome de toda a equipe da DataZAP, desejamos um feliz aniversário! Que este dia seja especial e que o próximo ano seja repleto de realizações.',
      diaEnvio: 1,
      mesEnvio: 1,
      dataEnvio: 'No dia',
      filtroGenero: 'todos',
      apenasAtivos: true,
      incluirImagem: false,
      categoria: 'Profissional',
      canal: 'whatsapp',
      status: 'rascunho',
      ativo: true
    },
    {
      id: 6,
      titulo: 'Aniversário Descontraído',
      dataComemorativa: 'aniversario',
      descricao: 'Template informal para amigos e familiares',
      mensagem: 'E aí {{nome}}! Chegou o seu dia! Parabéns pelo seu aniversário! Desejo muita saúde, alegria e que todos os seus sonhos se realizem!',
      diaEnvio: 1,
      mesEnvio: 1,
      dataEnvio: 'No dia',
      filtroGenero: 'todos',
      apenasAtivos: true,
      incluirImagem: false,
      categoria: 'Pessoal',
      canal: 'whatsapp',
      status: 'rascunho',
      ativo: true
    },
    {
      id: 7,
      titulo: 'Aniversário Cliente',
      dataComemorativa: 'aniversario',
      descricao: 'Template para clientes e parceiros comerciais',
      mensagem: 'Olá {{nome}}, a equipe da DataZAP deseja a você um feliz aniversário! Agradecemos pela parceria e confiança.',
      diaEnvio: 1,
      mesEnvio: 1,
      dataEnvio: 'No dia',
      filtroGenero: 'todos',
      apenasAtivos: true,
      incluirImagem: false,
      categoria: 'Comercial',
      canal: 'whatsapp',
      status: 'rascunho',
      ativo: true
    },
    {
      id: 8,
      titulo: 'Mensagem Corporativa',
      dataComemorativa: 'aniversario',
      descricao: 'Template corporativo para colaboradores',
      mensagem: 'Prezado(a) {{nome}}, a diretoria da DataZAP deseja a você um feliz aniversário. Agradecemos sua dedicação e comprometimento.',
      diaEnvio: 1,
      mesEnvio: 1,
      dataEnvio: 'No dia',
      filtroGenero: 'todos',
      apenasAtivos: true,
      incluirImagem: false,
      categoria: 'Profissional',
      canal: 'whatsapp',
      status: 'rascunho',
      ativo: true
    },
  ])
  
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateComemorativos | null>(null)
  const [activeTab, setActiveTab] = useState('todos')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Função para redimensionar e comprimir a imagem
  const resizeAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = document.createElement('img')
        img.onload = () => {
          // Definir dimensões máximas
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800
          
          let width = img.width
          let height = img.height
          
          // Redimensionar mantendo a proporção
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width))
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height))
              height = MAX_HEIGHT
            }
          }
          
          // Criar canvas para redimensionar
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          // Desenhar imagem redimensionada
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Converter para formato otimizado (JPEG com 85% de qualidade)
          // Para PNG e GIF, manter o formato original
          const quality = 0.85
          let outputFormat = 'image/jpeg'
          
          if (file.type === 'image/png') {
            outputFormat = 'image/png'
          } else if (file.type === 'image/gif') {
            outputFormat = 'image/gif'
          }
          
          // Obter a imagem otimizada como DataURL
          const dataUrl = canvas.toDataURL(outputFormat, quality)
          resolve(dataUrl)
        }
        
        img.onerror = () => {
          reject(new Error('Erro ao carregar a imagem'))
        }
        
        img.src = event.target?.result as string
      }
      
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'))
      }
      
      reader.readAsDataURL(file)
    })
  }
  
  // Função para validar e processar o upload de imagem
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImageError(null)
    
    if (!file) {
      setSelectedImage(null)
      setImagePreview(null)
      return
    }
    
    // Validar o tipo de arquivo (jpg/png/gif)
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
      setImageError('Apenas imagens JPG, PNG e GIF são permitidas')
      e.target.value = ''
      return
    }
    
    // Validar o tamanho do arquivo (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError('A imagem deve ter no máximo 2MB')
      e.target.value = ''
      return
    }
    
    // Redimensionar e comprimir a imagem
    resizeAndCompressImage(file)
      .then(optimizedImageUrl => {
        setImagePreview(optimizedImageUrl)
        setSelectedImage(file) // Mantemos o arquivo original para referência
        form.setValue('incluirImagem', true)
      })
      .catch(error => {
        console.error('Erro ao processar imagem:', error)
        setImageError('Erro ao processar a imagem. Tente novamente.')
        e.target.value = ''
      })
  }
  
  // Configuração do formulário de template
  const form = useForm<TemplateComemorativoFormValues>({
    resolver: zodResolver(templateComemorativoSchema),
    defaultValues: {
      titulo: '',
      dataComemorativa: 'aniversario',
      mensagem: '',
      diaEnvio: 1,
      mesEnvio: 1,
      filtroGenero: 'todos',
      apenasAtivos: true,
      incluirImagem: false,
      categoria: '',
      canal: 'whatsapp',
      descricao: '',
      ativo: false
    },
  })
  
  // Handler para resetar o formulário quando o dialog for fechado
  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset({
        titulo: '',
        dataComemorativa: 'aniversario',
        mensagem: '',
        diaEnvio: 1,
        mesEnvio: 1,
        filtroGenero: 'todos',
        apenasAtivos: true,
        incluirImagem: false,
        categoria: '',
        canal: 'whatsapp',
        descricao: '',
        ativo: false
      })
      setSelectedTemplate(null)
      setSelectedImage(null)
      setImagePreview(null)
      setImageError(null)
    }
    setOpenDialog(open)
  }
  
  // Atualizar campos quando a data comemorativa mudar
  useEffect(() => {
    const dataComemorativa = form.watch('dataComemorativa')
    
    // Aplicar filtros automáticos para certas datas comemorativas
    if (dataComemorativa === 'dia-das-maes') {
      form.setValue('filtroGenero', 'feminino')
      // Dia das Mães (segundo domingo de maio, aproximadamente dia 14)
      form.setValue('diaEnvio', 14)
      form.setValue('mesEnvio', 5)
    } else if (dataComemorativa === 'dia-dos-pais') {
      form.setValue('filtroGenero', 'masculino')
      // Dia dos Pais (segundo domingo de agosto, aproximadamente dia 13)
      form.setValue('diaEnvio', 13)
      form.setValue('mesEnvio', 8)
    } else if (dataComemorativa === 'natal') {
      // Natal (25 de dezembro)
      form.setValue('diaEnvio', 25)
      form.setValue('mesEnvio', 12)
      form.setValue('filtroGenero', 'todos') // Natal é para todos
    } else if (dataComemorativa === 'ano-novo') {
      // Ano Novo (1 de janeiro)
      form.setValue('diaEnvio', 1)
      form.setValue('mesEnvio', 1)
      form.setValue('filtroGenero', 'todos') // Ano Novo é para todos
    } else if (dataComemorativa === 'pascoa') {
      // Páscoa (data variável, mas geralmente em abril)
      form.setValue('diaEnvio', 15)
      form.setValue('mesEnvio', 4)
      form.setValue('filtroGenero', 'todos') // Páscoa é para todos
    } else if (dataComemorativa === 'tiradentes') {
      // Tiradentes (21 de abril)
      form.setValue('diaEnvio', 21)
      form.setValue('mesEnvio', 4)
      form.setValue('filtroGenero', 'todos')
    } else if (dataComemorativa === 'dia-do-trabalho') {
      // Dia do Trabalho (1 de maio)
      form.setValue('diaEnvio', 1)
      form.setValue('mesEnvio', 5)
      form.setValue('filtroGenero', 'todos')
    } else if (dataComemorativa === 'independencia-do-brasil') {
      // Independência do Brasil (7 de setembro)
      form.setValue('diaEnvio', 7)
      form.setValue('mesEnvio', 9)
      form.setValue('filtroGenero', 'todos')
    } else if (dataComemorativa === 'proclamacao-da-republica') {
      // Proclamação da República (15 de novembro)
      form.setValue('diaEnvio', 15)
      form.setValue('mesEnvio', 11)
      form.setValue('filtroGenero', 'todos')
    }
    
    // Para aniversários, definir valores padrão para os campos específicos
    if (dataComemorativa === 'aniversario' && !selectedTemplate) {
      form.setValue('diaEnvio', 1)
      form.setValue('mesEnvio', 1)
      form.setValue('canal', 'whatsapp')
    }
  }, [form.watch('dataComemorativa'), form, selectedTemplate])
  
  // Função para truncar texto longo
  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Função para obter o nome da data comemorativa
  const getDataComemorativaNome = (tipo: string) => {
    switch(tipo) {
      case 'aniversario': return 'Aniversário'
      case 'dia-das-maes': return 'Dia das Mães'
      case 'dia-dos-pais': return 'Dia dos Pais'
      case 'pascoa': return 'Páscoa'
      case 'natal': return 'Natal'
      case 'ano-novo': return 'Ano Novo'
      case 'tiradentes': return 'Tiradentes'
      case 'dia-do-trabalho': return 'Dia do Trabalho'
      case 'independencia-do-brasil': return 'Independência do Brasil'
      case 'proclamacao-da-republica': return 'Proclamação da República'
      default: return 'Desconhecido'
    }
  }

  // Função para aplicar variáveis de preview no conteúdo
  const applyPreviewVariables = (content: string) => {
    let previewContent = content
    
    // Substituir variáveis conhecidas
    const previewData = {
      nome: 'Maria Silva',
      empresa: 'DataZAP',
      tempo_empresa: '2',
      data_nascimento: '15/04/1990'
    }
    
    // Substituir todas as variáveis conhecidas
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      previewContent = previewContent.replace(regex, String(value))
    })
    
    // Destacar as variáveis que não foram substituídas
    const remainingVarsRegex = /{{([^}]+)}}/g
    previewContent = previewContent.replace(remainingVarsRegex, '<span class="bg-yellow-100 text-yellow-800 px-1 rounded">{{$1}}</span>')
    
    return previewContent
  }

  // Função para obter a cor da badge de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho':
        return 'bg-gray-200 text-gray-800'
      case 'agendado':
        return 'bg-blue-100 text-blue-800'
      case 'enviado':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Função para filtrar templates por status
  const filteredTemplates = templates.filter(template => {
    if (activeTab === 'todos') return true
    if (activeTab === 'rascunhos') return template.status === 'rascunho'
    if (activeTab === 'agendados') return template.status === 'agendado'
    if (activeTab === 'enviados') return template.status === 'enviado'
    if (activeTab === 'aniversario') return template.dataComemorativa === 'aniversario'
    return true
  })

  // Handler para envio do formulário
  const onSubmit = (data: TemplateComemorativoFormValues) => {
    // Validar se os campos obrigatórios estão preenchidos
    if (!data.titulo || !data.dataComemorativa || !data.mensagem) {
      toast({
        title: "Erro ao salvar template",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    // Validar se uma imagem foi selecionada quando incluirImagem está marcado
    if (data.incluirImagem && !selectedImage) {
      toast({
        title: "Erro ao salvar template",
        description: "Selecione uma imagem para o template.",
        variant: "destructive"
      })
      return
    }

    // Formatar a data de envio como DD/MM ou texto especial para aniversários
    const dataEnvioFormatada = data.dataComemorativa === 'aniversario' 
      ? 'No dia do aniversário'
      : `${String(data.diaEnvio).padStart(2, '0')}/${String(data.mesEnvio).padStart(2, '0')}`

    // Preparar a URL da imagem (em um ambiente real, seria feito upload para um servidor)
    const imagemUrl = data.incluirImagem && imagePreview ? imagePreview : undefined

    if (selectedTemplate) {
      // Lógica para atualizar template
      const updatedTemplates: TemplateComemorativos[] = templates.map(t => 
        t.id === selectedTemplate.id ? {
          ...t,
          titulo: data.titulo,
          dataComemorativa: data.dataComemorativa,
          mensagem: data.mensagem,
          diaEnvio: data.dataComemorativa === 'aniversario' ? 0 : data.diaEnvio,
          mesEnvio: data.dataComemorativa === 'aniversario' ? 0 : data.mesEnvio,
          dataEnvio: dataEnvioFormatada,
          filtroGenero: data.filtroGenero,
          apenasAtivos: data.apenasAtivos,
          incluirImagem: data.incluirImagem,
          categoria: data.categoria,
          canal: data.canal,
          descricao: data.descricao,
          imagemUrl: imagemUrl,
          status: 'agendado' as 'rascunho' | 'agendado' | 'enviado'
        } : t
      ) as TemplateComemorativos[];
      
      setTemplates(updatedTemplates);
      
      // Salvar no localStorage
      try {
        // Garantir que apenas os campos necessários para a página de contatos sejam salvos
        const templatesParaContatos = updatedTemplates.map(t => ({
          id: t.id,
          titulo: t.titulo,
          dataComemorativa: t.dataComemorativa,
          mensagem: t.mensagem,
          filtroGenero: t.filtroGenero,
          apenasAtivos: t.apenasAtivos,
          ativo: t.ativo
        }));
        localStorage.setItem('templatesAtivos', JSON.stringify(templatesParaContatos));
      } catch (error) {
        console.error('Erro ao salvar templates no localStorage:', error);
      }

      toast({
        title: "Template atualizado",
        description: `O template "${data.titulo}" foi atualizado com sucesso!`,
      })
    } else {
      // Lógica para criar template
      const newTemplate: TemplateComemorativos = {
        id: Date.now(),
        titulo: data.titulo,
        dataComemorativa: data.dataComemorativa,
        mensagem: data.mensagem,
        diaEnvio: data.dataComemorativa === 'aniversario' ? 0 : data.diaEnvio,
        mesEnvio: data.dataComemorativa === 'aniversario' ? 0 : data.mesEnvio,
        dataEnvio: dataEnvioFormatada,
        filtroGenero: data.filtroGenero,
        apenasAtivos: data.apenasAtivos,
        incluirImagem: data.incluirImagem,
        categoria: data.categoria,
        canal: data.canal,
        descricao: data.descricao,
        imagemUrl: imagemUrl,
        totalDestinatarios: 0,
        status: 'rascunho',
        ativo: data.ativo
      }
      
      setTemplates([...templates, newTemplate])
      
      toast({
        title: "Template criado",
        description: `O template "${data.titulo}" foi criado com sucesso!`,
      })
    }
    
    // Limpar os estados
    setSelectedImage(null)
    setImagePreview(null)
    setImageError(null)
    setOpenDialog(false)
  }

  // Função para editar um template existente
  const handleEditTemplate = (template: TemplateComemorativos) => {
    setSelectedTemplate(template)
    
    // Se o template tiver uma imagem, carregar a preview
    if (template.incluirImagem && template.imagemUrl) {
      setImagePreview(template.imagemUrl)
      
      // Criar um objeto File a partir da URL da imagem (simulação)
      // Em um ambiente real, você precisaria buscar o arquivo do servidor
      fetch(template.imagemUrl)
        .then(res => res.blob())
        .then(blob => {
          // Criar um arquivo a partir do blob
          const file = new File([blob], 'template-image.jpg', { type: 'image/jpeg' })
          setSelectedImage(file)
        })
        .catch(error => {
          console.error('Erro ao carregar imagem:', error)
          // Se houver erro, apenas mostramos a preview sem o objeto File
        })
    } else {
      setSelectedImage(null)
      setImagePreview(null)
    }
    
    form.reset({
      titulo: template.titulo,
      dataComemorativa: template.dataComemorativa,
      mensagem: template.mensagem,
      diaEnvio: template.diaEnvio,
      mesEnvio: template.mesEnvio,
      filtroGenero: template.filtroGenero,
      apenasAtivos: template.apenasAtivos,
      incluirImagem: template.incluirImagem,
      categoria: template.categoria,
      canal: 'whatsapp', // Definindo apenas WhatsApp como canal
      descricao: template.descricao,
      ativo: template.ativo
    })
    
    setOpenDialog(true)
  }

  // Função para duplicar um template
  const handleDuplicateTemplate = (template: TemplateComemorativos) => {
    const newTemplate: TemplateComemorativos = {
      ...template,
      id: templates.length + 1,
      titulo: `${template.titulo} (Cópia)`,
      ativo: false // Cópias começam desativadas
    } as TemplateComemorativos
    
    const updatedTemplates: TemplateComemorativos[] = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    
    // Salvar no localStorage para compartilhar com a página de contatos
    try {
      // Garantir que apenas os campos necessários para a página de contatos sejam salvos
      const templatesParaContatos = updatedTemplates.map(t => ({
        id: t.id,
        titulo: t.titulo,
        dataComemorativa: t.dataComemorativa,
        mensagem: t.mensagem,
        filtroGenero: t.filtroGenero,
        apenasAtivos: t.apenasAtivos,
        ativo: t.ativo
      }));
      localStorage.setItem('templatesAtivos', JSON.stringify(templatesParaContatos));
    } catch (error) {
      console.error('Erro ao salvar templates no localStorage:', error);
    }
    
    toast({
      title: "Template duplicado",
      description: `Uma cópia do template "${template.titulo}" foi criada com sucesso.`,
    })
  }

  // Função para alternar o status (ativo/inativo) de um template
  const handleToggleTemplateStatus = (template: TemplateComemorativos) => {
    // Atualizar o estado dos templates
    const updatedTemplates: TemplateComemorativos[] = templates.map(t => {
      if (t.id === template.id) {
        return { ...t, ativo: !t.ativo };
      }
      return t;
    }) as TemplateComemorativos[];
    
    // Atualizar o estado local
    setTemplates(updatedTemplates);
    
    // Salvar os templates no localStorage para compartilhar com outras páginas
    try {
      // Garantir que apenas os campos necessários para a página de contatos sejam salvos
      const templatesParaContatos = updatedTemplates.map(t => ({
        id: t.id,
        titulo: t.titulo,
        dataComemorativa: t.dataComemorativa,
        mensagem: t.mensagem,
        filtroGenero: t.filtroGenero,
        apenasAtivos: t.apenasAtivos,
        ativo: t.ativo
      }));
      localStorage.setItem('templatesAtivos', JSON.stringify(templatesParaContatos));
    } catch (error) {
      console.error('Erro ao salvar templates no localStorage:', error);
    }
    
    // Mostrar notificação de sucesso
    toast({
      title: template.ativo ? "Template desativado" : "Template ativado",
      description: `O template "${template.titulo}" foi ${template.ativo ? "desativado" : "ativado"} com sucesso. ${!template.ativo ? "Os contatos compatíveis serão atualizados automaticamente." : ""}`,
      variant: template.ativo ? "destructive" : "default",
    });
  }

  // Função para excluir um template
  const handleDeleteTemplate = (template: TemplateComemorativos) => {
    const updatedTemplates: TemplateComemorativos[] = templates.filter(t => t.id !== template.id);
    setTemplates(updatedTemplates);
    
    // Salvar no localStorage para compartilhar com a página de contatos
    try {
      // Garantir que apenas os campos necessários para a página de contatos sejam salvos
      const templatesParaContatos = updatedTemplates.map(t => ({
        id: t.id,
        titulo: t.titulo,
        dataComemorativa: t.dataComemorativa,
        mensagem: t.mensagem,
        filtroGenero: t.filtroGenero,
        apenasAtivos: t.apenasAtivos,
        ativo: t.ativo
      }));
      localStorage.setItem('templatesAtivos', JSON.stringify(templatesParaContatos));
    } catch (error) {
      console.error('Erro ao salvar templates no localStorage:', error);
    }
    
    toast({
      title: "Template excluído",
      description: `O template "${template.titulo}" foi excluído com sucesso.`,
      variant: "destructive",
    })
  }

  return (
    <AppLayout title="Templates">
      <div className="space-y-6">
        {/* Cabeçalho da página e ações */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Templates</h2>
            <p className="text-gray-600 mt-1">
              Crie e gerencie templates para aniversários e datas comemorativas com filtros automáticos
            </p>
          </div>
          
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            size="sm"
            onClick={() => setOpenDialog(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Novo Template
          </Button>
        </div>
        
        {/* Tabs para filtrar por status */}
        <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger 
              value="todos" 
              className={activeTab === 'todos' ? 'bg-white shadow-sm' : ''}
              onClick={() => setActiveTab('todos')}
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="aniversario" 
              className={activeTab === 'aniversario' ? 'bg-white shadow-sm' : ''}
              onClick={() => setActiveTab('aniversario')}
            >
              Aniversário
            </TabsTrigger>
            <TabsTrigger 
              value="rascunhos" 
              className={activeTab === 'rascunhos' ? 'bg-white shadow-sm' : ''}
              onClick={() => setActiveTab('rascunhos')}
            >
              Rascunhos
            </TabsTrigger>
            <TabsTrigger 
              value="agendados" 
              className={activeTab === 'agendados' ? 'bg-white shadow-sm' : ''}
              onClick={() => setActiveTab('agendados')}
            >
              Agendados
            </TabsTrigger>
            <TabsTrigger 
              value="enviados" 
              className={activeTab === 'enviados' ? 'bg-white shadow-sm' : ''}
              onClick={() => setActiveTab('enviados')}
            >
              Enviados
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Grade de templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-datazap-green" />
                    {template.incluirImagem && (
                      <Image className="h-4 w-4 text-blue-500" />
                    )}
                    <CardTitle className="text-lg">{template.titulo}</CardTitle>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant="outline">
                      {getDataComemorativaNome(template.dataComemorativa)}
                    </Badge>
                    {template.categoria && (
                      <Badge variant="outline" className="text-xs">
                        {template.categoria}
                      </Badge>
                    )}
                    {template.canal && (
                      <Badge variant={template.canal === 'whatsapp' ? 'default' : 'secondary'} className="mt-1">
                        {template.canal === 'whatsapp' ? 'WhatsApp' : 'Email'}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-xs mt-1">
                  {template.descricao ? template.descricao : `Envio: ${template.dataEnvio}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3 text-sm">
                <div className="flex flex-col md:flex-row gap-3">
                  {template.incluirImagem && template.imagemUrl && (
                    <div className="w-full md:w-1/3">
                      <div className="relative bg-gray-100 rounded-md overflow-hidden h-32">
                        <img 
                          src={template.imagemUrl} 
                          alt={template.titulo}
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/80 text-gray-700">
                            <Image className="h-3 w-3 mr-1" />
                            Imagem
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={`${template.incluirImagem && template.imagemUrl ? 'w-full md:w-2/3' : 'w-full'}`}>
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-100 min-h-[100px]">
                      <div 
                        className="text-sm text-gray-700"
                        dangerouslySetInnerHTML={{ 
                          __html: truncateText(applyPreviewVariables(template.mensagem))
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-datazap-green hover:bg-datazap-light-green/20"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={template.ativo ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}
                    onClick={() => handleToggleTemplateStatus(template)}
                  >
                    {template.ativo ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteTemplate(template)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Dialog para criar/editar template */}
        <Dialog open={openDialog} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? `Editar Template: ${selectedTemplate.titulo}` : 'Novo Template'}
              </DialogTitle>
              <DialogDescription>
                Crie templates para datas comemorativas com filtros automáticos de contatos
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Dia das Mães 2023" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dataComemorativa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Comemorativa</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a data comemorativa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="aniversario">Aniversário</SelectItem>
                            <SelectItem value="dia-das-maes">Dia das Mães</SelectItem>
                            <SelectItem value="dia-dos-pais">Dia dos Pais</SelectItem>
                            <SelectItem value="pascoa">Páscoa</SelectItem>
                            <SelectItem value="natal">Natal</SelectItem>
                            <SelectItem value="ano-novo">Ano Novo</SelectItem>
                            <SelectItem value="tiradentes">Tiradentes</SelectItem>
                            <SelectItem value="dia-do-trabalho">Dia do Trabalho</SelectItem>
                            <SelectItem value="independencia-do-brasil">Independência do Brasil</SelectItem>
                            <SelectItem value="proclamacao-da-republica">Proclamação da República</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('dataComemorativa') === 'aniversario' && (
                    <div className="space-y-4 col-span-2">
                      <FormField
                        control={form.control}
                        name="descricao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Input placeholder="Breve descrição" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="categoria"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoria</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || ''}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Profissional">Profissional</SelectItem>
                                  <SelectItem value="Pessoal">Pessoal</SelectItem>
                                  <SelectItem value="Comercial">Comercial</SelectItem>
                                  <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormItem>
                          <FormLabel>Canal</FormLabel>
                          <div className="flex items-center space-x-2 p-2 rounded-md bg-green-50 border border-green-100">
                            <div className="flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                                <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                                <path d="M12 17a5 5 0 0 1-5-5h10a5 5 0 0 1-5 5Z" />
                              </svg>
                            </div>
                            <div className="text-sm text-green-700">
                              <p>Todos os templates serão enviados via WhatsApp</p>
                            </div>
                          </div>
                        </FormItem>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.watch('dataComemorativa') !== 'aniversario' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="diaEnvio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dia de Envio</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={String(field.value)}
                                disabled={false}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Dia" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                    <SelectItem key={day} value={String(day)}>
                                      {day}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                            {false && (
                              <FormDescription className="text-xs text-amber-600">
                                Data preenchida automaticamente para {getDataComemorativaNome(form.watch('dataComemorativa'))}
                              </FormDescription>
                            )}
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mesEnvio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mês de Envio</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(value) => field.onChange(Number(value))}
                                value={String(field.value)}
                                disabled={false}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">Janeiro</SelectItem>
                                  <SelectItem value="2">Fevereiro</SelectItem>
                                  <SelectItem value="3">Março</SelectItem>
                                  <SelectItem value="4">Abril</SelectItem>
                                  <SelectItem value="5">Maio</SelectItem>
                                  <SelectItem value="6">Junho</SelectItem>
                                  <SelectItem value="7">Julho</SelectItem>
                                  <SelectItem value="8">Agosto</SelectItem>
                                  <SelectItem value="9">Setembro</SelectItem>
                                  <SelectItem value="10">Outubro</SelectItem>
                                  <SelectItem value="11">Novembro</SelectItem>
                                  <SelectItem value="12">Dezembro</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            {false && (
                              <FormDescription className="text-xs text-amber-600">
                                Mês preenchido automaticamente
                              </FormDescription>
                            )}
                            <FormDescription className="text-xs">
                              As mensagens serão enviadas anualmente nesta data
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />                    
                    </div>
                  ) : (
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-100 text-sm text-blue-700 md:col-span-2">
                      <p>Para templates de aniversário, a data será obtida automaticamente dos dados de cada contato.</p>
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="filtroGenero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Filtro de Gênero</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={['dia-das-maes', 'dia-dos-pais', 'natal', 'ano-novo', 'pascoa'].includes(form.watch('dataComemorativa'))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um filtro" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="todos">Todos os contatos</SelectItem>
                            <SelectItem value="masculino">Apenas homens</SelectItem>
                            <SelectItem value="feminino">Apenas mulheres</SelectItem>
                          </SelectContent>
                        </Select>
                        {['dia-das-maes', 'dia-dos-pais', 'natal', 'ano-novo', 'pascoa'].includes(form.watch('dataComemorativa')) ? (
                          <FormDescription className="text-xs text-amber-600">
                            Filtro de gênero preenchido automaticamente para {getDataComemorativaNome(form.watch('dataComemorativa'))}
                          </FormDescription>
                        ) : (
                          <FormDescription className="text-xs">
                            Selecione o filtro de gênero para os contatos que receberão esta mensagem
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="mensagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite a mensagem para envio" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      {form.watch('dataComemorativa') === 'aniversario' ? (
                        <FormDescription className="text-xs">
                          Use <code>{'{{nome}}'}</code>, <code>{'{{empresa}}'}</code>, <code>{'{{data_nascimento}}'}</code>, <code>{'{{tempo_empresa}}'}</code> como variáveis que serão substituídas automaticamente.
                        </FormDescription>
                      ) : (
                        <FormDescription className="text-xs">
                          Use {'{{nome}}'} para incluir o nome do contato na mensagem
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4 border rounded-md p-3">
                    <h4 className="text-sm font-medium">Opções adicionais</h4>
                    <FormField
                      control={form.control}
                      name="apenasAtivos"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm">
                              Apenas contatos ativos
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Enviar apenas para contatos marcados como ativos
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="incluirImagem"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked)
                                  if (!checked) {
                                    setSelectedImage(null)
                                    setImagePreview(null)
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm">
                                Incluir imagem
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Adicionar uma imagem à mensagem (JPG/PNG, máx. 2MB)
                              </FormDescription>
                            </div>
                          </div>
                          
                          {field.value && imageError && (
                            <p className="text-sm text-red-500 mt-2">{imageError}</p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.watch('incluirImagem') ? (
                    <div className="space-y-4 border rounded-md p-3">
                      <h4 className="text-sm font-medium">Detalhes da imagem</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          {imagePreview ? (
                            <div>
                              <p className="text-sm font-medium mb-1">Preview:</p>
                              <div className="border rounded-md p-2 bg-gray-50">
                                <img 
                                  src={imagePreview} 
                                  alt="Preview" 
                                  className="max-h-40 max-w-full object-contain" 
                                />
                              </div>
                              <div className="mt-2 flex space-x-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                  onClick={() => {
                                    document.getElementById('image-upload')?.click()
                                  }}
                                >
                                  Alterar imagem
                                </Button>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-500 hover:text-red-700 text-xs"
                                  onClick={() => {
                                    setSelectedImage(null)
                                    setImagePreview(null)
                                  }}
                                >
                                  Remover
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-sm text-gray-500">Selecione uma imagem para visualizar o preview</p>
                            </div>
                          )}
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 border rounded-md p-3 flex items-center justify-center">
                      <p className="text-sm text-gray-500">Ative a opção "Incluir imagem" para adicionar uma imagem ao template</p>
                    </div>
                  )}
                </div>
                
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {selectedTemplate ? 'Salvar alterações' : 'Criar template'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

export default TemplatesComemorativosPage