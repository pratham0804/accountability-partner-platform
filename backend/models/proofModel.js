const mongoose = require('mongoose');

const proofSchema = mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Task'
    },
    submitter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    verifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    proofType: {
      type: String,
      enum: ['text', 'image', 'link', 'file'],
      required: [true, 'Please specify the type of proof']
    },
    content: {
      type: String,
      required: [true, 'Please provide proof content']
    },
    additionalNotes: {
      type: String,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    verificationComment: {
      type: String,
      default: ''
    },
    verifiedAt: {
      type: Date
    },
    rejected: {
      type: Boolean,
      default: false
    },
    rejectionReason: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
proofSchema.index({ task: 1 });
proofSchema.index({ submitter: 1 });
proofSchema.index({ verifier: 1 });
proofSchema.index({ verificationStatus: 1 });
proofSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Proof', proofSchema); 