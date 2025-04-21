import express from 'express';
import {
  getModels,
  createSession,
  endSession,
  getSessionStats,
  getSessionMessages,
  sendMessage
} from '../controllers/chatController.js';

const router = express.Router();

// Model routes
router.get('/models', getModels);

// Session routes
router.post('/sessions', createSession);
router.put('/sessions/:sessionId/end', endSession);
router.get('/sessions/:sessionId/stats', getSessionStats);
router.get('/sessions/:sessionId/messages', getSessionMessages);

// Message routes
router.post('/messages', sendMessage);

export default router;
