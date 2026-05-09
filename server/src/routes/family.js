const express = require('express');
const router = express.Router();
const { createFamily, joinFamily, getFamily, updateFamily, removeMember, leaveFamily, regenerateInviteCode } = require('../controllers/familyController');
const { authenticate, requireFamily, requireAdmin } = require('../middleware/auth');

router.post('/create', authenticate, createFamily);
router.post('/join', authenticate, joinFamily);
router.get('/', authenticate, requireFamily, getFamily);
router.put('/', authenticate, requireFamily, requireAdmin, updateFamily);
router.delete('/members/:userId', authenticate, requireFamily, requireAdmin, removeMember);
router.post('/leave', authenticate, requireFamily, leaveFamily);
router.post('/regenerate-code', authenticate, requireFamily, requireAdmin, regenerateInviteCode);

module.exports = router;
