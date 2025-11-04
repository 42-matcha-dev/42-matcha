import { Router } from 'express';
import { getProfile } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', authenticateToken, getProfile);

export default router;

