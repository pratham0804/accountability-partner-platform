const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    partnership: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Partnership'
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true
    },
    isFiltered: {
      type: Boolean,
      default: false
    },
    filteredContent: {
      type: String,
      default: ''
    },
    filterReason: {
      type: String,
      enum: ['', 'personal_info', 'inappropriate', 'external_contact'],
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
messageSchema.index({ partnership: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ isRead: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 