const mongoose = require('mongoose');

const statisticsSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Task statistics
    tasksCreated: {
      type: Number,
      default: 0
    },
    tasksCompleted: {
      type: Number,
      default: 0
    },
    tasksInProgress: {
      type: Number,
      default: 0
    },
    taskCompletionRate: {
      type: Number,
      default: 0 // Percentage
    },
    
    // Partnership statistics
    activeParnerships: {
      type: Number,
      default: 0
    },
    completedPartnerships: {
      type: Number,
      default: 0
    },
    partnershipsInitiated: {
      type: Number,
      default: 0
    },
    acceptedPartnerships: {
      type: Number,
      default: 0
    },
    rejectedPartnerships: {
      type: Number,
      default: 0
    },
    
    // Escrow statistics
    totalFundsStaked: {
      type: Number,
      default: 0
    },
    totalRewardsEarned: {
      type: Number,
      default: 0
    },
    totalPenaltiesIncurred: {
      type: Number,
      default: 0
    },
    
    // Proof statistics
    proofsSubmitted: {
      type: Number,
      default: 0
    },
    proofsVerified: {
      type: Number,
      default: 0
    },
    proofsRejected: {
      type: Number,
      default: 0
    },
    proofSuccessRate: {
      type: Number,
      default: 0 // Percentage
    },
    
    // Time-based metrics
    averageTaskCompletionTime: {
      type: Number,
      default: 0 // In days
    },
    longestStreak: {
      type: Number,
      default: 0 // In days
    },
    currentStreak: {
      type: Number,
      default: 0 // In days
    },
    
    // Last updated timestamp
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create index for querying by user
statisticsSchema.index({ user: 1 });

module.exports = mongoose.model('Statistics', statisticsSchema); 