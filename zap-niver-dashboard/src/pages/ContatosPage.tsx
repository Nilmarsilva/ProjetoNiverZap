import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { cn } from '@/lib/store/utils'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
  DialogTitle
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { 
  UserPlus, 
  Search, 
  MoreHorizontal, 
  Edit,
  Trash2,
  Eye,
  Calendar as CalendarIcon,
  Filter,
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  X,
  Save
} from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

// Componente DatePicker personalizado
function DatePicker({ date, setDate }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          {date ? format(date, "dd/MM/yyyy") : "Selecione uma data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// Função para classificar gênero com base no nome
const classifyGenderByName = (name) => {
  // Lista de nomes masculinos comuns no Brasil
  const maleNames = [
    'joão', 'josé', 'antônio', 'francisco', 'carlos', 'paulo', 'pedro', 'lucas', 
    'luiz', 'marcos', 'luis', 'gabriel', 'rafael', 'daniel', 'marcelo', 
    'bruno', 'eduardo', 'felipe', 'rodrigo', 'manoel', 'roberto', 'ricardo', 
    'diego', 'fernando', 'andré', 'fábio', 'leonardo', 'gustavo', 'guilherme', 
    'leandro', 'tiago', 'anderson', 'jorge', 'alex', 'renato', 'thiago', 
    'alexandre', 'ivan', 'wilson', 'cesar', 'alan', 'nelson', 'edson', 'mario',
    'vitor', 'mateus', 'david', 'rogério', 'claudio', 'samuel', 'ronaldo',
    'alberto', 'silvio', 'joaquim', 'henrique', 'evandro', 'flávio', 'geraldo',
    'adriano', 'valdir', 'milton', 'caio', 'augusto', 'raul', 'wagner', 'julio',
    'rubens', 'gilberto', 'adilson', 'jair', 'nilton', 'benedito', 'raimundo',
    'sebastião', 'davi', 'reginaldo', 'elias', 'mauro', 'arnaldo', 'sergio',
    'otavio', 'hugo', 'vinicius', 'douglas', 'osvaldo', 'joel'
  ];
  
  // Lista de nomes femininos comuns no Brasil
  const femaleNames = [
    'maria', 'ana', 'francisca', 'antônia', 'adriana', 'juliana', 'márcia', 
    'fernanda', 'patricia', 'aline', 'sandra', 'camila', 'amanda', 'bruna', 
    'jéssica', 'leticia', 'julia', 'luciana', 'vanessa', 'mariana', 'gabriela', 
    'vera', 'vitória', 'larissa', 'mônica', 'cristina', 'daniela', 'carolina', 
    'beatriz', 'lúcia', 'rita', 'claudia', 'fátima', 'regina', 'aparecida', 
    'renata', 'rosa', 'eliane', 'silvia', 'isabela', 'carla', 'alice', 'manuela',
    'giovanna', 'helena', 'valentina', 'isadora', 'lívia', 'cecília', 'lara',
    'heloísa', 'melissa', 'eduarda', 'clara', 'bianca', 'rafaela', 'yasmin',
    'laura', 'luiza', 'nicole', 'sophia', 'rebeca', 'eloá', 'joana', 'catarina',
    'mirella', 'emanuelly', 'mariane', 'paloma', 'sabrina', 'cintia', 'stefany',
    'marta', 'simone', 'rosana', 'elisa', 'andreia', 'raquel', 'milena', 'sueli',
    'priscila', 'viviane', 'tatiana', 'solange', 'daiane', 'marlize', 'roberta'
  ];
  
  // Extrair o primeiro nome
  const firstName = name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Verificar se o nome está nas listas
  if (maleNames.includes(firstName)) {
    return 'masculino';
  } else if (femaleNames.includes(firstName)) {
    return 'feminino';
  } else {
    // Se não conseguir classificar, retorna 'nao-informado'
    return 'nao-informado';
  }
};

/**
 * Schema de validação para uma data comemorativa
 */
const dataComemorativaSchema = z.object({
  tipo: z.enum(['aniversario', 'dia-das-maes', 'dia-dos-pais', 'pascoa', 'natal', 'ano-novo', 'tiradentes', 'dia-do-trabalho', 'independencia-do-brasil', 'proclamacao-da-republica', 'outro'], {
    required_error: "Tipo de data é obrigatório",
  }),
  data: z.date({
    required_error: "Data é obrigatória",
  }),
  observacao: z.string().optional(),
})

/**
 * Schema de validação para o formulário de contato
 */
const contatoFormSchema = z.object({
  nome: z.string().min(3, {
    message: "Nome deve ter pelo menos 3 caracteres",
  }),
  telefone: z.string().min(10, {
    message: "Telefone inválido",
  }),
  email: z.string().email({
    message: "Email inválido",
  }),
  dataNascimento: z.date({
    required_error: "Data de nascimento é obrigatória",
  }),
  datasComemorativas: z.array(dataComemorativaSchema).optional(),
  genero: z.enum(["masculino", "feminino", "outro", "nao-informado"], {
    required_error: "Selecione um gênero",
  }).default("nao-informado"),
  ativo: z.boolean().default(true),
  canalPreferido: z.enum(["whatsapp", "email"], {
    required_error: "Selecione um canal preferido",
  }),
  grupo: z.string().optional(),
})

type ContatoFormValues = z.infer<typeof contatoFormSchema>

/**
 * Tipo para representar uma data comemorativa
 */
interface DataComemorativa {
  tipo: 'aniversario' | 'dia-das-maes' | 'dia-dos-pais' | 'pascoa' | 'natal' | 'ano-novo' | 'tiradentes' | 'dia-do-trabalho' | 'independencia-do-brasil' | 'proclamacao-da-republica' | 'outro'
  data: string
  observacao?: string
}

/**
 * Tipo para representar um contato
 */
interface Contato {
  id: number
  nome: string
  telefone: string
  email: string
  dataNascimento: string // Mantido para compatibilidade
  datasComemorativas: DataComemorativa[] // Nova propriedade para múltiplas datas
  genero: 'masculino' | 'feminino' | 'outro' | 'nao-informado' // Campo para filtrar por gênero
  ativo: boolean // Campo para marcar contatos ativos/inativos
  canalPreferido: 'whatsapp' | 'email'
  grupo: string
}
interface FormValues {
  nome: string;
  telefone: string;
  email: string;
  dataNascimento: Date;
  genero: string;
  grupo: string;
  canalPreferido: string;
  ativo: boolean;
  datasComemorativas: {
    tipo: 'aniversario' | 'dia-das-maes' | 'dia-dos-pais' | 'pascoa' | 'natal' | 'ano-novo' | 'tiradentes' | 'dia-do-trabalho' | 'independencia-do-brasil' | 'proclamacao-da-republica' | 'outro';
    data: Date;
    observacao: string;
  }[];
}

/**
 * ContatosPage
 * 
 * Página de gerenciamento de contatos
 * Lista, busca e permite ações em contatos
 */
const ContatosPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [openDialog, setOpenDialog] = useState(false)
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false)
  const [openImportDialog, setOpenImportDialog] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStatus, setImportStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [importedContacts, setImportedContacts] = useState<Contato[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedContato, setSelectedContato] = useState<Contato | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list')
  const [filtroGrupo, setFiltroGrupo] = useState<string>('')
  const [filtroMesAniversario, setFiltroMesAniversario] = useState<string>('')
  const { toast } = useToast()
  const isMobile = useIsMobile()

  // Configuração do formulário de contato
  const form = useForm<ContatoFormValues>({
    resolver: zodResolver(contatoFormSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      email: '',
      canalPreferido: 'whatsapp',
      grupo: '',
      datasComemorativas: [],
    },
  })

  // Reset do formulário quando abrir ou fechar o dialog
  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setSelectedContato(null)
    }
    setOpenDialog(open)
  }

  // Importação dos tipos de templates para integração
  interface TemplateComemorativos {
    id: number
    titulo: string
    dataComemorativa: 'aniversario' | 'dia-das-maes' | 'dia-dos-pais' | 'pascoa' | 'natal' | 'ano-novo' | 'tiradentes' | 'dia-do-trabalho' | 'independencia-do-brasil' | 'proclamacao-da-republica' | 'outro'
    mensagem: string
    ativo: boolean
    filtroGenero: 'todos' | 'masculino' | 'feminino' | 'outro'
    apenasAtivos: boolean
  }

  // Estado para armazenar os templates ativos
  const [templatesAtivos, setTemplatesAtivos] = useState<TemplateComemorativos[]>([
    {
      id: 1,
      titulo: 'Dia das Mães',
      dataComemorativa: 'dia-das-maes',
      mensagem: 'Feliz Dia das Mães! Agradecemos por todo seu carinho e dedicação.',
      filtroGenero: 'feminino',
      apenasAtivos: true,
      ativo: true
    },
    {
      id: 2,
      titulo: 'Dia dos Pais',
      dataComemorativa: 'dia-dos-pais',
      mensagem: 'Feliz Dia dos Pais! Agradecemos por todo seu carinho e dedicação.',
      filtroGenero: 'masculino',
      apenasAtivos: true,
      ativo: true
    },
    {
      id: 3,
      titulo: 'Natal',
      dataComemorativa: 'natal',
      mensagem: 'Feliz Natal! Desejamos um feliz natal e próspero ano novo.',
      filtroGenero: 'todos',
      apenasAtivos: true,
      ativo: false
    },
    {
      id: 5,
      titulo: 'Aniversário',
      dataComemorativa: 'aniversario',
      mensagem: 'Feliz Aniversário! Desejamos muitas felicidades e sucesso.',
      filtroGenero: 'todos',
      apenasAtivos: true,
      ativo: true
    }
  ])
  
  // Carregar templates do localStorage quando a página for carregada
  useEffect(() => {
    try {
      const templatesFromStorage = localStorage.getItem('templatesAtivos');
      if (templatesFromStorage) {
        const parsedTemplates = JSON.parse(templatesFromStorage);
        setTemplatesAtivos(parsedTemplates);
      }
    } catch (error) {
      console.error('Erro ao carregar templates do localStorage:', error);
    }
  }, [])

  // Função para obter as datas comemorativas baseadas nos templates ativos
  const getDatasComemorativasFromTemplates = (contato: Contato): DataComemorativa[] => {
    // Datas comemorativas já existentes no contato
    const datasExistentes = [...contato.datasComemorativas];
    
    // Verifica quais templates ativos se aplicam a este contato
    templatesAtivos.forEach(template => {
      if (template.ativo) {
        // Verifica se o filtro de gênero do template se aplica ao contato
        const generoCompativel = 
          template.filtroGenero === 'todos' || 
          template.filtroGenero === contato.genero;
        
        // Verifica se o contato está ativo (se o template exigir apenas contatos ativos)
        const ativoCompativel = 
          !template.apenasAtivos || contato.ativo;
        
        // Se o template for compatível com o contato
        if (generoCompativel && ativoCompativel) {
          // Verifica se o contato já tem esta data comemorativa
          const jaExiste = datasExistentes.some(data => data.tipo === template.dataComemorativa);
          
          // Se não existir, adiciona
          if (!jaExiste) {
            // Determina a data apropriada para o tipo de evento
            let dataEvento = new Date();
            const anoAtual = new Date().getFullYear();
            
            switch(template.dataComemorativa) {
              case 'dia-das-maes':
                // Segundo domingo de maio
                dataEvento = new Date(anoAtual, 4, 1); // 1º de maio
                // Encontrar o segundo domingo
                const diasAteSegundoDomingo = (7 - dataEvento.getDay()) % 7 + 7;
                dataEvento.setDate(dataEvento.getDate() + diasAteSegundoDomingo);
                break;
              case 'dia-dos-pais':
                // Segundo domingo de agosto
                dataEvento = new Date(anoAtual, 7, 1); // 1º de agosto
                // Encontrar o segundo domingo
                const diasAteSegundoDomingoPais = (7 - dataEvento.getDay()) % 7 + 7;
                dataEvento.setDate(dataEvento.getDate() + diasAteSegundoDomingoPais);
                break;
              case 'pascoa':
                // Aproximação para Páscoa (geralmente em março/abril)
                dataEvento = new Date(anoAtual, 3, 10); // Aproximação para abril
                break;
              case 'natal':
                dataEvento = new Date(anoAtual, 11, 25); // 25 de dezembro
                break;
              case 'ano-novo':
                dataEvento = new Date(anoAtual, 0, 1); // 1º de janeiro
                break;
              case 'aniversario':
                // Usar a data de nascimento do contato
                const [dia, mes, ano] = contato.dataNascimento.split('/').map(Number);
                dataEvento = new Date(anoAtual, mes - 1, dia);
                break;
              default:
                dataEvento = new Date();
            }
            
            // Formatar a data para string
            const dataFormatada = format(dataEvento, 'dd/MM/yyyy');
            
            // Adicionar a nova data comemorativa
            datasExistentes.push({
              tipo: template.dataComemorativa,
              data: dataFormatada,
              observacao: `Adicionado automaticamente pelo template: ${template.titulo}`
            });
          }
        }
      }
    });
    
    return datasExistentes;
  };

  // Dados de exemplo para a tabela
  const [contatos, setContatos] = useState<Contato[]>([
    { 
      id: 1, 
      nome: 'Ana Silva', 
      telefone: '(11) 98765-4321', 
      email: 'ana.silva@email.com', 
      dataNascimento: '15/03/1985', 
      datasComemorativas: [
        { tipo: 'aniversario', data: '15/03/1985' },
        { tipo: 'dia-das-maes', data: '14/05/2023' }
      ],
      genero: 'feminino',
      ativo: true,
      canalPreferido: 'whatsapp', 
      grupo: 'Cliente' 
    },
    { 
      id: 2, 
      nome: 'Marlize Laboissiere Silva', 
      telefone: '(31) 98239-6966', 
      email: 'marlizesilva@email.com', 
      dataNascimento: '13/08/1968', 
      datasComemorativas: [
        { tipo: 'aniversario', data: '13/08/1968' },
        { tipo: 'dia-das-maes', data: '14/05/2023' }
      ],
      genero: 'feminino',
      ativo: true,
      canalPreferido: 'whatsapp', 
      grupo: 'Cliente' 
    },
    { 
      id: 3, 
      nome: 'Carlos Santos', 
      telefone: '(11) 97654-3210', 
      email: 'carlos.santos@email.com', 
      dataNascimento: '22/07/1990', 
      datasComemorativas: [
        { tipo: 'aniversario', data: '22/07/1990' },
        { tipo: 'dia-dos-pais', data: '13/08/2023' }
      ],
      genero: 'masculino',
      ativo: true,
      canalPreferido: 'whatsapp', 
      grupo: 'Fornecedor' 
    },
    { 
      id: 4, 
      nome: 'Mariana Oliveira', 
      telefone: '(11) 96543-2109', 
      email: 'mariana.oliveira@email.com', 
      dataNascimento: '10/12/1988', 
      datasComemorativas: [
        { tipo: 'aniversario', data: '10/12/1988' },
        { tipo: 'natal', data: '25/12/2023' }
      ],
      genero: 'feminino',
      ativo: true,
      canalPreferido: 'whatsapp', 
      grupo: 'Cliente' 
    },
    { 
      id: 5, 
      nome: 'Pedro Almeida', 
      telefone: '(11) 95432-1098', 
      email: 'pedro.almeida@email.com', 
      dataNascimento: '05/09/1992', 
      datasComemorativas: [
        { tipo: 'aniversario', data: '05/09/1992' },
        { tipo: 'ano-novo', data: '01/01/2024' }
      ],
      genero: 'masculino',
      ativo: true,
      canalPreferido: 'whatsapp', 
      grupo: 'Parceiro' 
    },
    { 
      id: 6, 
      nome: 'Juliana Costa', 
      telefone: '(11) 94321-0987', 
      email: 'juliana.costa@email.com', 
      dataNascimento: '18/06/1995', 
      datasComemorativas: [
        { tipo: 'aniversario', data: '18/06/1995' },
        { tipo: 'pascoa', data: '09/04/2023' }
      ],
      genero: 'feminino',
      ativo: false,
      canalPreferido: 'whatsapp', 
      grupo: 'Cliente' 
    },
    { 
      id: 7, 
      nome: 'Roberto Ferreira', 
      telefone: '(11) 93210-9876', 
      email: 'roberto.ferreira@email.com', 
      dataNascimento: '30/11/1980', 
      datasComemorativas: [
        { tipo: 'aniversario', data: '30/11/1980' },
        { tipo: 'dia-dos-pais', data: '13/08/2023' }
      ],
      genero: 'masculino',
      ativo: true,
      canalPreferido: 'whatsapp', 
      grupo: 'Fornecedor' 
    },
    { 
      id: 8, 
      nome: 'Camila Rodrigues', 
      telefone: '(11) 92109-8765', 
      email: 'camila.rodrigues@email.com', 
      dataNascimento: '25/04/1993', 
      datasComemorativas: [
        { tipo: 'aniversario', data: '25/04/1993' },
        { tipo: 'dia-das-maes', data: '14/05/2023' }
      ],
      genero: 'feminino',
      ativo: true,
      canalPreferido: 'whatsapp', 
      grupo: 'Cliente' 
    }
  ])

  // Opções de grupos para o select
  const gruposOptions = ['Cliente', 'Parceiro', 'Fornecedor', 'Outro']
  
  // Opções de tipos de datas comemorativas
  const tipoDataOptions = [
    { value: 'aniversario', label: 'Aniversário' },
    { value: 'dia-dos-pais', label: 'Dia dos Pais' },
    { value: 'dia-das-maes', label: 'Dia das Mães' },
    { value: 'pascoa', label: 'Páscoa' },
    { value: 'natal', label: 'Natal' },
    { value: 'ano-novo', label: 'Ano Novo' },
    { value: 'outro', label: 'Outro' },
  ]
  
  // Opções de meses para o filtro
  const mesesOptions = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ]

  // Handler para envio do formulário
  const onSubmit = (data: ContatoFormValues) => {
    if (selectedContato) {
      // Formatar a data de nascimento
      const dataNascimento = format(data.dataNascimento, 'dd/MM/yyyy');
      
      // Formatar as datas comemorativas
      const datasComemorativas = data.datasComemorativas?.map(dc => ({
        tipo: dc.tipo,
        data: format(dc.data, 'dd/MM/yyyy'),
        observacao: dc.observacao
      })) || [];
      
      // Atualizar o contato com os novos dados
      const contatoAtualizado: Contato = {
        ...selectedContato,
        nome: data.nome,
        telefone: data.telefone,
        email: data.email,
        dataNascimento: dataNascimento,
        datasComemorativas: datasComemorativas,
        genero: data.genero as 'masculino' | 'feminino' | 'outro' | 'nao-informado',
        ativo: data.ativo,
        canalPreferido: data.canalPreferido as 'whatsapp' | 'email',
        grupo: data.grupo
      };
      
      // Atualizar o contato na lista
      const novosContatos = contatos.map(c => 
        c.id === selectedContato.id ? contatoAtualizado : c
      );
      setContatos(novosContatos);
      
      // Atualizar o contato selecionado para mostrar os dados atualizados
      setSelectedContato(contatoAtualizado);
      
      // Exibir mensagem de sucesso
      toast({
        title: "Contato atualizado",
        description: `${data.nome} foi atualizado com sucesso!`,
      });
    } else {
      // Lógica para criar contato
      toast({
        title: "Contato adicionado",
        description: `${data.nome} foi adicionado com sucesso!`,
      });
    }
    
    // Desativar o modo de edição mas manter na visualização de detalhes
    setIsEditing(false);
  }

  // Funções para lidar com ações nos contatos
  const handleEditContato = (contato: Contato) => {
    setSelectedContato(contato)
    form.setValue('nome', contato.nome)
    form.setValue('email', contato.email)
    form.setValue('telefone', contato.telefone)
    form.setValue('canalPreferido', contato.canalPreferido)
    form.setValue('grupo', contato.grupo)
    form.setValue('genero', contato.genero)
    form.setValue('ativo', contato.ativo)
    
    // Converter string para objeto Date para a data de nascimento
    const [dia, mes, ano] = contato.dataNascimento.split('/').map(Number)
    form.setValue('dataNascimento', new Date(ano, mes - 1, dia))
    
    // Converter e carregar as datas comemorativas
    if (contato.datasComemorativas && contato.datasComemorativas.length > 0) {
      const datasConvertidas = contato.datasComemorativas.map(data => {
        // Verificar se o tipo é válido
        const tipoValido = [
          'aniversario', 'dia-dos-pais', 'dia-das-maes', 
          'pascoa', 'natal', 'ano-novo', 'outro'
        ].includes(data.tipo) ? data.tipo as 'aniversario' | 'dia-dos-pais' | 'dia-das-maes' | 'pascoa' | 'natal' | 'ano-novo' | 'outro' : 'outro';
        
        // Converter a data de string para Date se necessário
        let dataObj: Date;
        if (typeof data.data === 'string') {
          const [diaData, mesData, anoData] = data.data.split('/').map(Number);
          dataObj = new Date(anoData || new Date().getFullYear(), mesData - 1, diaData);
        } else if (data.data && typeof data.data === 'object' && 'getMonth' in data.data) {
          // Verifica se é um objeto Date (tem o método getMonth)
          dataObj = data.data as Date;
        } else {
          dataObj = new Date();
        }
        
        return {
          tipo: tipoValido,
          data: dataObj,
          observacao: data.observacao || ''
        };
      });
      
      form.setValue('datasComemorativas', datasConvertidas);
    } else {
      form.setValue('datasComemorativas', []);
    }
    
    // Ativar o modo de edição na visualização de detalhes
    setIsEditing(true)
    
    // Garantir que estamos na visualização de detalhes
    setViewMode('details')
  }

  const handleDeleteContato = (contato: Contato) => {
    // Lógica para deletar contato 
    toast({
      title: "Contato removido",
      description: `${contato.nome}

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setIsEditing(false);
  }; foi removido com sucesso!`,
      variant: "destructive",
    })
  }

  const handleViewDetails = (contato: Contato) => {
    setSelectedContato(contato)
    setViewMode('details')
  }

  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setIsEditing(false)
  }
  

  // Função para aplicar filtros
  const applyFilters = () => {
    // Lógica para aplicar os filtros
    toast({
      title: "Filtros aplicados",
      description: "A lista de contatos foi atualizada conforme os filtros",
    })
    setOpenFilterDrawer(false)
  }

  // Filtrando contatos com base na busca e filtros
  const filteredContatos = contatos.filter(contato => {
    const matchSearch = contato.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contato.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contato.telefone.includes(searchTerm)
    
    const matchGrupo = filtroGrupo ? contato.grupo === filtroGrupo : true
    
    // Lógica para filtrar por mês de aniversário
    const matchMes = filtroMesAniversario 
      ? contato.dataNascimento.split('/')[1] === filtroMesAniversario.padStart(2, '0')
      : true
    
    return matchSearch && matchGrupo && matchMes
  })

  // Configuração de paginação
  const totalPages = Math.ceil(filteredContatos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedContatos = filteredContatos.slice(startIndex, startIndex + itemsPerPage)

  return (
    <AppLayout title="Contatos">
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* Cabeçalho da página e ações */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Contatos</h2>
              <p className="text-gray-600 mt-1">
                Gerencie seus contatos para envio de mensagens
              </p>
            </div>
            
            <div className="flex gap-2">
              {/* Botão de filtros temporariamente removido
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setOpenFilterDrawer(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              */}
              
              <Button 
                className="bg-datazap-green hover:bg-datazap-green/90"
                onClick={() => setOpenImportDialog(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Contatos
              </Button>
              
              <Button 
                className="bg-datazap-green hover:bg-datazap-green/90" 
                onClick={() => setOpenDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Contato
              </Button>
            </div>
          </div>
          
          {/* Barra de busca */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Buscar contatos..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Tabela de contatos */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Datas Comemorativas</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Classificação</TableHead>
                  <TableHead className="w-[60px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContatos.map((contato) => (
                  <TableRow key={contato.id}>
                    <TableCell className="font-medium">{contato.nome}</TableCell>
                    <TableCell>{contato.telefone}</TableCell>
                    <TableCell>{contato.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {/* Combina as datas existentes com as dos templates ativos */}
                        {(() => {
                          // Obter todas as datas comemorativas aplicáveis a este contato
                          const todasDatas = getDatasComemorativasFromTemplates(contato);
                          
                          return todasDatas.length > 0 ? (
                            todasDatas.map((data, idx) => {
                              const tipoData = tipoDataOptions.find(opt => opt.value === data.tipo);
                              const bgColor = 
                                data.tipo === 'aniversario' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                data.tipo === 'dia-dos-pais' ? 'bg-green-100 text-green-800 border-green-300' :
                                data.tipo === 'dia-das-maes' ? 'bg-pink-100 text-pink-800 border-pink-300' :
                                data.tipo === 'pascoa' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                data.tipo === 'natal' ? 'bg-red-100 text-red-800 border-red-300' :
                                data.tipo === 'ano-novo' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                                'bg-gray-100 text-gray-800 border-gray-300';
                              
                              // Verificar se esta data vem de um template ativo
                              const vemDeTemplateAtivo = templatesAtivos.some(t => 
                                t.ativo && t.dataComemorativa === data.tipo &&
                                (t.filtroGenero === 'todos' || t.filtroGenero === contato.genero)
                              );
                              
                              // Adicionar borda pontilhada se vier de template ativo
                              const borderStyle = vemDeTemplateAtivo ? 'border-dashed' : '';
                              
                              // Formatar a data para exibição
                              let dataFormatada = '';
                              try {
                                if (typeof data.data === 'string') {
                                  dataFormatada = data.data;
                                } else if (data.data && typeof data.data === 'object' && 'getMonth' in data.data) {
                                  // Verifica se é um objeto Date (tem o método getMonth)
                                  dataFormatada = format(data.data as Date, 'dd/MM/yyyy');
                                }
                              } catch (error) {
                                dataFormatada = 'Data inválida';
                              }
                              
                              return (
                                <div 
                                  key={idx} 
                                  className={`text-xs px-2 py-1 rounded-full border ${borderStyle} ${bgColor} flex items-center`}
                                  title={`${tipoData?.label || data.tipo}: ${dataFormatada}${vemDeTemplateAtivo ? ' (Aplicado automaticamente)' : ''}`}
                                >
                                  {tipoData?.label || data.tipo}
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-gray-400 text-xs italic">Nenhuma data cadastrada</span>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contato.genero === 'masculino' ? 'Masculino' : 
                       contato.genero === 'feminino' ? 'Feminino' : 
                       contato.genero === 'outro' ? 'Outro' : 'Não informado'}
                    </TableCell>
                    <TableCell>
                      {contato.ativo ? 
                        <span className="text-green-600 font-medium">Ativo</span> : 
                        <span className="text-red-600 font-medium">Inativo</span>}
                    </TableCell>
                    <TableCell>{contato.canalPreferido === 'whatsapp' ? 'WhatsApp' : ''}</TableCell>
                    <TableCell>{contato.grupo}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(contato)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detalhes
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteContato(contato)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                
                {paginatedContatos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      Nenhum contato encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  />
                </PaginationItem>
                
                {Array.from({length: Math.min(totalPages, 5)}).map((_, i) => {
                  const page = i + 1
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}
                
                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink 
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
          
          {/* Dialog de Importação de Contatos */}
          <Dialog open={openImportDialog} onOpenChange={(open) => {
            if (!open) {
              setImportStatus('idle');
              setImportErrors([]);
              setImportProgress(0);
              setImportedContacts([]);
            }
            setOpenImportDialog(open);
          }}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Importar Contatos em Lote</DialogTitle>
                <DialogDescription>
                  Importe seus contatos a partir de arquivos CSV ou Excel.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {importStatus === 'idle' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="font-medium">Modelos de Exemplo</div>
                        <p className="text-sm text-gray-500">
                          Baixe um dos modelos abaixo para ver o formato esperado dos arquivos.
                        </p>
                        
                        <div className="space-y-3">
                          <a 
                            href="/modelos/modelo_contatos_csv.csv" 
                            download
                            className="flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <FileText className="h-5 w-5 mr-3 text-blue-500" />
                            <div>
                              <div className="font-medium">Modelo CSV</div>
                              <div className="text-xs text-gray-500">Formato de texto separado por vírgulas</div>
                            </div>
                            <Download className="h-4 w-4 ml-auto text-gray-400" />
                          </a>
                          
                          <a 
                            href="/modelos/modelo_contatos_excel.xlsx" 
                            download
                            className="flex items-center p-3 border rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <FileSpreadsheet className="h-5 w-5 mr-3 text-green-500" />
                            <div>
                              <div className="font-medium">Modelo Excel</div>
                              <div className="text-xs text-gray-500">Formato de planilha Excel</div>
                            </div>
                            <Download className="h-4 w-4 ml-auto text-gray-400" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="font-medium">Carregar Arquivo</div>
                        <p className="text-sm text-gray-500">
                          Selecione um arquivo CSV ou Excel (.xlsx) para importar seus contatos.
                        </p>
                        
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 h-[150px]">
                          <input
                            type="file"
                            ref={fileInputRef}
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              const fileExtension = file.name.split('.').pop()?.toLowerCase();
                              
                              // Resetar estados
                              setImportStatus('processing');
                              setImportProgress(10);
                              setImportErrors([]);
                              setImportedContacts([]);
                              
                              if (fileExtension === 'csv') {
                                // Processar arquivo CSV
                                Papa.parse(file, {
                                  header: true,
                                  skipEmptyLines: true,
                                  complete: (results) => {
                                    const processImportedData = (data: any[]) => {
                                      setImportProgress(30);
                                      
                                      if (!data.length) {
                                        setImportStatus('error');
                                        setImportErrors(['O arquivo não contém dados.']);
                                        return;
                                      }
                                      
                                      const errors: string[] = [];
                                      const processedContacts: Contato[] = [];
                                      
                                      // Validar e converter os dados
                                      data.forEach((row, index) => {
                                        // Verificar campos obrigatórios
                                        if (!row.nome) {
                                          errors.push(`Linha ${index + 2}: Campo 'nome' é obrigatório.`);
                                          return;
                                        }
                                        if (!row.telefone) {
                                          errors.push(`Linha ${index + 2}: Campo 'telefone' é obrigatório.`);
                                          return;
                                        }
                                        // Email não é mais um campo obrigatório
                                        
                                        // Não classificar gênero automaticamente
                                         let genero = row.genero ? row.genero.toLowerCase() : 'nao-informado';
                                        // Gênero é classificado automaticamente, não precisa de validação
                                        
                                        // Validar canal preferido
                                        const canalPreferido = row.canalPreferido?.toLowerCase();
                                        if (canalPreferido && !['whatsapp', 'email'].includes(canalPreferido)) {
                                          errors.push(`Linha ${index + 2}: Valor inválido para 'canalPreferido'. Use: whatsapp ou email.`);
                                          return;
                                        }
                                        
                                        // Validar status ativo
                                        let ativo = true;
                                        if (row.ativo !== undefined) {
                                          if (typeof row.ativo === 'string') {
                                            ativo = row.ativo.toLowerCase() === 'true';
                                          } else if (typeof row.ativo === 'boolean') {
                                            ativo = row.ativo;
                                          }
                                        }
                                        
                                        // Criar objeto de contato
                                        // Formatar telefone para incluir código 55 se não estiver presente
                                         let telefoneFormatado = row.telefone.toString().replace(/\D/g, ''); // Remove caracteres não numéricos
                                         
                                         // Verificar se já tem o código do país (55)
                                         if (!telefoneFormatado.startsWith('55')) {
                                           // Se começar com 0, remover o 0
                                           if (telefoneFormatado.startsWith('0')) {
                                             telefoneFormatado = telefoneFormatado.substring(1);
                                           }
                                           // Adicionar o código 55
                                           telefoneFormatado = `55${telefoneFormatado}`;
                                         }
                                         
                                         const newContato: Contato = {
                                           id: contatos.length + processedContacts.length + 1,
                                           nome: row.nome,
                                           telefone: telefoneFormatado,
                                           email: '',
                                          dataNascimento: row.dataNascimento || '01/01/1970',
                                          datasComemorativas: [],
                                          genero: (genero as 'masculino' | 'feminino' | 'outro' | 'nao-informado') || 'nao-informado',
                                          ativo: true, // Todos os contatos importados são sempre ativos
                                          canalPreferido: 'whatsapp', // Padronizado para WhatsApp
                                          grupo: row.grupo || 'Cliente' // Grupo padrão é 'Cliente' quando não especificado
                                        };
                                        
                                        // Adicionar data de aniversário como data comemorativa
                                        if (row.dataNascimento) {
                                          newContato.datasComemorativas.push({
                                            tipo: 'aniversario',
                                            data: row.dataNascimento,
                                            observacao: ''
                                          });
                                        }
                                        
                                        processedContacts.push(newContato);
                                      });
                                      
                                      setImportProgress(70);
                                      
                                      // Verificar se há erros
                                      if (errors.length > 0) {
                                        setImportStatus('error');
                                        setImportErrors(errors);
                                        return;
                                      }
                                      
                                      // Finalizar importação com sucesso
                                      setImportedContacts(processedContacts);
                                      setImportProgress(100);
                                      setImportStatus('success');
                                    };
                                    processImportedData(results.data);
                                  },
                                  error: (error) => {
                                    setImportStatus('error');
                                    setImportErrors([`Erro ao processar o arquivo CSV: ${error.message}`]);
                                  }
                                });
                              } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
                                // Processar arquivo Excel
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  try {
                                    const data = e.target?.result;
                                    const workbook = XLSX.read(data, { type: 'binary' });
                                    const sheetName = workbook.SheetNames[0];
                                    const worksheet = workbook.Sheets[sheetName];
                                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                                    const processImportedData = (data: any[]) => {
                                      setImportProgress(30);
                                      
                                      if (!data.length) {
                                        setImportStatus('error');
                                        setImportErrors(['O arquivo não contém dados.']);
                                        return;
                                      }
                                      
                                      const errors: string[] = [];
                                      const processedContacts: Contato[] = [];
                                      
                                      // Validar e converter os dados
                                      data.forEach((row, index) => {
                                        // Verificar campos obrigatórios
                                        if (!row.nome) {
                                          errors.push(`Linha ${index + 2}: Campo 'nome' é obrigatório.`);
                                          return;
                                        }
                                        if (!row.telefone) {
                                          errors.push(`Linha ${index + 2}: Campo 'telefone' é obrigatório.`);
                                          return;
                                        }
                                        // Email não é mais um campo obrigatório
                                        
                                        // Não classificar gênero automaticamente
                                         let genero = row.genero ? row.genero.toLowerCase() : 'nao-informado';
                                        // Gênero é classificado automaticamente, não precisa de validação
                                        
                                        // Validar canal preferido
                                        const canalPreferido = row.canalPreferido?.toLowerCase();
                                        if (canalPreferido && !['whatsapp', 'email'].includes(canalPreferido)) {
                                          errors.push(`Linha ${index + 2}: Valor inválido para 'canalPreferido'. Use: whatsapp ou email.`);
                                          return;
                                        }
                                        
                                        // Validar status ativo
                                        let ativo = true;
                                        if (row.ativo !== undefined) {
                                          if (typeof row.ativo === 'string') {
                                            ativo = row.ativo.toLowerCase() === 'true';
                                          } else if (typeof row.ativo === 'boolean') {
                                            ativo = row.ativo;
                                          }
                                        }
                                        
                                        // Criar objeto de contato
                                        // Formatar telefone para incluir código 55 se não estiver presente
                                         let telefoneFormatado = row.telefone.toString().replace(/\D/g, ''); // Remove caracteres não numéricos
                                         
                                         // Verificar se já tem o código do país (55)
                                         if (!telefoneFormatado.startsWith('55')) {
                                           // Se começar com 0, remover o 0
                                           if (telefoneFormatado.startsWith('0')) {
                                             telefoneFormatado = telefoneFormatado.substring(1);
                                           }
                                           // Adicionar o código 55
                                           telefoneFormatado = `55${telefoneFormatado}`;
                                         }
                                         
                                         const newContato: Contato = {
                                           id: contatos.length + processedContacts.length + 1,
                                           nome: row.nome,
                                           telefone: telefoneFormatado,
                                           email: '',
                                          dataNascimento: row.dataNascimento || '01/01/1970',
                                          datasComemorativas: [],
                                          genero: (genero as 'masculino' | 'feminino' | 'outro' | 'nao-informado') || 'nao-informado',
                                          ativo: true, // Todos os contatos importados são sempre ativos
                                          canalPreferido: 'whatsapp', // Padronizado para WhatsApp
                                          grupo: row.grupo || 'Cliente' // Grupo padrão é 'Cliente' quando não especificado
                                        };
                                        
                                        // Adicionar data de aniversário como data comemorativa
                                        if (row.dataNascimento) {
                                          newContato.datasComemorativas.push({
                                            tipo: 'aniversario',
                                            data: row.dataNascimento,
                                            observacao: ''
                                          });
                                        }
                                        
                                        processedContacts.push(newContato);
                                      });
                                      
                                      setImportProgress(70);
                                      
                                      // Verificar se há erros
                                      if (errors.length > 0) {
                                        setImportStatus('error');
                                        setImportErrors(errors);
                                        return;
                                      }
                                      
                                      // Finalizar importação com sucesso
                                      setImportedContacts(processedContacts);
                                      setImportProgress(100);
                                      setImportStatus('success');
                                    };
                                    processImportedData(jsonData);
                                  } catch (error) {
                                    setImportStatus('error');
                                    setImportErrors([`Erro ao processar o arquivo Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`]);
                                  }
                                };
                                reader.onerror = () => {
                                  setImportStatus('error');
                                  setImportErrors(['Erro ao ler o arquivo Excel.']);
                                };
                                reader.readAsBinaryString(file);
                              } else {
                                setImportStatus('error');
                                setImportErrors(['Formato de arquivo não suportado. Use CSV ou Excel (.xlsx, .xls).']);
                              }
                            }}
                          />
                          <Button 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            className="mb-2"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar Arquivo
                          </Button>
                          <p className="text-xs text-gray-500">Formatos suportados: CSV, Excel (.xlsx, .xls)</p>
                        </div>
                      </div>
                    </div>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Importante</AlertTitle>
                      <AlertDescription>
                        Certifique-se de que seu arquivo segue o formato dos modelos. Os campos obrigatórios são apenas nome e telefone. O telefone será automaticamente formatado para incluir o código do país (55) para envio via WhatsApp. O gênero será classificado automaticamente com base no nome, e o grupo padrão será "Cliente" quando não especificado.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
                
                {importStatus === 'processing' && (
                  <div className="space-y-4 py-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Processando contatos...</span>
                      <span className="text-sm font-medium">{importProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-datazap-green h-2.5 rounded-full" 
                        style={{ width: `${importProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {importStatus === 'success' && (
                  <div className="space-y-4 py-4">
                    <Alert className="bg-green-50 border-green-200">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-600">Importação concluída</AlertTitle>
                      <AlertDescription>
                        {importedContacts.length} contatos foram importados com sucesso.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="max-h-[200px] overflow-y-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Gênero</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {importedContacts.map((contato, index) => (
                            <TableRow key={index}>
                              <TableCell>{contato.nome}</TableCell>
                              <TableCell>{contato.telefone}</TableCell>
                              <TableCell>{contato.genero}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
                {importStatus === 'error' && (
                  <div className="space-y-4 py-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Erro na importação</AlertTitle>
                      <AlertDescription>
                        Ocorreram erros durante a importação dos contatos.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="max-h-[200px] overflow-y-auto border rounded-md p-3 bg-red-50">
                      <ul className="list-disc pl-5 space-y-1">
                        {importErrors.map((error, index) => (
                          <li key={index} className="text-sm text-red-600">{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                {importStatus === 'idle' && (
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (importedContacts.length === 0) {
                        setImportStatus('error');
                        setImportErrors(['Nenhum contato para importar. Selecione um arquivo válido.']);
                        return;
                      }
                      
                      // Simular processamento
                      setImportStatus('processing');
                      setImportProgress(0);
                      
                      const interval = setInterval(() => {
                        setImportProgress(prev => {
                          if (prev >= 100) {
                            clearInterval(interval);
                            setImportStatus('success');
                            return 100;
                          }
                          return prev + 10;
                        });
                      }, 200);
                    }}
                    disabled={!importedContacts.length}
                  >
                    Importar Contatos
                  </Button>
                )}
                
                {importStatus === 'success' && (
                  <Button 
                    type="button" 
                    onClick={() => {
                      // Adicionar os contatos importados à lista atual
                      const newContatos = [...contatos, ...importedContacts];
                      setContatos(newContatos);
                      setOpenImportDialog(false);
                      toast({
                        title: "Contatos importados",
                        description: `${importedContacts.length} contatos foram importados com sucesso!`,
                      });
                    }}
                  >
                    Concluir Importação
                  </Button>
                )}
                
                {importStatus === 'error' && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setImportStatus('idle');
                      setImportErrors([]);
                    }}
                  >
                    Tentar Novamente
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Formulário em Dialog */}
          <Dialog open={openDialog} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedContato ? `Editar Contato: ${selectedContato.nome}` : 'Adicionar Novo Contato'}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados do contato abaixo.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dataNascimento"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de Nascimento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
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
                  
                  {/* Seção de Datas Comemorativas */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Datas Comemorativas</h3>
                      <div className="flex space-x-2">
                        <Select
                          onValueChange={(value) => {
                            const currentDatas = form.getValues().datasComemorativas || [];
                            
                            // Definir a data apropriada com base no tipo selecionado
                            let dataEvento = new Date();
                            const anoAtual = new Date().getFullYear();
                            
                            switch(value) {
                              case 'dia-das-maes':
                                // Segundo domingo de maio
                                dataEvento = new Date(anoAtual, 4, 1); // 1º de maio
                                // Encontrar o segundo domingo
                                const diasAteSegundoDomingo = (7 - dataEvento.getDay()) % 7 + 7;
                                dataEvento.setDate(dataEvento.getDate() + diasAteSegundoDomingo);
                                break;
                              case 'dia-dos-pais':
                                // Segundo domingo de agosto
                                dataEvento = new Date(anoAtual, 7, 1); // 1º de agosto
                                // Encontrar o segundo domingo
                                const diasAteSegundoDomingoPais = (7 - dataEvento.getDay()) % 7 + 7;
                                dataEvento.setDate(dataEvento.getDate() + diasAteSegundoDomingoPais);
                                break;
                              case 'pascoa':
                                // Aproximação para Páscoa (geralmente em março/abril)
                                dataEvento = new Date(anoAtual, 3, 10); // Aproximação para abril
                                break;
                              case 'natal':
                                dataEvento = new Date(anoAtual, 11, 25); // 25 de dezembro
                                break;
                              case 'ano-novo':
                                dataEvento = new Date(anoAtual, 0, 1); // 1º de janeiro
                                break;
                              case 'aniversario':
                                // Usar a data de nascimento do contato se disponível
                                const dataNascimento = form.getValues().dataNascimento;
                                if (dataNascimento) {
                                  dataEvento = new Date(dataNascimento);
                                  // Manter apenas dia e mês, atualizar para o ano atual
                                  dataEvento.setFullYear(anoAtual);
                                }
                                break;
                              default:
                                dataEvento = new Date();
                            }
                            
                            // Garantir que o tipo seja um dos valores válidos do enum
                            const tipoValido = [
                              'aniversario', 'dia-dos-pais', 'dia-das-maes', 
                              'pascoa', 'natal', 'ano-novo', 'outro'
                            ].includes(value) ? value as 'aniversario' | 'dia-dos-pais' | 'dia-das-maes' | 'pascoa' | 'natal' | 'ano-novo' | 'outro' : 'outro';
                            
                            form.setValue('datasComemorativas', [
                              ...currentDatas,
                              { tipo: tipoValido, data: dataEvento, observacao: '' }
                            ]);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Adicionar Data" />
                          </SelectTrigger>
                          <SelectContent>
                            {tipoDataOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentDatas = form.getValues().datasComemorativas || [];
                            // Usar o tipo 'outro' que é um valor válido do enum
                            const tipoOutro: 'aniversario' | 'dia-dos-pais' | 'dia-das-maes' | 'pascoa' | 'natal' | 'ano-novo' | 'outro' = 'outro';
                            form.setValue('datasComemorativas', [
                              ...currentDatas,
                              { tipo: tipoOutro, data: new Date(), observacao: '' }
                            ]);
                          }}
                        >
                          Adicionar Manualmente
                        </Button>
                      </div>
                    </div>

                    {(form.watch('datasComemorativas') || []).map((_, index) => (
                      <div key={index} className="space-y-4 p-4 border rounded-md relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => {
                            const currentDatas = form.getValues().datasComemorativas || [];
                            form.setValue(
                              'datasComemorativas',
                              currentDatas.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <FormField
                          control={form.control}
                          name={`datasComemorativas.${index}.tipo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Data</FormLabel>
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
                                  {tipoDataOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`datasComemorativas.${index}.data`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Data</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
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
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`datasComemorativas.${index}.observacao`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observação (opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Observações sobre esta data" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="grupo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grupo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Família, Trabalho, etc" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canalPreferido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Canal Preferido</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um canal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="grupo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grupo/Tag</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um grupo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {gruposOptions.map(grupo => (
                              <SelectItem key={grupo} value={grupo}>
                                {grupo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Categoria ou grupo do contato
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button type="submit">
                      {selectedContato ? 'Atualizar Contato' : 'Adicionar Contato'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Drawer para filtros em telas menores */}
          <Drawer open={openFilterDrawer} onOpenChange={setOpenFilterDrawer}>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>Filtros</DrawerTitle>
                <DrawerDescription>
                  Refine sua busca de contatos
                </DrawerDescription>
              </DrawerHeader>
              <div className="px-4 py-2 space-y-4">
                <div className="space-y-2">
                  <FormLabel>Grupo</FormLabel>
                  <Select 
                    onValueChange={setFiltroGrupo}
                    value={filtroGrupo}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os grupos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {gruposOptions.map(grupo => (
                        <SelectItem key={grupo} value={grupo}>
                          {grupo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <FormLabel>Mês de Aniversário</FormLabel>
                  <Select 
                    onValueChange={setFiltroMesAniversario}
                    value={filtroMesAniversario}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os meses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      {mesesOptions.map(mes => (
                        <SelectItem key={mes.value} value={mes.value}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DrawerFooter>
                <Button onClick={applyFilters}>
                  Aplicar Filtros
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      ) : (
        // Visualização de detalhes do contato
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              Voltar
            </Button>
            <h2 className="text-2xl font-bold text-gray-800">Detalhes do Contato</h2>
          </div>
          
          {selectedContato && (
            <div className="bg-white p-6 rounded-lg border">
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dataNascimento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento</FormLabel>
                            <FormControl>
                              <DatePicker 
                                date={field.value} 
                                setDate={(date) => field.onChange(date)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="genero"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gênero</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o gênero" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="feminino">Feminino</SelectItem>
                                <SelectItem value="nao-informado">Não informado</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="grupo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Classificação</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a classificação" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Cliente">Cliente</SelectItem>
                                <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                                <SelectItem value="Parceiro">Parceiro</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="canalPreferido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canal Preferido</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o canal" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ativo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Contato ativo
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Nome</h3>
                        <p className="text-lg">{selectedContato.nome}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="text-lg">{selectedContato.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Telefone</h3>
                        <p className="text-lg">{selectedContato.telefone}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Data de Nascimento</h3>
                        <p className="text-lg">{selectedContato.dataNascimento}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Datas Comemorativas</h3>
                        <div className="space-y-1 mt-1">
                          {selectedContato.datasComemorativas.map((data, idx) => (
                            <div key={idx} className="text-md">
                              <span className="font-medium">
                                {tipoDataOptions.find(opt => opt.value === data.tipo)?.label || data.tipo}:
                              </span> {data.data}
                              {data.observacao && (
                                <p className="text-sm text-gray-500 ml-4">{data.observacao}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Gênero</h3>
                        <p className="text-lg">
                          {selectedContato.genero === 'masculino' ? 'Masculino' : 
                          selectedContato.genero === 'feminino' ? 'Feminino' : 
                          <span className="text-red-600 font-medium">Não identificado - favor editar</span>}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <p className="text-lg">
                          {selectedContato.ativo ? 
                            <span className="text-green-600 font-medium">Ativo</span> : 
                            <span className="text-red-600 font-medium">Inativo</span>}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Canal Preferido</h3>
                        <p className="text-lg">WhatsApp</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Classificação</h3>
                        <p className="text-lg">{selectedContato.grupo || 'Nenhum'}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Botões de ação */}
              <div className="flex gap-2 mt-8 justify-end">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button 
                      className="bg-datazap-green hover:bg-datazap-green/90"
                      onClick={form.handleSubmit(onSubmit)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleEditContato(selectedContato)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleDeleteContato(selectedContato)
                        setViewMode('list')
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  )
}

export default ContatosPage
