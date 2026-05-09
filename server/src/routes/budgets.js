const express = require('express');
const router = express.Router();
const { getBudget, setBudget, getBudgetStatus } = require('../controllers/budgetController');
const { authenticate, requireFamily } = require('../middleware/auth');

router.get('/', authenticate, requireFamily, getBudget);
router.post('/', authenticate, requireFamily, setBudget);
router.get('/status', authenticate, requireFamily, getBudgetStatus);

module.exports = router;
