const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getPartnershipMessages,
  markMessagesAsRead,
  getUnreadCount
} = require('../controllers/messageController');

// All routes are protected
router.use(protect);

// Message routes
router.post('/', sendMessage);
router.get('/partnership/:partnershipId', getPartnershipMessages);
router.put('/read', markMessagesAsRead);
router.get('/unread/count', getUnreadCount);

module.exports = router; 