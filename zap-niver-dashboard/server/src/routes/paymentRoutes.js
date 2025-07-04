/**
 * Rotas para pagamentos e assinaturas
 */
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Criar sessão de checkout do Stripe
router.post('/create-checkout-session', authMiddleware.authenticate, paymentController.createCheckoutSession);

// Webhook para eventos do Stripe
router.post('/webhook', paymentController.handleStripeWebhook);

module.exports = router;
