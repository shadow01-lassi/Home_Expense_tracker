const express = require('express');
const router = express.Router();
const a = require('../controllers/adminController');
const { authenticate, requireFamily, requireAdmin } = require('../middleware/auth');

router.get('/users', authenticate, requireFamily, requireAdmin, a.getUsers);
router.delete('/users/:userId', authenticate, requireFamily, requireAdmin, a.removeUser);
router.get('/logs', authenticate, requireFamily, requireAdmin, a.getActivityLogs);

module.exports = router;
