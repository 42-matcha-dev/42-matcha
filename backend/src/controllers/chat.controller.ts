import express from 'express';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { chatService } from '../services/chat.service.js';

type Response = express.Response;

export const getConversations = async (req: AuthenticatedRequest, res:Response) => {
    try {
        if (!req.user) {
            throw new Error('Authentication required');
        }

        const conversations = await chatService.getConversations(req.user.userId);
        return res.status(200).json(conversations);
    } catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error'})
    }
};

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            throw new Error('Authentication required');
        }
    
        const conversationId = parseInt(req.params.id, 10);
        if (isNaN(conversationId)) {
            return res.status(400).json({ error: 'Invalid conversation ID' });
        }
    
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;
        const offset = req.query.offset ? parseInt(String(req.query.offset), 10) : undefined;
    
        const messages = await chatService.getMessages(
            conversationId,
            req.user.userId,
            limit,
            offset
        );
        return res.status(200).json(messages);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Conversation not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Unauthorized: not a participant in this conversation') {
                return res.status(403).json({ error: error.message });
            }
        }
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
};

export const createConversation = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            throw new Error('Authentication required');
        }

        if (req.body.userId == null || req.body.userId === '') {
            return res.status(400).json({ error: 'userId is required'} );
        }
    
        const otherUserId = typeof req.body.userId === 'number' ? req.body.userId : parseInt(req.body.userId, 10);
        if (isNaN(otherUserId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
    
        const { conversation, created } = await chatService.getOrCreateConversation(req.user.userId, otherUserId);
        return res.status(created ? 201 : 200).json(conversation);
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Cannot create conversation with yourself') {
                return res.status(400).json({ error: error.message });
            }
            if (error.message === 'Cannot start conversation with blocked user') {
                return res.status(403).json({ error: error.message });
            }
            if (error.message === 'Failed to create or retrieve conversation') {
                return res.status(500).json({ error: error.message });
            }
        }
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error'});
    }
};