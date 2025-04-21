import lmStudioService from '../services/lmStudioService.js';
import loggingService from '../services/loggingService.js';
import { logger } from '../utils/logger.js';

// Get available models
export const getModels = async (req, res) => {
  try {
    const models = await lmStudioService.getModels();
    res.json(models);
  } catch (error) {
    logger.error(`Error in getModels: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Create a new chat session
export const createSession = async (req, res) => {
  try {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    const sessionData = {
      userIdentifier: req.body.userIdentifier || 'anonymous',
      metadata: {
        userAgent,
        ipAddress,
        ...req.body.metadata
      }
    };
    
    const session = await loggingService.createSession(sessionData);
    res.status(201).json(session);
  } catch (error) {
    logger.error(`Error in createSession: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// End a chat session
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await loggingService.endSession(sessionId);
    res.json(session);
  } catch (error) {
    logger.error(`Error in endSession: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get session statistics
export const getSessionStats = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const stats = await loggingService.getSessionStats(sessionId);
    res.json(stats);
  } catch (error) {
    logger.error(`Error in getSessionStats: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Get messages for a session
export const getSessionMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await loggingService.getSessionMessages(sessionId);
    res.json(messages);
  } catch (error) {
    logger.error(`Error in getSessionMessages: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Send a message and get a response
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message, model, settings } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Session ID and message are required' });
    }
    
    // Estimate tokens for user message
    const userTokens = lmStudioService.estimateTokens(message);
    
    // Log user message with token estimation
    const userMessage = await loggingService.logMessage({
      sessionId,
      role: 'user',
      content: message,
      model: model || 'unknown',
      tokensUsed: userTokens,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        settings
      }
    });
    
    // Prepare conversation history for the LLM
    const sessionMessages = await loggingService.getSessionMessages(sessionId);
    const conversationHistory = sessionMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Generate response from LM Studio
    const startTime = Date.now();
    const completion = await lmStudioService.generateCompletion({
      model: model || 'gpt-3.5-turbo',
      messages: conversationHistory,
      temperature: settings?.temperature || 0.7,
      max_tokens: settings?.max_tokens || 1000
    });
    
    const processingTime = Date.now() - startTime;
    const assistantResponse = completion.choices[0].message.content;
    
    // Log assistant message
    const assistantMessage = await loggingService.logMessage({
      sessionId,
      role: 'assistant',
      content: assistantResponse,
      model: model || 'unknown',
      tokensUsed: completion.metadata.tokensUsed,
      processingTime,
      metadata: {
        settings
      }
    });
    
    // Return response
    res.json({
      message: assistantResponse,
      messageId: assistantMessage._id,
      model: model || 'unknown',
      tokensUsed: completion.metadata.tokensUsed,
      processingTime
    });
  } catch (error) {
    logger.error(`Error in sendMessage: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
