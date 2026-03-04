import type { Request, Response } from "express";
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { notificationService } from "../services/notification.service.js";

export const notificationController = {
    getNotifications: async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                throw new Error('Authentication required')
            }
            const userId = req.user.userId;
            if (isNaN(userId)) {
                return res.status(400).json({ error: 'Invalid user ID' })
            }
            const notifications = await notificationService.getNotifications(userId);
            res.status(200).json(notifications);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
            res.status(500).json({ error: "Failed to fetch notifications" });
        }
    }
}