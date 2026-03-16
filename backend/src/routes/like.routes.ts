import { Router } from 'express';
import { likeUser, getUserLikes, getLikedBy, deleteLike } from '../controllers/like.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/:userId', authenticateToken, likeUser);
router.delete('/:userId', authenticateToken, deleteLike);
router.get('/likes', authenticateToken, getUserLikes);
router.get('/liked-by', authenticateToken, getLikedBy);

export default router;
