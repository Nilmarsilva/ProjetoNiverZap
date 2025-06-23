import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Landmark, QrCode, Check, X } from 'lucide-react';
import { PaymentService, Customer, PaymentRequest, PaymentResponse } from '@/services/paymentService';
import { useAuthStore } from '@/stores/authStore';

// Esquema de validação para o formulário de checkout
const checkoutFormSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }),
  cpfCnpj: z.string().min(11, { message: 'CPF/CNPJ inválido' }),
  paymentMethod: z.enum(['CREDIT_CARD', 'BOLETO', 'PIX'], { 
    required_error: 'Selecione um método de pagamento' 
  }),
  planId: z.string({ required_error: 'Selecione um plano' }),
  // Campos para cartão de crédito
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVC: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// Planos disponíveis
const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 49.90,
    description: 'Ideal para pequenos negócios',
    features: [
      'Até 500 contatos',
      'Até 1.000 mensagens/mês',
      '1 número de WhatsApp',
      'Suporte por email'
    ]
  },
  {
    id: 'standard',
    name: 'Padrão',
    price: 99.90,
    description: 'Perfeito para empresas em crescimento',
    features: [
      'Até 2.000 contatos',
      'Até 5.000 mensagens/mês',
      '2 números de WhatsApp',
      'Suporte prioritário'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199.90,
    description: 'Para empresas que precisam de mais recursos',
    features: [
      'Contatos ilimitados',
      'Mensagens ilimitadas',
      '5 números de WhatsApp',
      'Suporte 24/7',
      'API personalizada'
    ]
  }
];

/**
 * Página de Checkout
 * 
 * Permite que o usuário selecione um plano e realize o pagamento
 */
const CheckoutPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  
  const [selectedPlan, setSelectedPlan] = useState(plans.find(p => p.id === planId) || plans[0]);
  const [paymentTab, setPaymentTab] = useState<'CREDIT_CARD' | 'BOLETO' | 'PIX'>('CREDIT_CARD');
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  
  // Formulário de checkout
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      cpfCnpj: '',
      paymentMethod: 'CREDIT_CARD',
      planId: selectedPlan.id,
    }
  });
  
  // Atualizar método de pagamento quando a aba mudar
  useEffect(() => {
    form.setValue('paymentMethod', paymentTab);
  }, [paymentTab, form]);
  
  // Atualizar plano selecionado quando o parâmetro mudar
  useEffect(() => {
    if (planId) {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setSelectedPlan(plan);
        form.setValue('planId', plan.id);
      }
    }
  }, [planId, form]);
  
  // Função para processar o pagamento
  const processPayment = async (data: CheckoutFormValues) => {
    setLoading(true);
    
    try {
      // Criar ou buscar cliente no Asaas
      const customerData: Customer = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpfCnpj: data.cpfCnpj
      };
      
      // No ambiente de sandbox, vamos sempre criar um novo cliente para facilitar os testes
      // Em produção, você deve verificar se o cliente já existe primeiro
      let customer: Customer;
      try {
        customer = await PaymentService.createCustomer(customerData);
        console.log('Cliente criado com sucesso:', customer);
      } catch (customerError) {
        console.error('Erro ao criar cliente:', customerError);
        // Se falhar ao criar o cliente, tentamos buscar por email como fallback
        const existingCustomer = await PaymentService.findCustomerByEmail(data.email);
        if (!existingCustomer) {
          throw new Error('Não foi possível criar ou encontrar o cliente');
        }
        customer = existingCustomer;
      }
      
      // Preparar dados do pagamento
      const paymentRequest: PaymentRequest = {
        customer: customer.id || '',
        billingType: data.paymentMethod,
        value: selectedPlan.price,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias a partir de hoje
        description: `Assinatura DataZAP - Plano ${selectedPlan.name}`,
        externalReference: PaymentService.generateExternalReference()
      };
      
      console.log('Enviando solicitação de pagamento:', paymentRequest);
      
      // Criar pagamento
      let payment: PaymentResponse;
      try {
        payment = await PaymentService.createPayment(paymentRequest);
        console.log('Pagamento criado com sucesso:', payment);
      } catch (paymentError: any) {
        console.error('Erro ao criar pagamento:', paymentError);
        
        // Para fins de demonstração no ambiente de desenvolvimento,
        // vamos simular uma resposta de pagamento bem-sucedida
        if (import.meta.env.DEV) {
          console.log('Simulando resposta de pagamento no ambiente de desenvolvimento');
          payment = {
            id: 'pay_' + Math.random().toString(36).substring(2, 15),
            status: 'PENDING',
            value: selectedPlan.price,
            netValue: selectedPlan.price,
            billingType: data.paymentMethod,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            clientId: customer.id || '',
            description: `Assinatura DataZAP - Plano ${selectedPlan.name}`,
            invoiceUrl: 'https://example.com/invoice',
            // Adicionar campos específicos para cada método de pagamento
            ...(data.paymentMethod === 'PIX' ? { 
              pixQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pix-datazap-demo',
              pixKey: 'demo@datazap.com',
              pixCopiaECola: 'PIX COPIA E COLA SIMULADO'
            } : {}),
            ...(data.paymentMethod === 'BOLETO' ? {
              bankSlipUrl: 'https://example.com/boleto'
            } : {})
          };
        } else {
          throw paymentError;
        }
      }
      
      // Salvar resultado do pagamento
      setPaymentResult(payment);
      
      // Exibir mensagem de sucesso
      toast({
        title: 'Pagamento processado com sucesso!',
        description: 'Verifique seu email para mais instruções.',
        variant: 'default',
      });
      
      // Redirecionar para página de sucesso após 3 segundos
      setTimeout(() => {
        navigate('/checkout/success', { state: { payment } });
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      
      // Exibir mensagem de erro
      toast({
        title: 'Erro ao processar pagamento',
        description: 'Ocorreu um erro ao processar seu pagamento. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Resumo do plano */}
        <div className="w-full md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
              <CardDescription>Plano selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{selectedPlan.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                  </div>
                  <div className="text-xl font-bold">
                    R$ {selectedPlan.price.toFixed(2)}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Recursos incluídos:</h4>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>R$ {selectedPlan.price.toFixed(2)}/mês</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <p className="text-sm text-muted-foreground">
                Ao assinar, você concorda com nossos Termos de Serviço e Política de Privacidade.
              </p>
              <p className="text-sm text-muted-foreground">
                Você pode cancelar a qualquer momento.
              </p>
            </CardFooter>
          </Card>
        </div>
        
        {/* Formulário de pagamento */}
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Pagamento</CardTitle>
              <CardDescription>Preencha seus dados para finalizar a compra</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(processPayment)} className="space-y-6">
                  {/* Dados pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dados Pessoais</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
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
                              <Input placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
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
                        name="cpfCnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF/CNPJ</FormLabel>
                            <FormControl>
                              <Input placeholder="000.000.000-00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Método de pagamento */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Método de Pagamento</h3>
                    
                    <Tabs value={paymentTab} onValueChange={(value: any) => setPaymentTab(value)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="CREDIT_CARD" className="flex items-center justify-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Cartão de Crédito
                        </TabsTrigger>
                        <TabsTrigger value="BOLETO" className="flex items-center justify-center">
                          <Landmark className="h-4 w-4 mr-2" />
                          Boleto
                        </TabsTrigger>
                        <TabsTrigger value="PIX" className="flex items-center justify-center">
                          <QrCode className="h-4 w-4 mr-2" />
                          PIX
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="CREDIT_CARD" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número do Cartão</FormLabel>
                                <FormControl>
                                  <Input placeholder="0000 0000 0000 0000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome no Cartão</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome como aparece no cartão" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardExpiry"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Validade</FormLabel>
                                <FormControl>
                                  <Input placeholder="MM/AA" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardCVC"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVC</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="BOLETO" className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                          O boleto será gerado após a confirmação do pedido e enviado para o seu email.
                          O prazo de compensação é de até 3 dias úteis.
                        </p>
                      </TabsContent>
                      
                      <TabsContent value="PIX" className="space-y-4 mt-4">
                        <p className="text-sm text-muted-foreground">
                          O QR Code do PIX será gerado após a confirmação do pedido.
                          O pagamento é processado instantaneamente.
                        </p>
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate('/planos')}
                        disabled={loading}
                      >
                        Voltar para Planos
                      </Button>
                      
                      <Button 
                        type="submit" 
                        className="flex-1 bg-datazap-green hover:bg-datazap-green/90"
                        disabled={loading}
                      >
                        {loading ? 'Processando...' : 'Finalizar Compra'}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Ao finalizar a compra, você concorda com nossos Termos de Serviço e Política de Privacidade.
                    </p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Resultado do pagamento */}
      {paymentResult && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Pagamento Processado</CardTitle>
              <CardDescription>
                Seu pagamento foi processado com sucesso. Verifique seu email para mais instruções.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span>{paymentResult.status}</span>
                </div>
                
                {paymentResult.invoiceUrl && (
                  <div className="flex justify-between">
                    <span className="font-medium">Fatura:</span>
                    <a 
                      href={paymentResult.invoiceUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver Fatura
                    </a>
                  </div>
                )}
                
                {paymentResult.bankSlipUrl && (
                  <div className="flex justify-between">
                    <span className="font-medium">Boleto:</span>
                    <a 
                      href={paymentResult.bankSlipUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver Boleto
                    </a>
                  </div>
                )}
                
                {paymentResult.pixQrCodeUrl && (
                  <div className="flex flex-col items-center mt-4">
                    <span className="font-medium mb-2">QR Code PIX:</span>
                    <img 
                      src={paymentResult.pixQrCodeUrl} 
                      alt="QR Code PIX" 
                      className="w-48 h-48"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
