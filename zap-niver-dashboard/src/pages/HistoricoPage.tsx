
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Check, X, Info, Eye, ArrowDownAZ, ArrowUpAZ } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'

/**
 * HistoricoPage
 * 
 * Página de histórico de mensagens enviadas
 * Lista todas as mensagens enviadas com status e detalhes
 */
const HistoricoPage = () => {
  // Estados para gerenciar filtros e ordenação
  const [filtro, setFiltro] = useState('todos')
  const [ordem, setOrdem] = useState('desc') // 'asc' ou 'desc'
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  
  // Dados mockados de histórico para exemplo
  const historico = [
    { 
      id: 1, 
      destinatario: 'Maria Silva', 
      telefone: '+55 11 98765-4321', 
      mensagem: 'Feliz aniversário, Maria! Que seu dia seja repleto de alegria e que este novo ano de vida seja cheio de realizações e conquistas incríveis!', 
      data: '2023-05-18T10:30:00', 
      status: 'enviada', 
      template: 'Aniversário Descontraído' 
    },
    { 
      id: 2, 
      destinatario: 'João Santos', 
      telefone: '+55 11 97654-3210', 
      mensagem: 'Parabéns pelo seu aniversário, João! Desejamos a você um dia incrível e um ano cheio de sucesso!', 
      data: '2023-05-17T15:45:00', 
      status: 'enviada', 
      template: 'Aniversário Formal' 
    },
    { 
      id: 3, 
      destinatario: 'Carlos Oliveira', 
      telefone: '+55 11 96543-2109', 
      mensagem: 'Carlos, feliz aniversário! Desejamos um dia especial e um ano cheio de conquistas!', 
      data: '2023-05-17T09:15:00', 
      status: 'erro', 
      template: 'Aniversário Cliente' 
    },
    { 
      id: 4, 
      destinatario: 'Ana Costa', 
      telefone: '+55 11 95432-1098', 
      mensagem: 'Ana, desejamos um feliz aniversário! Que este novo ciclo seja repleto de alegrias e realizações!', 
      data: '2023-05-16T13:20:00', 
      status: 'enviada', 
      template: 'Aniversário Formal' 
    },
    { 
      id: 5, 
      destinatario: 'Paulo Martins', 
      telefone: '+55 11 94321-0987', 
      mensagem: 'Feliz aniversário, Paulo! Que seu dia seja incrível e que este novo ano de vida traga muita paz e prosperidade!', 
      data: '2023-05-16T11:10:00', 
      status: 'pendente', 
      template: 'Aniversário Descontraído' 
    },
    { 
      id: 6, 
      destinatario: 'Fernanda Lima', 
      telefone: '+55 11 93210-9876', 
      mensagem: 'Fernanda, a equipe da NiverZap deseja a você um feliz aniversário! Agradecemos pela parceria e confiança.', 
      data: '2023-05-15T14:30:00', 
      status: 'enviada', 
      template: 'Mensagem Corporativa' 
    },
  ]
  
  // Formatar data para exibição
  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data)
  }
  
  // Filtragem de mensagens por status
  const mensagensFiltradas = historico.filter(msg => {
    if (filtro === 'todos') return true
    return msg.status === filtro
  })
  
  // Ordenação das mensagens por data
  const mensagensOrdenadas = [...mensagensFiltradas].sort((a, b) => {
    const dataA = new Date(a.data).getTime()
    const dataB = new Date(b.data).getTime()
    return ordem === 'desc' ? dataB - dataA : dataA - dataB
  })
  
  // Alternar ordem de classificação
  const toggleOrdem = () => {
    setOrdem(prev => prev === 'desc' ? 'asc' : 'desc')
  }
  
  // Visualizar detalhes da mensagem
  const visualizarDetalhes = (mensagem: any) => {
    setSelectedMessage(mensagem)
    setDialogOpen(true)
  }
  
  // Renderizar badge de status com cor apropriada
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'enviada':
        return <Badge className="bg-green-600"><Check className="h-3 w-3 mr-1" /> Enviada</Badge>
      case 'erro':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" /> Erro</Badge>
      case 'pendente':
        return <Badge variant="outline" className="border-amber-500 text-amber-600"><Info className="h-3 w-3 mr-1" /> Pendente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <AppLayout title="Histórico">
      <div className="space-y-6">
        {/* Cabeçalho da página */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Histórico de Mensagens</h2>
          <p className="text-gray-600 mt-1">
            Histórico de todas as mensagens de aniversário enviadas
          </p>
        </div>
        
        {/* Filtros e opções */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="w-full sm:w-auto">
            <Select value={filtro} onValueChange={setFiltro}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="enviada">Enviadas</SelectItem>
                <SelectItem value="erro">Com erro</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline" 
            className="ml-auto"
            onClick={toggleOrdem}
          >
            {ordem === 'desc' ? (
              <>
                <ArrowDownAZ className="h-4 w-4 mr-2" />
                Mais recentes
              </>
            ) : (
              <>
                <ArrowUpAZ className="h-4 w-4 mr-2" />
                Mais antigas
              </>
            )}
          </Button>
        </div>
        
        {/* Tabela de histórico */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destinatário</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mensagensOrdenadas.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell className="font-medium">
                    {msg.destinatario}
                    <div className="text-xs text-gray-500">{msg.telefone}</div>
                  </TableCell>
                  <TableCell>{msg.template}</TableCell>
                  <TableCell>{formatarData(msg.data)}</TableCell>
                  <TableCell>{renderStatusBadge(msg.status)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => visualizarDetalhes(msg)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {mensagensOrdenadas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    Nenhuma mensagem encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Dialog de detalhes da mensagem */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes da Mensagem</DialogTitle>
            <DialogDescription>
              Informações completas sobre o envio da mensagem
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Destinatário</h4>
                <p>{selectedMessage.destinatario} ({selectedMessage.telefone})</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Template utilizado</h4>
                <p>{selectedMessage.template}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Data de envio</h4>
                <p>{formatarData(selectedMessage.data)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <div>{renderStatusBadge(selectedMessage.status)}</div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Conteúdo da mensagem</h4>
                <div className="bg-gray-50 p-3 rounded-md border text-sm">
                  {selectedMessage.mensagem}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}

export default HistoricoPage
