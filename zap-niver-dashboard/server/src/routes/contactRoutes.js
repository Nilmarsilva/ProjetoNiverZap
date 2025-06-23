const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const contactController = require('../controllers/contactController');

// Todas as rotas de contatos requerem autenticação
router.use(authMiddleware.authenticateToken);

// Rotas para gerenciamento de contatos
router.get('/', contactController.getUserContacts);
router.get('/count', contactController.countUserContacts);
router.get('/birthdays/today', contactController.getTodayBirthdays);
router.get('/birthdays/upcoming', contactController.getUpcomingBirthdays);
router.get('/:id', contactController.getContactById);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
