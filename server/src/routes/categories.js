const express = require('express');
const router = express.Router();
const c = require('../controllers/categoryController');
const { authenticate, requireFamily } = require('../middleware/auth');

router.get('/', authenticate, requireFamily, c.getCategories);
router.post('/', authenticate, requireFamily, c.addCategory);
router.put('/:id', authenticate, requireFamily, c.updateCategory);
router.delete('/:id', authenticate, requireFamily, c.deleteCategory);

module.exports = router;
