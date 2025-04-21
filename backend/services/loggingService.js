import MessageLog from '../models/MessageLog.js';
import Session from '../models/Session.js';
import { logger } from '../utils/logger.js';

class LoggingService {
  /**
   * Create a new chat session
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Created session
   */
  async createSession(sessionData) {
    try {
      const session = new Session({
        userIdentifier: sessionData.userIdentifier || 'anonymous',
        metadata: sessionData.metadata || {}
      });
      
      await session.save();
      logger.info(`Created new session with ID: ${session._id}`);
      
      return session;
    } catch (error) {
      logger.error(`Error creating session: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * End a chat session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Updated session
   */
  async endSession(sessionId) {
    try {
      const session = await Session.findById(sessionId);
      
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      
      session.endTime = new Date();
      session.active = false;
      
      await session.save();
      logger.info(`Ended session with ID: ${sessionId}`);
      
      return session;
    } catch (error) {
      logger.error(`Error ending session: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Log a message
   * @param {Object} messageData - Message data
   * @returns {Promise<Object>} Logged message
   */
  async logMessage(messageData) {
    try {
      // Create message log
      const messageLog = new MessageLog({
        sessionId: messageData.sessionId,
        role: messageData.role,
        content: messageData.content,
        model: messageData.model,
        tokensUsed: messageData.tokensUsed || {
          prompt: 0,
          completion: 0,
          total: 0
        },
        processingTime: messageData.processingTime || 0,
        metadata: messageData.metadata || {}
      });
      
      await messageLog.save();
      
      // Update session with message count and token usage
      if (messageData.sessionId) {
        const session = await Session.findById(messageData.sessionId);
        
        if (session) {
          session.totalMessages += 1;
          session.totalTokensUsed += (messageData.tokensUsed?.total || 0);
          await session.save();
        }
      }
      
      logger.info(`Logged message for session ${messageData.sessionId}, role: ${messageData.role}`);
      
      return messageLog;
    } catch (error) {
      logger.error(`Error logging message: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get messages for a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Array>} Messages for the session
   */
  async getSessionMessages(sessionId) {
    try {
      const messages = await MessageLog.find({ sessionId }).sort({ timestamp: 1 });
      return messages;
    } catch (error) {
      logger.error(`Error retrieving session messages: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get session statistics
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Session statistics
   */
  async getSessionStats(sessionId) {
    try {
      const session = await Session.findById(sessionId);
      
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      
      const messageCount = await MessageLog.countDocuments({ sessionId });
      const userMessageCount = await MessageLog.countDocuments({ sessionId, role: 'user' });
      const assistantMessageCount = await MessageLog.countDocuments({ sessionId, role: 'assistant' });
      
      // Calculate total tokens
      const tokenAggregation = await MessageLog.aggregate([
        { $match: { sessionId } },
        { $group: {
            _id: null,
            totalPromptTokens: { $sum: '$tokensUsed.prompt' },
            totalCompletionTokens: { $sum: '$tokensUsed.completion' },
            totalTokens: { $sum: '$tokensUsed.total' }
          }
        }
      ]);
      
      const tokenUsage = tokenAggregation.length > 0 ? tokenAggregation[0] : {
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0
      };
      
      return {
        sessionId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.endTime ? (session.endTime - session.startTime) : null,
        active: session.active,
        messageCount,
        userMessageCount,
        assistantMessageCount,
        tokenUsage
      };
    } catch (error) {
      logger.error(`Error retrieving session stats: ${error.message}`);
      throw error;
    }
  }
}

export default new LoggingService();
