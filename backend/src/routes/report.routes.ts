import { Router } from 'express';
import { reportUser, getMyReports } from '../controllers/report.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/:userId', authenticateToken, reportUser);
router.get('/', authenticateToken, getMyReports);

export default router;
