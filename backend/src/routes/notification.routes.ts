import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, notificationController.getNotifications);
router.patch('/:id/read', authenticateToken, notificationController.markAsRead);
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount);

export default router;