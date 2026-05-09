const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, updateExpense, deleteExpense, getExpense } = require('../controllers/expenseController');
const { authenticate, requireFamily } = require('../middleware/auth');

router.get('/', authenticate, requireFamily, getExpenses);
router.post('/', authenticate, requireFamily, addExpense);
router.get('/:id', authenticate, requireFamily, getExpense);
router.put('/:id', authenticate, requireFamily, updateExpense);
router.delete('/:id', authenticate, requireFamily, deleteExpense);

module.exports = router;
