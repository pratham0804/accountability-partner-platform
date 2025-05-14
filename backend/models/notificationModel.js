const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'task_reminder',
        'task_completed',
        'proof_submitted',
        'proof_verified',
        'proof_rejected',
        'partnership_request',
        'partnership_accepted',
        'partnership_declined',
        'agreement_created',
        'agreement_completed',
        'chat_message',
        'moderation_warning',
        'escrow_deposit',
        'escrow_withdrawal',
        'escrow_reward',
        'escrow_penalty',
        'system_message'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    link: {
      type: String,
      default: ''
    },
    // Optional related resources
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    proof: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proof'
    },
    partnership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partnership'
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    moderation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Moderation'
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    emailSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 