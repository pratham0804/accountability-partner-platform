const asyncHandler = require('express-async-handler');
const Partnership = require('../models/partnershipModel');
const User = require('../models/userModel');

// @desc    Send a partnership request
// @route   POST /api/partnerships
// @access  Private
const sendPartnershipRequest = asyncHandler(async (req, res) => {
  const { recipientId } = req.body;

  // Validate recipient ID
  if (!recipientId) {
    res.status(400);
    throw new Error('Recipient ID is required');
  }

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    res.status(404);
    throw new Error('Recipient not found');
  }

  // Check if user is trying to send request to themselves
  if (req.user._id.toString() === recipientId) {
    res.status(400);
    throw new Error('You cannot send a partnership request to yourself');
  }

  // Check if partnership request already exists
  const existingPartnership = await Partnership.findOne({
    $or: [
      { requester: req.user._id, recipient: recipientId },
      { requester: recipientId, recipient: req.user._id }
    ],
    status: { $in: ['pending', 'accepted'] }
  });

  if (existingPartnership) {
    res.status(400);
    throw new Error('A partnership request already exists between these users');
  }

  // Create new partnership request
  const partnership = await Partnership.create({
    requester: req.user._id,
    recipient: recipientId
  });

  res.status(201).json(partnership);
});

// @desc    Get all partnership requests for the current user
// @route   GET /api/partnerships
// @access  Private
const getPartnerships = asyncHandler(async (req, res) => {
  const partnerships = await Partnership.find({
    $or: [
      { requester: req.user._id },
      { recipient: req.user._id }
    ]
  })
    .populate('requester', 'name interests skills activityLevel')
    .populate('recipient', 'name interests skills activityLevel')
    .sort({ createdAt: -1 });

  res.json(partnerships);
});

// @desc    Get partnership by ID
// @route   GET /api/partnerships/:id
// @access  Private
const getPartnershipById = asyncHandler(async (req, res) => {
  const partnership = await Partnership.findById(req.params.id)
    .populate('requester', 'name interests skills activityLevel')
    .populate('recipient', 'name interests skills activityLevel');

  if (!partnership) {
    res.status(404);
    throw new Error('Partnership not found');
  }

  // Check if user is part of the partnership
  if (
    partnership.requester._id.toString() !== req.user._id.toString() &&
    partnership.recipient._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to access this partnership');
  }

  res.json(partnership);
});

// @desc    Accept a partnership request
// @route   PUT /api/partnerships/:id/accept
// @access  Private
const acceptPartnershipRequest = asyncHandler(async (req, res) => {
  const partnership = await Partnership.findById(req.params.id);

  if (!partnership) {
    res.status(404);
    throw new Error('Partnership request not found');
  }

  // Check if user is the recipient of the request
  if (partnership.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to accept this request');
  }

  // Check if the request is still pending
  if (partnership.status !== 'pending') {
    res.status(400);
    throw new Error('This request has already been processed');
  }

  // Accept the request
  partnership.status = 'accepted';
  await partnership.save();

  res.json(partnership);
});

// @desc    Reject a partnership request
// @route   PUT /api/partnerships/:id/reject
// @access  Private
const rejectPartnershipRequest = asyncHandler(async (req, res) => {
  const partnership = await Partnership.findById(req.params.id);

  if (!partnership) {
    res.status(404);
    throw new Error('Partnership request not found');
  }

  // Check if user is the recipient of the request
  if (partnership.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to reject this request');
  }

  // Check if the request is still pending
  if (partnership.status !== 'pending') {
    res.status(400);
    throw new Error('This request has already been processed');
  }

  // Reject the request
  partnership.status = 'rejected';
  await partnership.save();

  res.json(partnership);
});

// @desc    Create or update an agreement for an accepted partnership
// @route   PUT /api/partnerships/:id/agreement
// @access  Private
const createAgreement = asyncHandler(async (req, res) => {
  const { title, description, goals, startDate, endDate, financialStake } = req.body;

  if (!title || !description || !goals || !startDate || !endDate) {
    res.status(400);
    throw new Error('Please provide all required fields: title, description, goals, start and end dates');
  }

  const partnership = await Partnership.findById(req.params.id);

  if (!partnership) {
    res.status(404);
    throw new Error('Partnership not found');
  }

  // Check if user is part of the partnership
  if (
    partnership.requester.toString() !== req.user._id.toString() &&
    partnership.recipient.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to create an agreement for this partnership');
  }

  // Check if the partnership is accepted
  if (partnership.status !== 'accepted') {
    res.status(400);
    throw new Error('Cannot create an agreement for a partnership that is not accepted');
  }

  // Create or update the agreement
  partnership.agreement = {
    title,
    description,
    goals,
    startDate,
    endDate,
    financialStake: financialStake || { amount: 0, currency: 'USD' },
    createdAt: new Date()
  };

  await partnership.save();

  res.json(partnership);
});

module.exports = {
  sendPartnershipRequest,
  getPartnerships,
  getPartnershipById,
  acceptPartnershipRequest,
  rejectPartnershipRequest,
  createAgreement,
}; 