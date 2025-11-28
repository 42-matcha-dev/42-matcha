import express from 'express';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { blockService } from '../services/block.service.js';

type Response = express.Response;

export const blockUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const blockedUserId = parseInt(req.params.userId, 10);
    if (isNaN(blockedUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await blockService.blockUser(req.user.userId, blockedUserId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Cannot block yourself') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'User is already blocked') {
        return res.status(409).json({ error: error.message });
      }
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

export const unblockUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const blockedUserId = parseInt(req.params.userId, 10);
    if (isNaN(blockedUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await blockService.unblockUser(req.user.userId, blockedUserId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid operation') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'User is not blocked') {
        return res.status(404).json({ error: error.message });
      }
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getBlockedUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const blockedUsers = await blockService.getBlockedUsers(req.user.userId);
    return res.status(200).json(blockedUsers);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getBlockedBy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const blockedBy = await blockService.getBlockedBy(req.user.userId);
    return res.status(200).json(blockedBy);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

