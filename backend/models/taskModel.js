const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    deadline: {
      type: Date,
      required: [true, 'Please add a deadline']
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'verified', 'failed'],
      default: 'pending'
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    partnership: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Partnership'
    },
    completedAt: {
      type: Date
    },
    verifiedAt: {
      type: Date
    },
    completionNotes: {
      type: String,
      default: ''
    },
    recurringType: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    tags: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
taskSchema.index({ partnership: 1 });
taskSchema.index({ creator: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ deadline: 1 });

module.exports = mongoose.model('Task', taskSchema); 