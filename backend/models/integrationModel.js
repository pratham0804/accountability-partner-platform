const mongoose = require('mongoose');

const integrationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    platform: {
      type: String,
      enum: ['github', 'fitness', 'learning'],
      required: true
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String
    },
    platformUserId: {
      type: String,
      required: true
    },
    platformUsername: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastVerified: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient querying
integrationSchema.index({ user: 1, platform: 1 }, { unique: true });
integrationSchema.index({ platformUserId: 1 });

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration; 