import { Router } from 'express';
import { getProfile, getUserById } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.get('/:id', authenticateToken, getUserById);

export default router;

