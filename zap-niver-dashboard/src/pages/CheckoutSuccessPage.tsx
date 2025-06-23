import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ZAPIService } from '@/services/zapiService';

/**
 * Página de Sucesso do Checkout
 * 
 * Exibida após a conclusão do pagamento
 * Mostra instruções para conectar o WhatsApp
 */
const CheckoutSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [payment, setPayment] = useState<any>(location.state?.payment);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar parâmetros da URL e estado
  useEffect(() => {
    // Verificar se temos parâmetros na URL (vindos do checkout do Asaas)
    const searchParams = new URLSearchParams(location.search);
    const simulado = searchParams.get('simulado') === 'true';
    const paymentId = searchParams.get('payment') || searchParams.get('id');
    
    // Se temos um pagamento simulado ou um ID de pagamento na URL
    if (simulado || paymentId) {
      // Criar um objeto de pagamento simulado para testes
      const simulatedPayment = {
        id: paymentId || `pay_${Math.random().toString(36).substring(2, 10)}`,
        status: 'CONFIRMED',
        value: 99.90,
        billingType: 'CREDIT_CARD',
        description: 'Assinatura DataZAP - Plano Padrão (Mensal)',
        customer: `cus_${Math.random().toString(36).substring(2, 10)}`,
        invoiceUrl: 'https://example.com/invoice'
      };
      
      setPayment(simulatedPayment);
    } else if (!payment) {
      // Se não houver dados de pagamento nem parâmetros na URL, redirecionar
      navigate('/planos');
      return;
    }
    // Remover payment da lista de dependências para evitar loop infinito
  }, [location.search, navigate]);

  // Obter o QR Code quando o pagamento estiver disponível
  useEffect(() => {
    if (!payment) {
      return;
    }
    
    // Obter o QR Code
    const fetchQrCode = async () => {
      setLoading(true);
      
      try {
        // Em uma implementação real, você buscaria os dados da instância Z-API do usuário
        // e obteria o QR Code usando o ZAPIService
        
        // Em uma implementação real, você usaria o ZAPIService para obter o QR Code
        // const instance = await ZAPIService.createInstance(user.name);
        // setQrCode(instance.qrcode);
        
        // Simulação para demonstração - usar uma API real de QR Code
        const qrCodeData = encodeURIComponent('https://datazap.app/connect?token=' + Math.random().toString(36).substring(2, 15));
        setQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrCodeData}`);
        setLoading(false);
        
      } catch (error) {
        console.error('Erro ao obter QR Code:', error);
        setError('Não foi possível obter o QR Code. Por favor, entre em contato com o suporte.');
        setLoading(false);
      }
    };
    
    fetchQrCode();
    // Remover navigate da lista de dependências para evitar loop infinito
  }, [payment]);
  
  // Simular a verificação do status da conexão
  const checkConnectionStatus = () => {
    setLoading(true);
    
    // Simulação para demonstração
    setTimeout(() => {
      setConnected(true);
      setLoading(false);
      
      toast({
        title: 'WhatsApp conectado com sucesso!',
        description: 'Seu número de WhatsApp foi conectado à plataforma DataZAP.',
        variant: 'default',
      });
    }, 2000);
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {connected ? (
                <CheckCircle className="h-16 w-16 text-green-500" />
              ) : (
                <CheckCircle className="h-16 w-16 text-green-500" />
              )}
            </div>
            <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
            <CardDescription>
              Obrigado por escolher a DataZAP. Seu pagamento foi processado com sucesso.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Detalhes do pagamento */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Detalhes do Pagamento</h3>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm text-muted-foreground">Método de Pagamento:</div>
                  <div className="text-sm font-medium">
                    {payment?.billingType === 'CREDIT_CARD' && 'Cartão de Crédito'}
                    {payment?.billingType === 'BOLETO' && 'Boleto'}
                    {payment?.billingType === 'PIX' && 'PIX'}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">Valor:</div>
                  <div className="text-sm font-medium">
                    R$ {payment?.value?.toFixed(2) || '0.00'}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">Status:</div>
                  <div className="text-sm font-medium">
                    {payment?.status === 'CONFIRMED' && 'Confirmado'}
                    {payment?.status === 'PENDING' && 'Pendente'}
                    {payment?.status === 'RECEIVED' && 'Recebido'}
                  </div>
                  
                  {payment?.invoiceUrl && (
                    <>
                      <div className="text-sm text-muted-foreground">Fatura:</div>
                      <div className="text-sm font-medium">
                        <a 
                          href={payment.invoiceUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Ver Fatura
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Próximos passos */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Próximos Passos</h3>
              
              {connected ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>WhatsApp Conectado</AlertTitle>
                  <AlertDescription>
                    Seu número de WhatsApp foi conectado com sucesso à plataforma DataZAP.
                    Agora você pode começar a usar todos os recursos.
                  </AlertDescription>
                </Alert>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <p>
                    Para começar a usar a DataZAP, você precisa conectar seu número de WhatsApp.
                    Escaneie o QR Code abaixo com o seu WhatsApp.
                  </p>
                  
                  <div className="flex flex-col items-center">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-48 w-48 bg-gray-100 rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-datazap-green" />
                        <span className="mt-2 text-sm text-muted-foreground">Carregando QR Code...</span>
                      </div>
                    ) : qrCode ? (
                      <div className="space-y-2">
                        <img 
                          src={qrCode} 
                          alt="QR Code para conectar WhatsApp" 
                          className="h-48 w-48 border rounded-md"
                        />
                        <p className="text-sm text-center text-muted-foreground">
                          Escaneie este QR Code com seu WhatsApp
                        </p>
                      </div>
                    ) : null}
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={checkConnectionStatus}
                      disabled={loading || !qrCode}
                      className="bg-datazap-green hover:bg-datazap-green/90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        'Verificar Conexão'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="mr-2"
            >
              Ir para o Dashboard
            </Button>
            
            <Button 
              onClick={() => navigate('/configuracoes')}
              className="bg-datazap-green hover:bg-datazap-green/90"
            >
              Configurar Conta
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
