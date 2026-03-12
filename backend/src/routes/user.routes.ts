import { Router } from 'express';
import { getProfile, getUserById, searchUsers, updateCurrentUser } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/me', authenticateToken, getProfile);
router.patch('/me', authenticateToken, updateCurrentUser);
router.get('/search', authenticateToken, searchUsers);
router.get('/:id', authenticateToken, getUserById);

export default router;

