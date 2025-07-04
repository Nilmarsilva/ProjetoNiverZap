/**
 * Controlador para pagamentos e assinaturas
 */
const stripeService = require('../services/stripeService');
const User = require('../models/userModel');

const paymentController = {
  /**
   * Criar uma sessão de checkout do Stripe
   */
  createCheckoutSession: async (req, res) => {
    try {
      const userId = req.user.id;
      const { 
        customerId, 
        planId, 
        planName, 
        cycle, 
        price, 
        description,
        successUrl,
        cancelUrl,
        metadata 
      } = req.body;
      
      // Verificar se o usuário existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Verificar se o usuário tem um cliente Stripe associado
      if (!user.stripe_customer_id) {
        return res.status(400).json({ 
          error: 'Usuário não tem um cliente Stripe associado' 
        });
      }
      
      // Criar sessão de checkout
      const session = await stripeService.createCheckoutSession({
        customerId: user.stripe_customer_id,
        amount: price * 100, // Stripe trabalha com centavos
        currency: 'brl',
        description,
        successUrl,
        cancelUrl,
        metadata: {
          ...metadata,
          user_id: userId
        }
      });
      
      res.status(200).json({
        url: session.url
      });
    } catch (error) {
      console.error('Erro ao criar sessão de checkout:', error);
      res.status(500).json({ error: 'Erro ao criar sessão de checkout' });
    }
  },
  
  /**
   * Manipular webhook do Stripe
   */
  handleStripeWebhook: async (req, res) => {
    const signature = req.headers['stripe-signature'];
    
    try {
      const event = stripeService.constructWebhookEvent(req.body, signature);
      
      // Processar diferentes tipos de eventos
      switch (event.type) {
        case 'checkout.session.completed':
          // Processar pagamento bem-sucedido
          const session = event.data.object;
          await processSuccessfulPayment(session);
          break;
          
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          // Atualizar status da assinatura
          const subscription = event.data.object;
          await updateSubscriptionStatus(subscription);
          break;
          
        case 'customer.subscription.deleted':
          // Processar cancelamento de assinatura
          const canceledSubscription = event.data.object;
          await handleCanceledSubscription(canceledSubscription);
          break;
          
        default:
          console.log(`Evento não processado: ${event.type}`);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      res.status(400).json({ error: 'Webhook error' });
    }
  }
};

/**
 * Processar pagamento bem-sucedido
 */
async function processSuccessfulPayment(session) {
  try {
    const userId = session.metadata.user_id;
    const planId = session.metadata.plan_id;
    const billingCycle = session.metadata.billing_cycle;
    
    // Atualizar o plano do usuário no banco de dados
    // Implementação depende da estrutura do banco de dados
    console.log(`Processando pagamento para usuário ${userId}, plano ${planId}, ciclo ${billingCycle}`);
    
    // TODO: Implementar atualização do plano do usuário
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
  }
}

/**
 * Atualizar status da assinatura
 */
async function updateSubscriptionStatus(subscription) {
  try {
    const customerId = subscription.customer;
    const status = subscription.status;
    
    // Buscar usuário pelo ID do cliente Stripe
    const user = await User.findByStripeCustomerId(customerId);
    if (!user) {
      console.error(`Usuário não encontrado para o cliente Stripe ${customerId}`);
      return;
    }
    
    // Atualizar status da assinatura do usuário
    // Implementação depende da estrutura do banco de dados
    console.log(`Atualizando status da assinatura para ${status} para o usuário ${user.id}`);
    
    // TODO: Implementar atualização do status da assinatura
  } catch (error) {
    console.error('Erro ao atualizar status da assinatura:', error);
  }
}

/**
 * Processar cancelamento de assinatura
 */
async function handleCanceledSubscription(subscription) {
  try {
    const customerId = subscription.customer;
    
    // Buscar usuário pelo ID do cliente Stripe
    const user = await User.findByStripeCustomerId(customerId);
    if (!user) {
      console.error(`Usuário não encontrado para o cliente Stripe ${customerId}`);
      return;
    }
    
    // Processar cancelamento da assinatura
    // Implementação depende da estrutura do banco de dados
    console.log(`Processando cancelamento de assinatura para o usuário ${user.id}`);
    
    // TODO: Implementar processamento de cancelamento de assinatura
  } catch (error) {
    console.error('Erro ao processar cancelamento de assinatura:', error);
  }
}

module.exports = paymentController;
