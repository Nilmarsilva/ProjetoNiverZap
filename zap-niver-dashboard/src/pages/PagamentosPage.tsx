import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from '@/components/ui/use-toast';
import { 
  CreditCard, 
  Check, 
  X, 
  RefreshCw,
  CalendarClock, 
  Users,
  MessageSquare,
  ChevronRight,
  Download,
  AlertCircle,
  Clock,
  FileText,
  Landmark,
  QrCode
} from 'lucide-react';
import { PaymentService } from '@/services/paymentService';
import { useAuthStore } from '@/stores/authStore';

/**
 * Tipos para representar dados de pagamento
 */
interface Plano {
  id: string;
  nome: string;
  preco: number;
  periodo: 'mensal' | 'anual';
  limiteContatos: number;
  limiteMensagens: number;
  integracoes: string[];
  features: string[];
  popular?: boolean;
}

interface Pagamento {
  id: string;
  valor: number;
  status: 'PENDING' | 'CONFIRMED' | 'RECEIVED' | 'OVERDUE' | 'REFUNDED' | 'CANCELED';
  dataVencimento: string;
  dataPagamento?: string;
  metodoPagamento: 'CREDIT_CARD' | 'BOLETO' | 'PIX';
  descricao: string;
  linkBoleto?: string;
  linkPix?: string;
  linkFatura?: string;
}

interface Assinatura {
  id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OVERDUE' | 'CANCELED';
  plano: string;
  dataInicio: string;
  dataProximoVencimento: string;
  valor: number;
  ciclo: 'MONTHLY' | 'YEARLY';
}

/**
 * PagamentosPage
 * 
 * Página para gerenciar assinaturas e planos
 * Mostra status do plano atual, histórico de pagamentos e opções de upgrade
 */
const PagamentosPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  
  // Estados
  const [activeTab, setActiveTab] = useState('assinatura');
  const [planoAtual, setPlanoAtual] = useState({
    nome: 'Profissional',
    status: 'ativo',
    dataRenovacao: '15/07/2025',
    contatos: {
      usado: 120,
      limite: 500
    },
    mensagens: {
      usado: 750,
      limite: 3000
    }
  });
  
  const [metodoPagamento, setMetodoPagamento] = useState('CREDIT_CARD');
  const [openDialog, setOpenDialog] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano | null>(null);
  const [loadingPagamento, setLoadingPagamento] = useState(false);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dados mockados de planos
  const planos: Plano[] = [
    {
      id: 'starter',
      nome: 'Starter',
      preco: 49.90,
      periodo: 'mensal',
      limiteContatos: 200,
      limiteMensagens: 1000,
      integracoes: ['Z-API', 'Evolution API'],
      features: [
        'Até 200 contatos',
        'Até 1.000 mensagens/mês',
        'Integrações Z-API e Evolution API',
        'Suporte por email'
      ]
    },
    {
      id: 'profissional',
      nome: 'Profissional',
      preco: 99.90,
      periodo: 'mensal',
      limiteContatos: 500,
      limiteMensagens: 3000,
      integracoes: ['Z-API', 'Evolution API', 'Meta API'],
      features: [
        'Até 500 contatos',
        'Até 3.000 mensagens/mês',
        'Todas as integrações',
        'Suporte prioritário'
      ],
      popular: true
    },
    {
      id: 'empresarial',
      nome: 'Empresarial',
      preco: 249.90,
      periodo: 'mensal',
      limiteContatos: 2000,
      limiteMensagens: 10000,
      integracoes: ['Z-API', 'Evolution API', 'Meta API'],
      features: [
        'Até 2.000 contatos',
        'Até 10.000 mensagens/mês',
        'Todas as integrações',
        'Suporte premium 24/7',
        'API dedicada'
      ]
    }
  ];
  
  // Versões anuais dos planos com desconto
  const planosAnuais: Plano[] = planos.map(plano => ({
    ...plano,
    id: `${plano.id}_anual`,
    periodo: 'anual' as const,
    preco: Math.round(plano.preco * 10) * 0.85, // 15% de desconto no plano anual
    features: [
      ...plano.features,
      '15% de desconto'
    ]
  }));
  
  // Carregar dados de pagamentos e assinatura do usuário
  useEffect(() => {
    const carregarDados = async () => {
      if (!user?.email) return;
      
      setIsLoading(true);
      try {
        // Em uma implementação real, você buscaria os dados do usuário
        // usando o PaymentService
        
        // Simulação de dados para demonstração
        const mockPagamentos: Pagamento[] = [
          {
            id: 'pay_123456789',
            valor: 99.90,
            status: 'CONFIRMED',
            dataVencimento: '2025-05-15',
            dataPagamento: '2025-05-14',
            metodoPagamento: 'CREDIT_CARD',
            descricao: 'Assinatura DataZAP - Plano Profissional (Maio/2025)',
            linkFatura: 'https://example.com/invoice/123456789'
          },
          {
            id: 'pay_987654321',
            valor: 99.90,
            status: 'CONFIRMED',
            dataVencimento: '2025-04-15',
            dataPagamento: '2025-04-13',
            metodoPagamento: 'CREDIT_CARD',
            descricao: 'Assinatura DataZAP - Plano Profissional (Abril/2025)',
            linkFatura: 'https://example.com/invoice/987654321'
          },
          {
            id: 'pay_456789123',
            valor: 99.90,
            status: 'PENDING',
            dataVencimento: '2025-06-15',
            metodoPagamento: 'BOLETO',
            descricao: 'Assinatura DataZAP - Plano Profissional (Junho/2025)',
            linkBoleto: 'https://example.com/boleto/456789123',
            linkFatura: 'https://example.com/invoice/456789123'
          }
        ];
        
        const mockAssinatura: Assinatura = {
          id: 'sub_123456789',
          status: 'ACTIVE',
          plano: 'Profissional',
          dataInicio: '2025-03-15',
          dataProximoVencimento: '2025-06-15',
          valor: 99.90,
          ciclo: 'MONTHLY'
        };
        
        setPagamentos(mockPagamentos);
        setAssinatura(mockAssinatura);
        
        // Atualizar o plano atual com base na assinatura
        setPlanoAtual({
          nome: mockAssinatura.plano,
          status: mockAssinatura.status === 'ACTIVE' ? 'ativo' : 'inativo',
          dataRenovacao: mockAssinatura.dataProximoVencimento,
          contatos: {
            usado: 120,
            limite: 500
          },
          mensagens: {
            usado: 750,
            limite: 3000
          }
        });
      } catch (error) {
        console.error('Erro ao carregar dados de pagamento:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar seus dados de pagamento. Tente novamente mais tarde.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    carregarDados();
  }, [user?.email, toast]);

  // Função para escolher um plano
  const escolherPlano = (plano: Plano) => {
    setPlanoSelecionado(plano);
    setOpenDialog(true);
  };
  
  // Função para processar pagamento
  const processarPagamento = async () => {
    if (!planoSelecionado) return;
    
    setLoadingPagamento(true);
    
    try {
      // Em uma implementação real, você usaria o PaymentService
      // para processar o pagamento
      
      // Redirecionar para a página de checkout
      navigate(`/checkout/${planoSelecionado.id}`);
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: 'Erro no processamento',
        description: 'Não foi possível processar o pagamento. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setLoadingPagamento(false);
    }
  };
  
  // Função para cancelar assinatura
  const cancelarAssinatura = async () => {
    setLoadingPagamento(true);
    
    try {
      // Em uma implementação real, você usaria o PaymentService
      // para cancelar a assinatura
      
      // Simulação para demonstração
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAssinatura(prev => prev ? { ...prev, status: 'CANCELED' } : null);
      
      toast({
        title: 'Assinatura cancelada',
        description: 'Sua assinatura foi cancelada com sucesso. O acesso será mantido até o final do período pago.',
      });
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      toast({
        title: 'Erro ao cancelar',
        description: 'Não foi possível cancelar sua assinatura. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setLoadingPagamento(false);
    }
  };
  
  // Função para formatar status do pagamento
  const formatarStatusPagamento = (status: Pagamento['status']) => {
    switch (status) {
      case 'CONFIRMED':
      case 'RECEIVED':
        return { texto: 'Confirmado', cor: 'bg-green-100 text-green-800' };
      case 'PENDING':
        return { texto: 'Pendente', cor: 'bg-yellow-100 text-yellow-800' };
      case 'OVERDUE':
        return { texto: 'Atrasado', cor: 'bg-red-100 text-red-800' };
      case 'REFUNDED':
        return { texto: 'Reembolsado', cor: 'bg-blue-100 text-blue-800' };
      case 'CANCELED':
        return { texto: 'Cancelado', cor: 'bg-gray-100 text-gray-800' };
      default:
        return { texto: status, cor: 'bg-gray-100 text-gray-800' };
    }
  };
  
  // Função para formatar método de pagamento
  const formatarMetodoPagamento = (metodo: Pagamento['metodoPagamento']) => {
    switch (metodo) {
      case 'CREDIT_CARD':
        return { texto: 'Cartão de Crédito', icone: <CreditCard className="h-4 w-4" /> };
      case 'BOLETO':
        return { texto: 'Boleto', icone: <Landmark className="h-4 w-4" /> };
      case 'PIX':
        return { texto: 'PIX', icone: <QrCode className="h-4 w-4" /> };
      default:
        return { texto: metodo, icone: <CreditCard className="h-4 w-4" /> };
    }
  };
  
  // Função para formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };
  
  // Calcula porcentagem de uso
  const calcularPorcentagem = (usado: number, limite: number) => {
    return Math.min(Math.round((usado / limite) * 100), 100);
  };
  
  // Calcula porcentagens para uso na UI
  const porcentagemContatos = calcularPorcentagem(planoAtual.contatos.usado, planoAtual.contatos.limite);
  const porcentagemMensagens = calcularPorcentagem(planoAtual.mensagens.usado, planoAtual.mensagens.limite);
  
  return (
    <AppLayout title="Pagamentos">
      <div className="container mx-auto py-8 space-y-8">
        {/* Tabs para navegação entre assinatura e histórico */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Pagamentos</TabsTrigger>
          </TabsList>
          
          {/* Tab de Assinatura */}
          <TabsContent value="assinatura" className="space-y-6">
            {/* Status do plano atual */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Seu Plano Atual</CardTitle>
                    <CardDescription>Status e informações do seu plano</CardDescription>
                  </div>
                  {assinatura && (
                    <Badge 
                      variant={assinatura.status === 'ACTIVE' ? 'default' : 'destructive'} 
                      className={`text-xs ${assinatura.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {assinatura.status === 'ACTIVE' ? 'Ativo' : 
                       assinatura.status === 'CANCELED' ? 'Cancelado' : 
                       assinatura.status === 'OVERDUE' ? 'Atrasado' : 'Inativo'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : assinatura ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">{assinatura.plano}</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Próxima renovação em {formatarData(assinatura.dataProximoVencimento)}
                      </p>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          disabled={assinatura.status !== 'ACTIVE'}
                          onClick={() => navigate('/planos')}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Alterar Plano
                        </Button>
                        
                        {assinatura.status === 'ACTIVE' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={cancelarAssinatura}
                            disabled={loadingPagamento}
                          >
                            <X className="mr-2 h-4 w-4" />
                            {loadingPagamento ? 'Processando...' : 'Cancelar Assinatura'}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Contatos</span>
                          <span className="text-sm text-muted-foreground">
                            {planoAtual.contatos.usado} / {planoAtual.contatos.limite}
                          </span>
                        </div>
                        <Progress value={calcularPorcentagem(planoAtual.contatos.usado, planoAtual.contatos.limite)} />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Mensagens</span>
                          <span className="text-sm text-muted-foreground">
                            {planoAtual.mensagens.usado} / {planoAtual.mensagens.limite}
                          </span>
                        </div>
                        <Progress value={calcularPorcentagem(planoAtual.mensagens.usado, planoAtual.mensagens.limite)} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-between">
                      <div className="flex items-center space-x-2 mb-2">
                        <CalendarClock className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">
                          {assinatura.ciclo === 'MONTHLY' ? 'Renovação mensal' : 'Renovação anual'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Até {planoAtual.contatos.limite} contatos</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Até {planoAtual.mensagens.limite} mensagens/mês</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Você ainda não possui uma assinatura ativa.</p>
                    <Button onClick={() => navigate('/planos')} className="bg-datazap-green hover:bg-datazap-green/90">
                      Ver Planos Disponíveis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab de Histórico de Pagamentos */}
          <TabsContent value="historico" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>Visualize seus pagamentos anteriores e faturas</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : pagamentos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagamentos.map((pagamento) => {
                        const status = formatarStatusPagamento(pagamento.status);
                        const metodo = formatarMetodoPagamento(pagamento.metodoPagamento);
                        
                        return (
                          <TableRow key={pagamento.id}>
                            <TableCell>
                              {formatarData(pagamento.dataPagamento || pagamento.dataVencimento)}
                            </TableCell>
                            <TableCell>{pagamento.descricao}</TableCell>
                            <TableCell>R$ {pagamento.valor.toFixed(2)}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {metodo.icone}
                                <span>{metodo.texto}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={status.cor}>{status.texto}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {pagamento.linkFatura && (
                                  <a 
                                    href={pagamento.linkFatura} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center"
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    Fatura
                                  </a>
                                )}
                                
                                {pagamento.linkBoleto && pagamento.status === 'PENDING' && (
                                  <a 
                                    href={pagamento.linkBoleto} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center ml-2"
                                  >
                                    <Landmark className="h-4 w-4 mr-1" />
                                    Boleto
                                  </a>
                                )}
                                
                                {pagamento.linkPix && pagamento.status === 'PENDING' && (
                                  <a 
                                    href={pagamento.linkPix} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline inline-flex items-center ml-2"
                                  >
                                    <QrCode className="h-4 w-4 mr-1" />
                                    PIX
                                  </a>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Dialog de confirmação de pagamento */}
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirmar Mudança de Plano</DialogTitle>
              <DialogDescription>
                {planoSelecionado && `Você está mudando para o plano ${planoSelecionado.nome}`}
              </DialogDescription>
            </DialogHeader>
            
            {planoSelecionado && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Plano:</span>
                  <span className="font-medium">{planoSelecionado.nome}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Valor:</span>
                  <span className="font-medium">
                    R$ {planoSelecionado.preco.toFixed(2)}/{planoSelecionado.periodo === 'mensal' ? 'mês' : 'ano'}
                  </span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Método de Pagamento</label>
                  <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CREDIT_CARD">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Cartão de Crédito
                        </div>
                      </SelectItem>
                      <SelectItem value="BOLETO">
                        <div className="flex items-center">
                          <Landmark className="h-4 w-4 mr-2" />
                          Boleto Bancário
                        </div>
                      </SelectItem>
                      <SelectItem value="PIX">
                        <div className="flex items-center">
                          <QrCode className="h-4 w-4 mr-2" />
                          PIX
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex space-x-2 sm:space-x-0">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={processarPagamento} 
                disabled={loadingPagamento}
                className="bg-datazap-green hover:bg-datazap-green/90"
              >
                {loadingPagamento ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : 'Confirmar Pagamento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default PagamentosPage;
