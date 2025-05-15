const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const Partnership = require('../models/partnershipModel');
const { filterContent } = require('../utils/contentFilter');
const axios = require('axios');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { partnershipId, content } = req.body;

  if (!content.trim()) {
    res.status(400);
    throw new Error('Message content is required');
  }

  // Verify partnership exists and user is a participant
  const partnership = await Partnership.findById(partnershipId);
  if (!partnership) {
    res.status(404);
    throw new Error('Partnership not found');
  }

  // Check if user is either the requester or recipient
  const isParticipant = 
    partnership.requester.toString() === req.user.id || 
    partnership.recipient.toString() === req.user.id;
    
  if (!isParticipant) {
    res.status(403);
    throw new Error('You are not a participant in this partnership');
  }

  // Filter content
  const { filteredContent, filterReason, isFiltered, penaltyAmount, originalContent } = filterContent(content);

  // Create message
  const message = await Message.create({
    partnership: partnershipId,
    sender: req.user.id,
    content: filteredContent,
    isFiltered,
    filterReason,
    filteredContent: isFiltered ? filteredContent : ''
  });

  // Populate sender info
  await message.populate('sender', 'name');

  // If content was filtered, create a moderation record asynchronously
  if (isFiltered) {
    try {
      // We're using internal API call here to avoid circular dependencies
      await axios.post(`${req.protocol}://${req.get('host')}/api/moderation/flag`, {
        messageId: message._id,
        violationType: filterReason,
        originalContent,
        filteredContent,
        penaltyAmount
      }, {
        headers: {
          Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`
        }
      });
      
      console.log(`Moderation record created for message ${message._id}`);
    } catch (error) {
      console.error('Error creating moderation record:', error.message);
      // We don't want to fail the message send if moderation fails
      // In a production app, you might want to log this to a monitoring system
    }
  }

  res.status(201).json(message);
});

// @desc    Get messages for a partnership
// @route   GET /api/messages/partnership/:partnershipId
// @access  Private
const getPartnershipMessages = asyncHandler(async (req, res) => {
  const { partnershipId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  // Verify partnership exists and user is a participant
  const partnership = await Partnership.findById(partnershipId);
  if (!partnership) {
    res.status(404);
    throw new Error('Partnership not found');
  }

  // Check if user is either the requester or recipient
  const isParticipant = 
    partnership.requester.toString() === req.user.id || 
    partnership.recipient.toString() === req.user.id;
    
  if (!isParticipant) {
    res.status(403);
    throw new Error('You are not a participant in this partnership');
  }

  // Get messages
  const messages = await Message.find({ partnership: partnershipId })
    .populate('sender', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const total = await Message.countDocuments({ partnership: partnershipId });

  res.status(200).json({
    messages,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

// @desc    Mark messages as read
// @route   PUT /api/messages/read
// @access  Private
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { messageIds } = req.body;

  if (!messageIds || !Array.isArray(messageIds)) {
    res.status(400);
    throw new Error('Message IDs array is required');
  }

  // Update messages
  await Message.updateMany(
    {
      _id: { $in: messageIds },
      sender: { $ne: req.user.id },
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );

  res.status(200).json({ message: 'Messages marked as read' });
});

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  // Get all partnerships where user is a participant
  const partnerships = await Partnership.find({
    $or: [
      { requester: req.user.id },
      { recipient: req.user.id }
    ]
  }).select('_id');

  const partnershipIds = partnerships.map(p => p._id);

  // Count unread messages
  const count = await Message.countDocuments({
    partnership: { $in: partnershipIds },
    sender: { $ne: req.user.id },
    isRead: false
  });

  res.status(200).json({ count });
});

// @desc    Get filtered message count for a user
// @route   GET /api/messages/filtered/count
// @access  Private
const getFilteredCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    sender: req.user.id,
    isFiltered: true
  });

  res.status(200).json({ count });
});

module.exports = {
  sendMessage,
  getPartnershipMessages,
  markMessagesAsRead,
  getUnreadCount,
  getFilteredCount
}; 