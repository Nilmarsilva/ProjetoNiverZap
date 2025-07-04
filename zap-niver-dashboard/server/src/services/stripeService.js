/**
 * Serviço para integração com a API do Stripe
 */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const stripeService = {
  /**
   * Criar um cliente no Stripe
   * @param {Object} customerData - Dados do cliente
   * @returns {Promise<Object>} - Cliente criado no Stripe
   */
  createCustomer: async (customerData) => {
    try {
      const customer = await stripe.customers.create({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: {
          line1: customerData.address,
          line2: customerData.complement,
          postal_code: customerData.zipcode,
          city: customerData.city,
          state: customerData.state,
          country: 'BR',
        },
        metadata: {
          document_type: customerData.document_type,
          document: customerData.document,
          user_id: customerData.externalReference
        }
      });
      
      return customer;
    } catch (error) {
      console.error('Erro ao criar cliente no Stripe:', error);
      throw error;
    }
  },
  
  /**
   * Criar uma sessão de checkout do Stripe
   * @param {Object} sessionData - Dados da sessão
   * @returns {Promise<Object>} - Sessão de checkout criada
   */
  createCheckoutSession: async (sessionData) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: sessionData.customerId,
        line_items: [
          {
            price_data: {
              currency: sessionData.currency || 'brl',
              product_data: {
                name: sessionData.description || 'Assinatura NiverZap',
              },
              unit_amount: sessionData.amount, // em centavos
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: sessionData.successUrl,
        cancel_url: sessionData.cancelUrl,
        metadata: sessionData.metadata || {},
      });
      
      return session;
    } catch (error) {
      console.error('Erro ao criar sessão de checkout no Stripe:', error);
      throw error;
    }
  },
  
  /**
   * Construir evento de webhook do Stripe
   * @param {Object} payload - Payload do webhook
   * @param {string} signature - Assinatura do webhook
   * @returns {Object} - Evento construído
   */
  constructWebhookEvent: (payload, signature) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (error) {
      console.error('Erro ao construir evento de webhook:', error);
      throw error;
    }
  },

  /**
   * Atualizar um cliente no Stripe
   * @param {string} customerId - ID do cliente no Stripe
   * @param {Object} customerData - Dados do cliente
   * @returns {Promise<Object>} - Cliente atualizado no Stripe
   */
  updateCustomer: async (customerId, customerData) => {
    try {
      const customer = await stripe.customers.update(customerId, {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: {
          line1: customerData.address,
          line2: customerData.complement,
          postal_code: customerData.zipcode,
          city: customerData.city,
          state: customerData.state,
          country: 'BR',
        },
        metadata: {
          document_type: customerData.document_type,
          document: customerData.document,
          user_id: customerData.externalReference
        }
      });
      
      return customer;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${customerId} no Stripe:`, error);
      throw error;
    }
  },

  /**
   * Buscar um cliente no Stripe
   * @param {string} customerId - ID do cliente no Stripe
   * @returns {Promise<Object>} - Cliente do Stripe
   */
  getCustomer: async (customerId) => {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      console.error(`Erro ao buscar cliente ${customerId} no Stripe:`, error);
      throw error;
    }
  },

  /**
   * Criar uma sessão de checkout do Stripe
   * @param {string} customerId - ID do cliente no Stripe
   * @param {Object} paymentData - Dados do pagamento
   * @returns {Promise<Object>} - Sessão de checkout
   */
  createCheckoutSession: async (customerId, paymentData) => {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: paymentData.productName,
                description: paymentData.description,
              },
              unit_amount: Math.round(paymentData.amount * 100), // Stripe trabalha com centavos
              recurring: paymentData.recurring ? {
                interval: paymentData.recurring.interval,
                interval_count: paymentData.recurring.intervalCount
              } : undefined,
            },
            quantity: 1,
          },
        ],
        mode: paymentData.recurring ? 'subscription' : 'payment',
        success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/checkout?canceled=true`,
        metadata: {
          user_id: paymentData.userId,
          plan_id: paymentData.planId
        }
      });
      
      return session;
    } catch (error) {
      console.error('Erro ao criar sessão de checkout no Stripe:', error);
      throw error;
    }
  }
};

module.exports = stripeService;
