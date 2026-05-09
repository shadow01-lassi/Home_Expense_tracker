const express = require('express');
const router = express.Router();
const n = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, n.getNotifications);
router.put('/:id/read', authenticate, n.markAsRead);
router.put('/read-all', authenticate, n.markAllAsRead);

module.exports = router;
