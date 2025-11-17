import express from 'express';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { likeService } from '../services/like.service.js';

type Response = express.Response;

export const likeUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const likedUserId = parseInt(req.params.userId, 10);
    if (isNaN(likedUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await likeService.likeUser(req.user.userId, likedUserId);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Cannot like yourself') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Like already exists') {
        return res.status(409).json({ error: error.message });
      }
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getUserLikes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const likes = await likeService.getUserLikes(req.user.userId);
    return res.status(200).json(likes);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

export const getLikedBy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const likedBy = await likeService.getLikedBy(req.user.userId);
    return res.status(200).json(likedBy);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

