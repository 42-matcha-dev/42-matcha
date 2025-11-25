import express from 'express';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { dislikeService } from '../services/dislike.service.js';

type Response = express.Response;

export const dislikeUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const dislikedUserId = parseInt(req.params.userId, 10);
    if (isNaN(dislikedUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await dislikeService.dislikeUser(req.user.userId, dislikedUserId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Cannot dislike yourself') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'User is already disliked') {
        return res.status(409).json({ error: error.message });
      }
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

export const undislikeUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const dislikedUserId = parseInt(req.params.userId, 10);
    if (isNaN(dislikedUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await dislikeService.undislikeUser(req.user.userId, dislikedUserId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid operation') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'User is not disliked') {
        return res.status(404).json({ error: error.message });
      }
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getDislikedUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const dislikedUsers = await dislikeService.getDislikedUsers(req.user.userId);
    return res.status(200).json(dislikedUsers);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getDislikedBy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const dislikedBy = await dislikeService.getDislikedBy(req.user.userId);
    return res.status(200).json(dislikedBy);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

