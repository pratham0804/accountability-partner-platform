const express = require('express');
const router = express.Router();
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  sendAdminNotification
} = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes that require admin permissions
router.route('/admin/send')
  .post(protect, admin, sendAdminNotification);

// Standard user routes
router.route('/')
  .get(protect, getUserNotifications)
  .post(protect, createNotification);

router.route('/read')
  .put(protect, markAsRead);

router.route('/read-all')
  .put(protect, markAllAsRead);

router.route('/unread/count')
  .get(protect, getUnreadCount);

router.route('/:id')
  .delete(protect, deleteNotification);

module.exports = router; 