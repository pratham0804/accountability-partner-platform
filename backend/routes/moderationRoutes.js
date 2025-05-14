const express = require('express');
const router = express.Router();
const { 
  flagMessageContent, 
  applyPenalty, 
  sendNotification, 
  getUserModerations, 
  getAllModerations,
  getModerationStats
} = require('../controllers/moderationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes that require admin permissions
router.route('/')
  .get(protect, admin, getAllModerations);

router.route('/stats')
  .get(protect, admin, getModerationStats);

router.route('/flag')
  .post(protect, flagMessageContent);

router.route('/user/:userId')
  .get(protect, admin, getUserModerations);

router.route('/:id/apply-penalty')
  .post(protect, admin, applyPenalty);

router.route('/:id/notify')
  .post(protect, admin, sendNotification);

module.exports = router; 