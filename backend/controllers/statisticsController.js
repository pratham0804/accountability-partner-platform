const asyncHandler = require('express-async-handler');
const Statistics = require('../models/statisticsModel');
const Task = require('../models/taskModel');
const Partnership = require('../models/partnershipModel');
const Transaction = require('../models/transactionModel');
const Proof = require('../models/proofModel');
const User = require('../models/userModel');

// @desc    Get user statistics
// @route   GET /api/statistics
// @access  Private
const getUserStatistics = asyncHandler(async (req, res) => {
  // Try to find existing statistics for user
  let statistics = await Statistics.findOne({ user: req.user._id });

  // If no statistics exist, create new ones
  if (!statistics) {
    statistics = await createInitialStatistics(req.user._id);
  } else {
    // If statistics are older than 1 day, refresh them
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    if (statistics.lastUpdated < oneDayAgo) {
      statistics = await refreshStatistics(req.user._id, statistics);
    }
  }

  res.status(200).json(statistics);
});

// @desc    Generate platform-wide statistics (admin only)
// @route   GET /api/statistics/platform
// @access  Private/Admin
const getPlatformStatistics = asyncHandler(async (req, res) => {
  // Get counts of various entities
  const [
    totalUsers,
    totalTasks,
    completedTasks,
    totalPartnerships,
    activePartnerships,
    completedPartnerships,
    totalTransactions,
    transactionVolume
  ] = await Promise.all([
    User.countDocuments(),
    Task.countDocuments(),
    Task.countDocuments({ status: 'completed' }),
    Partnership.countDocuments(),
    Partnership.countDocuments({ status: 'accepted' }),
    Partnership.countDocuments({ status: 'completed' }),
    Transaction.countDocuments(),
    Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  const platformStats = {
    users: {
      total: totalUsers
    },
    tasks: {
      total: totalTasks,
      completed: completedTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 0
    },
    partnerships: {
      total: totalPartnerships,
      active: activePartnerships,
      completed: completedPartnerships
    },
    transactions: {
      count: totalTransactions,
      volume: transactionVolume.length > 0 ? transactionVolume[0].total : 0
    },
    generatedAt: new Date()
  };

  res.status(200).json(platformStats);
});

// @desc    Manually refresh user statistics
// @route   PUT /api/statistics/refresh
// @access  Private
const refreshUserStatistics = asyncHandler(async (req, res) => {
  // Find existing statistics
  let statistics = await Statistics.findOne({ user: req.user._id });

  if (!statistics) {
    statistics = await createInitialStatistics(req.user._id);
  } else {
    statistics = await refreshStatistics(req.user._id, statistics);
  }

  res.status(200).json(statistics);
});

// Helper function to create initial statistics
const createInitialStatistics = async (userId) => {
  // Fetch data for calculating statistics
  const [
    tasks,
    partnerships,
    transactions,
    proofs
  ] = await Promise.all([
    Task.find({ user: userId }),
    Partnership.find({ 
      $or: [{ requester: userId }, { recipient: userId }]
    }),
    Transaction.find({ user: userId }),
    Proof.find({ user: userId })
  ]);

  // Calculate task statistics
  const tasksCreated = tasks.length;
  const tasksCompleted = tasks.filter(task => task.status === 'completed').length;
  const tasksInProgress = tasks.filter(task => task.status === 'in_progress').length;
  const taskCompletionRate = tasksCreated > 0 ? (tasksCompleted / tasksCreated * 100) : 0;

  // Calculate partnership statistics
  const activeParnerships = partnerships.filter(p => p.status === 'accepted').length;
  const completedPartnerships = partnerships.filter(p => p.status === 'completed').length;
  const partnershipsInitiated = partnerships.filter(p => p.requester.toString() === userId.toString()).length;
  const acceptedPartnerships = partnerships.filter(p => 
    p.recipient.toString() === userId.toString() && p.status === 'accepted'
  ).length;
  const rejectedPartnerships = partnerships.filter(p => 
    p.recipient.toString() === userId.toString() && p.status === 'rejected'
  ).length;

  // Calculate escrow statistics
  const escrowDeposits = transactions.filter(t => t.type === 'escrow_lock');
  const totalFundsStaked = escrowDeposits.reduce((sum, t) => sum + t.amount, 0);
  
  const rewardTransactions = transactions.filter(t => t.type === 'reward');
  const totalRewardsEarned = rewardTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const penaltyTransactions = transactions.filter(t => t.type === 'penalty');
  const totalPenaltiesIncurred = penaltyTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate proof statistics
  const proofsSubmitted = proofs.length;
  const proofsVerified = proofs.filter(p => p.status === 'verified').length;
  const proofsRejected = proofs.filter(p => p.status === 'rejected').length;
  const proofSuccessRate = proofsSubmitted > 0 ? (proofsVerified / proofsSubmitted * 100) : 0;

  // Calculate time-based metrics
  // (These would typically require additional logic for streaks and avg completion time)
  const averageTaskCompletionTime = 0;
  const longestStreak = 0;
  const currentStreak = 0;

  // Create and return new statistics document
  return await Statistics.create({
    user: userId,
    tasksCreated,
    tasksCompleted,
    tasksInProgress,
    taskCompletionRate,
    activeParnerships,
    completedPartnerships,
    partnershipsInitiated,
    acceptedPartnerships,
    rejectedPartnerships,
    totalFundsStaked,
    totalRewardsEarned,
    totalPenaltiesIncurred,
    proofsSubmitted,
    proofsVerified,
    proofsRejected,
    proofSuccessRate,
    averageTaskCompletionTime,
    longestStreak,
    currentStreak,
    lastUpdated: new Date()
  });
};

// Helper function to refresh existing statistics
const refreshStatistics = async (userId, statistics) => {
  // Similar logic to createInitialStatistics, but update existing document
  const [
    tasks,
    partnerships,
    transactions,
    proofs
  ] = await Promise.all([
    Task.find({ user: userId }),
    Partnership.find({ 
      $or: [{ requester: userId }, { recipient: userId }]
    }),
    Transaction.find({ user: userId }),
    Proof.find({ user: userId })
  ]);

  // Recalculate all statistics (similar to createInitialStatistics)
  // Update the statistics object

  // Calculate task statistics
  statistics.tasksCreated = tasks.length;
  statistics.tasksCompleted = tasks.filter(task => task.status === 'completed').length;
  statistics.tasksInProgress = tasks.filter(task => task.status === 'in_progress').length;
  statistics.taskCompletionRate = statistics.tasksCreated > 0 
    ? (statistics.tasksCompleted / statistics.tasksCreated * 100) 
    : 0;

  // Calculate partnership statistics
  statistics.activeParnerships = partnerships.filter(p => p.status === 'accepted').length;
  statistics.completedPartnerships = partnerships.filter(p => p.status === 'completed').length;
  statistics.partnershipsInitiated = partnerships.filter(p => 
    p.requester.toString() === userId.toString()
  ).length;
  statistics.acceptedPartnerships = partnerships.filter(p => 
    p.recipient.toString() === userId.toString() && p.status === 'accepted'
  ).length;
  statistics.rejectedPartnerships = partnerships.filter(p => 
    p.recipient.toString() === userId.toString() && p.status === 'rejected'
  ).length;

  // Calculate escrow statistics
  const escrowDeposits = transactions.filter(t => t.type === 'escrow_lock');
  statistics.totalFundsStaked = escrowDeposits.reduce((sum, t) => sum + t.amount, 0);
  
  const rewardTransactions = transactions.filter(t => t.type === 'reward');
  statistics.totalRewardsEarned = rewardTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const penaltyTransactions = transactions.filter(t => t.type === 'penalty');
  statistics.totalPenaltiesIncurred = penaltyTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Calculate proof statistics
  statistics.proofsSubmitted = proofs.length;
  statistics.proofsVerified = proofs.filter(p => p.status === 'verified').length;
  statistics.proofsRejected = proofs.filter(p => p.status === 'rejected').length;
  statistics.proofSuccessRate = statistics.proofsSubmitted > 0 
    ? (statistics.proofsVerified / statistics.proofsSubmitted * 100) 
    : 0;

  // Update timestamp
  statistics.lastUpdated = new Date();

  // Save and return updated statistics
  await statistics.save();
  return statistics;
};

module.exports = {
  getUserStatistics,
  getPlatformStatistics,
  refreshUserStatistics
}; 