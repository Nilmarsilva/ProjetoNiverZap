import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/userService';
import { PaymentService } from '@/services/paymentService';
import { Spinner } from '@/components/ui/spinner';

// Tipo para os planos
interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  recommended: boolean;
  asaasId?: {
    monthly?: string;
    yearly?: string;
  };
}

// Planos disponíveis (serão carregados do banco de dados em produção)
const defaultPlans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: {
      monthly: 129.99, //preço mensal precificado a R$0.13 centavos
      yearly: 1403.99 //preço anual precificado a R$0.13 centavos (129.99 * 12) + desconto de 10%
    },
    description: 'Ideal para pequenos negócios',
    features: [
      'Até 500 contatos',
      'Até 1.000 mensagens/mês',
      '1 número de WhatsApp',
      'Suporte por email'
    ],
    recommended: false,
    asaasId: {}
  },
  {
    id: 'standard',
    name: 'Padrão',
    price: {
      monthly: 239.99, //preço mensal precificado a R$0.08 centavos
      yearly: 2591.99 //preço anual precificado a R$0.08 centavos (219.99 * 12) + desconto de 10%
    },
    description: 'Perfeito para empresas em crescimento',
    features: [
      'Até 1.500 contatos',
      'Até 3.000 mensagens/mês',
      '1 número de WhatsApp',
      'Suporte prioritário',
      'Relatórios avançados'
    ],
    recommended: true,
    asaasId: {}
  },
  {
    id: 'premium',
    name: 'Premium',
    price: {
      monthly: 399.99, //preço mensal precificado a R$0.08 centavos
      yearly: 4319.99 //preço anual precificado a R$0.08 centavos (399.99 * 12) + desconto de 10%
    },
    description: 'Para empresas que precisam de mais recursos',
    features: [
      'Até 2.500 contatos',
      'Até 5.000 mensagens/mês',
      '2 números de WhatsApp',
      'Suporte 24/7',
      'API personalizada',
      'Integrações avançadas'
    ],
    recommended: false,
    asaasId: {}
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: {
      monthly: 9999,
      yearly: 9999
    },
    description: 'Para empresas que precisam de mais recursos, plano sob consulta',
    features: [
      'Volume ilimitado de contatos',
      'Volume ilimitado de mensagens',
      'Sob consulta',
      'Suporte 24/7',
      'API personalizada',
      'Integrações avançadas',
      'Treinamento da equipe'
    ],
    recommended: false,
    asaasId: {}
  }
];

/**
 * Página de Planos
 * 
 * Exibe os planos disponíveis para assinatura e integra com o checkout do Asaas
 */
const PlansPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  
  // Carregar planos do banco de dados e sincronizar com Asaas
  useEffect(() => {
    // Em um ambiente de produção, você carregaria os planos do seu banco de dados
    // e então sincronizaria com o Asaas
    
    // Para este exemplo, usaremos os planos padrão
    const syncPlansWithAsaas = async () => {
      try {
        // Para cada plano, sincronizar com o Asaas
        const updatedPlans = [...plans];
        
        for (let i = 0; i < updatedPlans.length; i++) {
          const plan = updatedPlans[i];
          
          // Criar ou atualizar plano mensal no Asaas
          const monthlyPlanData = {
            id: plan.id + '_monthly',
            nome: plan.name + ' (Mensal)',
            preco: plan.price.monthly,
            periodo: 'mensal',
            limiteContatos: 500, // Estes valores seriam dinâmicos em produção
            limiteMensagens: 1000
          };
          
          // Criar ou atualizar plano anual no Asaas
          const yearlyPlanData = {
            id: plan.id + '_yearly',
            nome: plan.name + ' (Anual)',
            preco: plan.price.yearly,
            periodo: 'anual',
            limiteContatos: 500, // Estes valores seriam dinâmicos em produção
            limiteMensagens: 1000
          };
          
          // Em um ambiente de produção, você sincronizaria os planos com o Asaas
          // Comentado para não fazer chamadas reais à API durante o desenvolvimento
          /*
          const monthlyAsaasPlan = await AsaasService.syncPlan(monthlyPlanData);
          const yearlyAsaasPlan = await AsaasService.syncPlan(yearlyPlanData);
          
          // Atualizar IDs do Asaas
          updatedPlans[i].asaasId = {
            monthly: monthlyAsaasPlan.id,
            yearly: yearlyAsaasPlan.id
          };
          */
          
          // Para fins de demonstração, simular IDs do Asaas
          updatedPlans[i].asaasId = {
            monthly: 'plan_' + Math.random().toString(36).substring(2, 10),
            yearly: 'plan_' + Math.random().toString(36).substring(2, 10)
          };
        }
        
        setPlans(updatedPlans);
      } catch (error) {
        console.error('Erro ao sincronizar planos com Asaas:', error);
        toast({
          title: 'Erro ao carregar planos',
          description: 'Não foi possível sincronizar os planos com o Asaas.',
          variant: 'destructive'
        });
      }
    };
    
    syncPlansWithAsaas();
  }, [toast]);
  
  // Handler para selecionar um plano
  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      // Usuário não está logado, redirecionar para login
      toast({
        title: 'Login necessário',
        description: 'Você precisa estar logado para assinar um plano',
        variant: 'destructive'
      });
      navigate('/login?redirect=/plans');
      return;
    }
    
    // Verificar se o perfil do usuário está completo usando a nova API
    const isComplete = await userService.isProfileComplete();
    
    if (!isComplete) {
      // Perfil incompleto, redirecionar para a página de configurações
      toast({
        title: 'Perfil incompleto',
        description: 'Você precisa completar seu perfil antes de assinar um plano',
        variant: 'destructive'
      });
      navigate('/configuracoes/perfil?redirect=/plans');
      return;
    }
    
    // Iniciar o processo de checkout para o plano selecionado
    handleCheckout(plan.id, billingCycle);
  };
  
  // Função para iniciar o processo de checkout com o Stripe
  const handleCheckout = async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    setIsLoading(true);
    setProcessingPlanId(planId);
    
    try {
      // Encontrar o plano selecionado
      const selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan) {
        throw new Error('Plano não encontrado');
      }
      
      // Obter dados do usuário logado
      const userData = await userService.getCurrentUserProfile();
      if (!userData) {
        throw new Error('Dados do usuário não encontrados');
      }
      
      // Verificar se o usuário tem um cliente Stripe associado
      if (!userData.stripe_customer_id) {
        // Criar cliente Stripe automaticamente
        try {
          await userService.createStripeCustomer();
          toast({
            title: "Cliente Stripe criado",
            description: "Seu perfil foi registrado para pagamentos"
          });
        } catch (stripeError) {
          console.error('Erro ao criar cliente no Stripe:', stripeError);
          toast({
            title: "Erro",
            description: "Não foi possível processar seu pagamento. Tente novamente.",
            variant: "destructive"
          });
          setIsLoading(false);
          setProcessingPlanId(null);
          return;
        }
      }
      
      // Preparar parâmetros para o checkout do Stripe
      const checkoutParams = {
        customerId: userData.stripe_customer_id,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        cycle: billingCycle,
        price: billingCycle === 'monthly' ? selectedPlan.price.monthly : selectedPlan.price.yearly,
        description: `Assinatura ${selectedPlan.name} - Ciclo ${billingCycle === 'monthly' ? 'Mensal' : 'Anual'}`,
        successUrl: `${window.location.origin}/checkout/success`,
        cancelUrl: `${window.location.origin}/plans`,
        metadata: {
          user_id: userData.id,
          plan_id: selectedPlan.id,
          billing_cycle: billingCycle
        }
      };
      
      console.log('Dados do checkout:', checkoutParams);
      
      // Usar o serviço de pagamento para criar a sessão de checkout do Stripe
      const { url } = await PaymentService.createStripeCheckoutSession(checkoutParams);
      
      // Redirecionar para a página de checkout do Stripe
      window.location.href = url;
    } catch (error) {
      console.error('Erro ao processar checkout:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o checkout. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setProcessingPlanId(null);
    }
  };
  
  return (
    <AppLayout title="Planos">
      <div className="container mx-auto py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Escolha o Plano Ideal para Seu Negócio</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Todos os planos incluem acesso a todos os recursos essenciais da plataforma.
            Escolha o que melhor se adapta às suas necessidades.
          </p>
        </div>
        
        {/* Seletor de ciclo de cobrança */}
        <div className="flex justify-center mb-8">
          <Tabs 
            value={billingCycle} 
            onValueChange={(value: string) => setBillingCycle(value as 'monthly' | 'yearly')}
            className="w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
              <TabsTrigger value="yearly">
                Anual
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  10% de desconto
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Cards de planos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-[1800px] mx-auto px-4">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative flex flex-col h-full ${plan.recommended ? 'border-datazap-green shadow-lg' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="bg-datazap-green">Mais Popular</Badge>
                </div>
              )}
              
              <div className="flex-1">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold">
                      R$ {plan.price[billingCycle].toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </div>
                  
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
              
              <CardFooter className="mt-auto pt-4">
                <Button 
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isLoading || processingPlanId === plan.id}
                  className={`w-full ${
                    plan.recommended 
                      ? 'bg-datazap-green hover:bg-datazap-green/90' 
                      : 'bg-primary'
                  }`}
                >
                  {processingPlanId === plan.id ? (
                    <>
                      <Spinner className="mr-2" />
                      Processando...
                    </>
                  ) : (
                    'Escolher Plano'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Seção de perguntas frequentes */}
        <div className="mt-16 max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas Frequentes</h2>

          <Accordion type="single" collapsible className="w-full space-y-2">
            <AccordionItem value="install" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">Preciso instalar algo no meu computador?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Não, você não precisa instalar nada no seu computador.
                O Data Zap é uma aplicação web que pode ser acessada 100% via navegador.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="auto-messages" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">O Data Zap envia mensagens automaticamente?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Sim, desde que você tenha programado previamente. 
                Você define o conteúdo, a data e a hora, e o Data Zap cuida do envio automático, com segurança e dentro das boas práticas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="custom-messages" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">Posso personalizar as mensagens com o nome do cliente?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Sim! Com nosso sistema de variáveis dinâmicas, você pode inserir o nome, data, e até outros campos personalizados para tornar suas mensagens mais humanas e eficazes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="import-contacts" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">Posso importar meus contatos para o Data Zap?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Sim! Você pode importar seus contatos para o Data Zap de duas maneiras: Via CSV e XLSX.
                Na página de importação contamos com um exemplo de como deve ser o arquivo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="support" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">Tenho suporte se precisar de ajuda?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Sim. Oferecemos suporte técnico via e-mail, WhatsApp e, dependendo do plano, suporte prioritário. Nosso time está pronto para te ajudar a ter os melhores resultados com a ferramenta.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="security" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">Meus dados e dos meus clientes estão seguros?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Sim. Levamos a segurança a sério. Seus dados são criptografados e armazenados em servidores protegidos. 
                Compartilhamos suas informações apenas com a Stripe, que é a empresa responsável pela cobrança.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="change-plan" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">Posso mudar de plano depois?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Sim, você pode fazer upgrade do seu plano a qualquer momento.
                As mudanças serão aplicadas no próximo ciclo de cobrança.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="target-audience" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">Para quem é o Datazap?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                O Datazap é para quem quer ter mais tempo para se concentrar no que importa.
                A Datazap é feita para proprietários de empresas, profissionais de marketing e líderes de agências que buscam aproveitar ferramentas avançadas para transformar suas estratégias de comunicação.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="payment-methods" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">Quais métodos de pagamento são aceitos?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Aceitamos cartão de crédito.
                Todos os pagamentos são processados de forma segura pelo Stripe. (Em breve mais meios de pagamento)
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cancel-subscription" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">Posso cancelar a assinatura?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Sim, você pode cancelar sua assinatura a qualquer momento.
                Mas lembre-se que você não poderá mais acessar os recursos do plano. 
                E as mensagens agendadas não serão enviadas. Exemplo: aniversários agendados, natal, etc.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="whatsapp-block" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">Meu número de WhatsApp pode ser bloqueado ao usar o Data Zap?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Sim. O uso do WhatsApp para envios em massa (massivos ou automatizados sem controle) pode violar os Termos de Uso da plataforma do WhatsApp e resultar no bloqueio temporário ou definitivo do seu número.
                O Data Zap não recomenda o uso indiscriminado de envios e orienta que as mensagens sejam programadas com responsabilidade, visando sempre o bom relacionamento com os seus contatos.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-it-works" className="border rounded-lg overflow-hidden">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                <span className="font-medium text-left">O Data Zap é seguro? Como os envios são feitos?</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground">
                Sim, o Data Zap utiliza a Evolution API para realizar os envios de mensagens. Essa integração é feita com configurações avançadas de proxy e intervalos de tempo personalizados entre os disparos, o que reduz significativamente o risco de bloqueios e melhora a entrega das mensagens.
                Mesmo assim, é importante reforçar que o uso responsável e consciente da ferramenta é essencial para preservar a saúde do seu número de WhatsApp.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlansPage;
