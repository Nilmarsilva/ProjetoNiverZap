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
import { Check, RefreshCw } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/userService';
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
      monthly: 49.90,
      yearly: 479.00
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
      monthly: 99.90,
      yearly: 959.00
    },
    description: 'Perfeito para empresas em crescimento',
    features: [
      'Até 2.000 contatos',
      'Até 5.000 mensagens/mês',
      '2 números de WhatsApp',
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
      monthly: 199.90,
      yearly: 1919.00
    },
    description: 'Para empresas que precisam de mais recursos',
    features: [
      'Contatos ilimitados',
      'Mensagens ilimitadas',
      '5 números de WhatsApp',
      'Suporte 24/7',
      'API personalizada',
      'Integrações avançadas',
      'Relatórios personalizados'
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
    
    // Verificar se o perfil do usuário está completo
    const isComplete = await userService.isProfileComplete(user.id);
    
    if (!isComplete) {
      // Perfil incompleto, redirecionar para a página de configurações
      toast({
        title: 'Perfil incompleto',
        description: 'Você precisa completar seu perfil antes de assinar um plano',
        variant: 'destructive'
      });
      navigate('/configuracoes?tab=profile&redirect=/plans');
      return;
    }
    
    // Iniciar o processo de checkout para o plano selecionado
    handleCheckout(plan.id, billingCycle);
  };
  
  // Função para iniciar o processo de checkout
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
      
      // Preparar parâmetros para o checkout
      const checkoutParams = {
        name: userData.name,
        email: userData.email,
        cpfCnpj: userData.document || '00000000000', // Documento é obrigatório para pagamentos
        phone: userData.phone || '00000000000', // Telefone é obrigatório para pagamentos
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        cycle: billingCycle,
        value: billingCycle === 'monthly' ? selectedPlan.price.monthly : selectedPlan.price.yearly,
        description: `Assinatura ${selectedPlan.name} - Ciclo ${billingCycle === 'monthly' ? 'Mensal' : 'Anual'}`,
        returnUrl: `${window.location.origin}/checkout/success`,
        externalReference: `user_${userData.id}_plan_${selectedPlan.id}_${billingCycle}`
      };
      
      console.log('Dados do checkout:', checkoutParams);
      
      // Usar checkout simulado para testes enquanto a integração com Stripe não está implementada
      console.log('Usando checkout simulado para testes');
      const checkoutUrl = `${window.location.origin}/checkout/success?simulado=true&plan=${selectedPlan.id}&cycle=${billingCycle}`;
      
      // TODO: Implementar integração com Stripe
      // A integração com Stripe será implementada em breve
      // Documentação: https://stripe.com/docs/checkout/quickstart
      
      // Redirecionar para a página de checkout
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error: any) {
      console.error('Erro ao processar checkout:', error);
      
      toast({
        title: 'Erro ao processar checkout',
        description: error.message || 'Ocorreu um erro ao processar o checkout',
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
                  20% OFF
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Cards de planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative ${plan.recommended ? 'border-datazap-green shadow-lg' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="bg-datazap-green">Mais Popular</Badge>
                </div>
              )}
              
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
              
              <CardFooter>
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
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Perguntas Frequentes</h2>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Posso mudar de plano depois?</h3>
              <p className="text-muted-foreground">
                Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento.
                As mudanças serão aplicadas no próximo ciclo de cobrança.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Como funciona o período de teste?</h3>
              <p className="text-muted-foreground">
                Oferecemos um período de teste de 7 dias para todos os planos.
                Você não será cobrado durante esse período e pode cancelar a qualquer momento.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Quais métodos de pagamento são aceitos?</h3>
              <p className="text-muted-foreground">
                Aceitamos cartão de crédito, boleto bancário e PIX.
                Todos os pagamentos são processados de forma segura pelo Asaas.
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Posso cancelar a assinatura?</h3>
              <p className="text-muted-foreground">
                Sim, você pode cancelar sua assinatura a qualquer momento.
                Não há taxas de cancelamento ou contratos de longo prazo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PlansPage;
