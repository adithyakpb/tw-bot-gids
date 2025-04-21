import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  userIdentifier: {
    type: String,
    required: true
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  totalTokensUsed: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    browser: String,
    os: String
  }
});

// Create indexes for common queries
sessionSchema.index({ startTime: -1 });
sessionSchema.index({ userIdentifier: 1 });
sessionSchema.index({ active: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
