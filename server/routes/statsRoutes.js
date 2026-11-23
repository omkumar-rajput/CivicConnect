const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('officer', 'admin'), getDashboardStats);

module.exports = router;
