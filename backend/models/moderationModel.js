const mongoose = require('mongoose');

const moderationModel = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true
    },
    partnership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partnership',
      required: true
    },
    violationType: {
      type: String,
      enum: ['personal_info', 'inappropriate', 'external_contact'],
      required: true
    },
    originalContent: {
      type: String,
      required: true
    },
    filteredContent: {
      type: String,
      required: true
    },
    penaltyAmount: {
      type: Number,
      default: 0
    },
    penaltyApplied: {
      type: Boolean,
      default: false
    },
    notificationSent: {
      type: Boolean,
      default: false
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
moderationModel.index({ user: 1 });
moderationModel.index({ message: 1 }, { unique: true });
moderationModel.index({ partnership: 1 });
moderationModel.index({ violationType: 1 });
moderationModel.index({ penaltyApplied: 1 });
moderationModel.index({ notificationSent: 1 });

module.exports = mongoose.model('Moderation', moderationModel); 