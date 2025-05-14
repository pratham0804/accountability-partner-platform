const asyncHandler = require('express-async-handler');
const Moderation = require('../models/moderationModel');
const Message = require('../models/messageModel');
const Wallet = require('../models/walletModel');
const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');

// @desc    Create a moderation record for a filtered message
// @route   POST /api/moderation/flag
// @access  Private
const flagMessageContent = asyncHandler(async (req, res) => {
  const { messageId, violationType, originalContent, filteredContent, penaltyAmount } = req.body;

  // Verify message exists
  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Create moderation record
  const moderation = await Moderation.create({
    user: message.sender,
    message: messageId,
    partnership: message.partnership,
    violationType,
    originalContent,
    filteredContent,
    penaltyAmount,
    penaltyApplied: false,
    notificationSent: false
  });

  res.status(201).json(moderation);
});

// @desc    Apply penalties to user for content violations
// @route   POST /api/moderation/:id/apply-penalty
// @access  Private/Admin
const applyPenalty = asyncHandler(async (req, res) => {
  const moderation = await Moderation.findById(req.params.id);
  
  if (!moderation) {
    res.status(404);
    throw new Error('Moderation record not found');
  }

  if (moderation.penaltyApplied) {
    res.status(400);
    throw new Error('Penalty has already been applied');
  }

  // Get user's wallet
  const wallet = await Wallet.findOne({ user: moderation.user });
  if (!wallet) {
    res.status(404);
    throw new Error('User wallet not found');
  }

  // Ensure wallet has enough funds
  if (wallet.balance < moderation.penaltyAmount) {
    res.status(400);
    throw new Error('Insufficient funds to apply penalty');
  }

  // Create transaction for penalty
  const transaction = await Transaction.create({
    user: moderation.user,
    wallet: wallet._id,
    type: 'penalty',
    amount: moderation.penaltyAmount,
    status: 'completed',
    description: `Content moderation penalty for ${moderation.violationType}`,
    partnership: moderation.partnership
  });

  // Update wallet balance
  wallet.balance -= moderation.penaltyAmount;
  await wallet.save();

  // Update moderation record
  moderation.penaltyApplied = true;
  await moderation.save();

  res.status(200).json({
    message: 'Penalty applied successfully',
    moderation,
    transaction
  });
});

// @desc    Send notification to user about content violation
// @route   POST /api/moderation/:id/notify
// @access  Private/Admin
const sendNotification = asyncHandler(async (req, res) => {
  const moderation = await Moderation.findById(req.params.id);
  
  if (!moderation) {
    res.status(404);
    throw new Error('Moderation record not found');
  }

  if (moderation.notificationSent) {
    res.status(400);
    throw new Error('Notification has already been sent');
  }

  // Get user details
  const user = await User.findById(moderation.user);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // In a real app, you'd send an email or push notification here
  console.log(`[NOTIFICATION] Sending violation notification to ${user.name} (${user.email})`);
  console.log(`[NOTIFICATION] Violation type: ${moderation.violationType}`);
  console.log(`[NOTIFICATION] Original content: "${moderation.originalContent}"`);
  
  // Create a notification message
  const notificationMessage = {
    to: user.email,
    subject: 'Content Policy Violation Notice',
    body: `Dear ${user.name},\n\nWe noticed that your recent message violated our content policy regarding ${moderation.violationType}. The message has been filtered accordingly.\n\nPlease be mindful of our community guidelines to ensure a safe and respectful environment for all users.\n\nIf you believe this is in error, please contact our support team.\n\nRegards,\nAP-Platform Team`
  };
  
  console.log('[NOTIFICATION] Email content:', notificationMessage);
  
  // For real implementation, you would use an email service like:
  // await sendEmail(notificationMessage);
  
  // Mark as sent
  moderation.notificationSent = true;
  await moderation.save();

  res.status(200).json({
    message: 'Notification sent successfully',
    moderation,
    notificationDetails: notificationMessage
  });
});

// @desc    Get moderation records for a user
// @route   GET /api/moderation/user/:userId
// @access  Private/Admin
const getUserModerations = asyncHandler(async (req, res) => {
  const moderations = await Moderation.find({ user: req.params.userId })
    .sort({ createdAt: -1 })
    .populate('message', 'content createdAt');
  
  res.status(200).json(moderations);
});

// @desc    Get all moderation records
// @route   GET /api/moderation
// @access  Private/Admin
const getAllModerations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Filter options
  const filter = {};
  if (req.query.violationType) {
    filter.violationType = req.query.violationType;
  }
  if (req.query.penaltyApplied !== undefined) {
    filter.penaltyApplied = req.query.penaltyApplied === 'true';
  }
  if (req.query.notificationSent !== undefined) {
    filter.notificationSent = req.query.notificationSent === 'true';
  }

  const moderations = await Moderation.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email')
    .populate('message', 'content createdAt');
  
  const total = await Moderation.countDocuments(filter);

  res.status(200).json({
    moderations,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Get moderation statistics
// @route   GET /api/moderation/stats
// @access  Private/Admin
const getModerationStats = asyncHandler(async (req, res) => {
  // Get counts by violation type
  const violationStats = await Moderation.aggregate([
    {
      $group: {
        _id: '$violationType',
        count: { $sum: 1 },
        totalPenalties: { $sum: '$penaltyAmount' }
      }
    }
  ]);

  // Get total counts
  const totalModerations = await Moderation.countDocuments();
  const penaltyApplied = await Moderation.countDocuments({ penaltyApplied: true });
  const notificationSent = await Moderation.countDocuments({ notificationSent: true });

  // Get top users with violations
  const topViolators = await Moderation.aggregate([
    {
      $group: {
        _id: '$user',
        count: { $sum: 1 },
        totalPenalties: { $sum: '$penaltyAmount' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $unwind: '$userInfo'
    },
    {
      $project: {
        _id: 1,
        count: 1,
        totalPenalties: 1,
        'userInfo.name': 1,
        'userInfo.email': 1
      }
    }
  ]);

  res.status(200).json({
    totalModerations,
    penaltyApplied,
    notificationSent,
    violationStats,
    topViolators
  });
});

module.exports = {
  flagMessageContent,
  applyPenalty,
  sendNotification,
  getUserModerations,
  getAllModerations,
  getModerationStats
}; 