import express from 'express';
import { authenticateToken, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { userService } from '../services/user.service.js';

type Response = express.Response;

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required');
    }

    const profile = await userService.getProfile(req.user.userId);
    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
  }
};

