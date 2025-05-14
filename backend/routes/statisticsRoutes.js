const express = require('express');
const router = express.Router();
const {
  getUserStatistics,
  getPlatformStatistics,
  refreshUserStatistics
} = require('../controllers/statisticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// User specific statistics
router.route('/')
  .get(protect, getUserStatistics);

// Platform-wide statistics (admin only)
router.route('/platform')
  .get(protect, admin, getPlatformStatistics);

// Manually refresh user statistics
router.route('/refresh')
  .put(protect, refreshUserStatistics);

module.exports = router; 