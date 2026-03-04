import { Router } from 'express';
import { getConversations, getMessages, createConversation } from '../controllers/chat.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, getConversations);
router.get('/:id/messages', authenticateToken, getMessages);
router.post('/', authenticateToken, createConversation);

export default router;
