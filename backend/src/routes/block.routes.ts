import { Router } from 'express';
import { blockUser, unblockUser, getBlockedUsers, getBlockedBy } from '../controllers/block.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/:userId', authenticateToken, blockUser);
router.delete('/:userId', authenticateToken, unblockUser);
router.get('/blocked', authenticateToken, getBlockedUsers);
router.get('/blocked-by', authenticateToken, getBlockedBy);

export default router;

