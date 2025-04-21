import mongoose from 'mongoose';

const messageLogSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  tokensUsed: {
    prompt: {
      type: Number,
      default: 0
    },
    completion: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  processingTime: {
    type: Number,
    default: 0
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    settings: mongoose.Schema.Types.Mixed
  }
});

// Create indexes for common queries
messageLogSchema.index({ timestamp: -1 });
messageLogSchema.index({ 'tokensUsed.total': 1 });

const MessageLog = mongoose.model('MessageLog', messageLogSchema);

export default MessageLog;
