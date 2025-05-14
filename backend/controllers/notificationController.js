const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
const createNotification = asyncHandler(async (req, res) => {
  const {
    recipient,
    type,
    title,
    message,
    link,
    task,
    proof,
    partnership,
    messageId,
    moderation,
    transaction,
    priority
  } = req.body;

  // Check if recipient is provided or use current user
  const recipientId = recipient || req.user.id;

  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    link: link || '',
    task,
    proof,
    partnership,
    message: messageId, // Using messageId to avoid conflict with message field
    moderation,
    transaction,
    priority: priority || 'medium'
  });

  res.status(201).json(notification);
});

// @desc    Get all notifications for authenticated user
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Apply filters if provided
  const filter = { recipient: req.user.id };
  if (req.query.type) {
    filter.type = req.query.type;
  }
  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === 'true';
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('task', 'title dueDate')
    .populate('proof', 'title submittedAt')
    .populate('partnership', 'requester recipient')
    .populate('moderation', 'violationType')
    .populate('transaction', 'amount type');

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false
  });

  res.status(200).json({
    notifications,
    page,
    pages: Math.ceil(total / limit),
    total,
    unread: unreadCount
  });
});

// @desc    Mark notifications as read
// @route   PUT /api/notifications/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    res.status(400);
    throw new Error('Notification IDs array is required');
  }

  // Update notifications
  const result = await Notification.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: req.user.id,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );

  res.status(200).json({ 
    message: 'Notifications marked as read',
    modifiedCount: result.modifiedCount
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  // Update all unread notifications for this user
  const result = await Notification.updateMany(
    {
      recipient: req.user.id,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );

  res.status(200).json({ 
    message: 'All notifications marked as read',
    modifiedCount: result.modifiedCount
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Make sure user owns the notification
  if (notification.recipient.toString() !== req.user.id) {
    res.status(403);
    throw new Error('User not authorized');
  }

  await notification.remove();
  res.status(200).json({ message: 'Notification removed' });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread/count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false
  });

  res.status(200).json({ count });
});

// @desc    Send notification to a specific user (for admin use)
// @route   POST /api/notifications/admin/send
// @access  Private/Admin
const sendAdminNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, priority } = req.body;

  if (!userId || !title || !message) {
    res.status(400);
    throw new Error('User ID, title and message are required');
  }

  const notification = await Notification.create({
    recipient: userId,
    type: 'system_message',
    title,
    message,
    priority: priority || 'high',
    // Set link to admin contact for follow-up
    link: '/contact-admin'
  });

  res.status(201).json({ 
    message: 'Admin notification sent successfully',
    notification
  });
});

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  sendAdminNotification
}; 