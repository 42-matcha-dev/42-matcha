import { Router } from 'express';
import { dislikeUser, undislikeUser, getDislikedUsers, getDislikedBy } from '../controllers/dislike.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/:userId', authenticateToken, dislikeUser);
router.delete('/:userId', authenticateToken, undislikeUser);
router.get('/disliked', authenticateToken, getDislikedUsers);
router.get('/disliked-by', authenticateToken, getDislikedBy);

export default router;

