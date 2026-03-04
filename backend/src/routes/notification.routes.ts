import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, notificationController.getNotifications);

export default router;