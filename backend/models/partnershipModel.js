const mongoose = require('mongoose');

const partnershipSchema = mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    agreement: {
      title: {
        type: String,
        default: ''
      },
      description: {
        type: String,
        default: ''
      },
      goals: [{
        type: String
      }],
      startDate: {
        type: Date
      },
      endDate: {
        type: Date
      },
      financialStake: {
        amount: {
          type: Number,
          default: 0
        },
        currency: {
          type: String,
          default: 'USD'
        }
      },
      createdAt: {
        type: Date
      }
    },
    messages: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }]
  },
  {
    timestamps: true
  }
);

// Create indexes for faster querying
partnershipSchema.index({ requester: 1, recipient: 1 });
partnershipSchema.index({ status: 1 });

module.exports = mongoose.model('Partnership', partnershipSchema); 