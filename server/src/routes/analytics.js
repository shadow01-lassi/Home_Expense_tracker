const express = require('express');
const router = express.Router();
const { getSummary, getTrends, getInsights } = require('../controllers/analyticsController');
const { authenticate, requireFamily } = require('../middleware/auth');

router.get('/summary', authenticate, requireFamily, getSummary);
router.get('/trends', authenticate, requireFamily, getTrends);
router.get('/insights', authenticate, requireFamily, getInsights);

module.exports = router;
