const asyncHandler = require('express-async-handler');
const Wallet = require('../models/walletModel');
const Transaction = require('../models/transactionModel');
const Partnership = require('../models/partnershipModel');

// Helper function to generate a unique transaction reference
const generateTransactionReference = () => {
  return `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// @desc    Get user wallet or create if not exists
// @route   GET /api/wallet
// @access  Private
const getUserWallet = asyncHandler(async (req, res) => {
  let wallet = await Wallet.findOne({ user: req.user._id });

  // If wallet doesn't exist, create one
  if (!wallet) {
    wallet = await Wallet.create({
      user: req.user._id,
      balance: 0,
      escrowBalance: 0,
      currency: 'USD'
    });
  }

  res.json(wallet);
});

// @desc    Deposit funds to wallet
// @route   POST /api/wallet/deposit
// @access  Private
const depositFunds = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Please provide a valid amount');
  }

  // Get wallet or create if it doesn't exist
  let wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    wallet = await Wallet.create({
      user: req.user._id,
      balance: 0,
      escrowBalance: 0,
      currency: 'USD'
    });
  }

  // Create transaction record
  const transaction = await Transaction.create({
    wallet: wallet._id,
    user: req.user._id,
    type: 'deposit',
    amount,
    currency: wallet.currency,
    status: 'completed',
    description: 'Deposit funds',
    reference: generateTransactionReference()
  });

  // Update wallet balance
  wallet.balance += amount;
  await wallet.save();

  res.status(201).json({ wallet, transaction });
});

// @desc    Withdraw funds from wallet
// @route   POST /api/wallet/withdraw
// @access  Private
const withdrawFunds = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Please provide a valid amount');
  }

  // Get wallet
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  // Check if enough balance
  if (wallet.balance < amount) {
    res.status(400);
    throw new Error('Insufficient funds');
  }

  // Create transaction record
  const transaction = await Transaction.create({
    wallet: wallet._id,
    user: req.user._id,
    type: 'withdrawal',
    amount,
    currency: wallet.currency,
    status: 'completed',
    description: 'Withdraw funds',
    reference: generateTransactionReference()
  });

  // Update wallet balance
  wallet.balance -= amount;
  await wallet.save();

  res.status(201).json({ wallet, transaction });
});

// @desc    Transfer funds to escrow for a partnership
// @route   POST /api/wallet/escrow/:partnershipId
// @access  Private
const transferToEscrow = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const { partnershipId } = req.params;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Please provide a valid amount');
  }

  // Check if partnership exists
  const partnership = await Partnership.findById(partnershipId);
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
    throw new Error('Not authorized to access this partnership');
  }

  // Check if partnership is accepted
  if (partnership.status !== 'accepted') {
    res.status(400);
    throw new Error('Cannot transfer funds to escrow for a partnership that is not accepted');
  }

  // Get wallet
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  // Check if enough balance
  if (wallet.balance < amount) {
    res.status(400);
    throw new Error('Insufficient funds');
  }

  // Create transaction record
  const transaction = await Transaction.create({
    wallet: wallet._id,
    user: req.user._id,
    type: 'escrow_lock',
    amount,
    currency: wallet.currency,
    status: 'completed',
    description: `Funds locked in escrow for partnership`,
    partnership: partnershipId,
    reference: generateTransactionReference()
  });

  // Update wallet balance
  wallet.balance -= amount;
  wallet.escrowBalance += amount;
  await wallet.save();

  // Update partnership agreement financial stake
  if (!partnership.agreement) {
    partnership.agreement = {};
  }
  
  partnership.agreement.financialStake = {
    amount,
    currency: wallet.currency
  };
  
  await partnership.save();

  res.status(201).json({ wallet, transaction, partnership });
});

// @desc    Release funds from escrow 
// @route   POST /api/wallet/escrow/release/:partnershipId
// @access  Private
const releaseFromEscrow = asyncHandler(async (req, res) => {
  const { partnershipId } = req.params;
  const { isSuccess, description } = req.body;

  console.log('Release from escrow request received:', {
    partnershipId,
    userId: req.user._id,
    isSuccess,
    description
  });

  // Check if partnership exists
  const partnership = await Partnership.findById(partnershipId);
  if (!partnership) {
    console.log('Partnership not found:', partnershipId);
    res.status(404);
    throw new Error('Partnership not found');
  }

  // Check if user is part of the partnership
  if (
    partnership.requester.toString() !== req.user._id.toString() &&
    partnership.recipient.toString() !== req.user._id.toString()
  ) {
    console.log('User not authorized:', {
      userId: req.user._id,
      requester: partnership.requester,
      recipient: partnership.recipient
    });
    res.status(403);
    throw new Error('Not authorized to access this partnership');
  }

  // Make sure partnership has an agreement with financial stake
  if (!partnership.agreement || !partnership.agreement.financialStake || partnership.agreement.financialStake.amount <= 0) {
    console.log('No funds in escrow for this partnership:', {
      partnershipId,
      agreement: partnership.agreement
    });
    res.status(400);
    throw new Error('No funds in escrow for this partnership');
  }

  // Check if partnership is already completed
  if (partnership.status === 'completed') {
    console.log('Partnership already completed:', {
      partnershipId,
      status: partnership.status
    });
    res.status(400);
    throw new Error('This agreement has already been completed and funds released');
  }

  // Get wallet
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    console.log('Wallet not found for user:', req.user._id);
    res.status(404);
    throw new Error('Wallet not found');
  }

  const amount = partnership.agreement.financialStake.amount;
  const transactionType = isSuccess ? 'reward' : 'penalty';

  console.log('Creating transaction:', {
    walletId: wallet._id,
    userId: req.user._id,
    type: transactionType,
    amount,
    partnershipId
  });

  // Check if there was ever an escrow_lock transaction for this partnership
  const escrowLockTransaction = await Transaction.findOne({
    partnership: partnershipId,
    type: 'escrow_lock',
    user: req.user._id
  });

  if (!escrowLockTransaction) {
    console.log('No escrow lock transaction found for this partnership');
    res.status(400);
    throw new Error('No funds were ever locked in escrow for this partnership');
  }

  // Check if there was already a reward/penalty transaction for this partnership
  const existingReleaseTransaction = await Transaction.findOne({
    partnership: partnershipId,
    type: { $in: ['reward', 'penalty'] },
    user: req.user._id
  });

  if (existingReleaseTransaction) {
    console.log('Funds already released for this partnership:', {
      existingReleaseTransaction
    });
    res.status(400);
    throw new Error('Funds have already been released for this partnership');
  }

  // Check if there are enough funds in escrow - only if no release has happened yet
  if (wallet.escrowBalance < amount) {
    console.log('Insufficient escrow balance:', {
      escrowBalance: wallet.escrowBalance,
      amount
    });
    
    // If escrow balance is too low but we have a lock transaction, fix the wallet balance
    wallet.escrowBalance = amount; // Restore the escrow balance
    await wallet.save();
    console.log('Fixed escrow balance:', wallet.escrowBalance);
  }

  // Create transaction record
  const transaction = await Transaction.create({
    wallet: wallet._id,
    user: req.user._id,
    type: transactionType,
    amount,
    currency: wallet.currency,
    status: 'completed',
    description: description || `Escrow funds ${isSuccess ? 'released back' : 'penalized'} for partnership`,
    partnership: partnershipId,
    reference: generateTransactionReference()
  });

  // Update wallet balance
  if (isSuccess) {
    wallet.balance += amount;
  }
  wallet.escrowBalance -= amount;
  await wallet.save();

  console.log('Wallet updated:', {
    balance: wallet.balance,
    escrowBalance: wallet.escrowBalance
  });

  // Mark the partnership as completed
  partnership.status = 'completed';
  await partnership.save();

  console.log('Partnership marked as completed');

  res.status(201).json({ wallet, transaction, partnership });
});

// @desc    Get wallet transaction history
// @route   GET /api/wallet/transactions
// @access  Private
const getTransactionHistory = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user._id });
  if (!wallet) {
    res.status(404);
    throw new Error('Wallet not found');
  }

  const transactions = await Transaction.find({ wallet: wallet._id })
    .sort({ createdAt: -1 })
    .populate('partnership', 'status');

  res.json(transactions);
});

module.exports = {
  getUserWallet,
  depositFunds,
  withdrawFunds,
  transferToEscrow,
  releaseFromEscrow,
  getTransactionHistory,
}; 