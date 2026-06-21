const express = require('express');
const { getAnalytics, refreshAnalytics } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.get('/', getAnalytics);
router.post('/refresh', refreshAnalytics);

module.exports = router;
