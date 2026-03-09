import type { Request, Response } from "express";
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { notificationService } from "../services/notification.service.js";

export const notificationController = {
    getNotifications: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user!.userId;
            const notifications = await notificationService.getNotifications(userId);
            res.status(200).json(notifications);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
            res.status(500).json({ error: "Failed to fetch notifications" });
        }
    },
    markAsRead: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user!.userId;
            const notificationId = Number(req.params.id);
            const notification = await notificationService.markAsRead(notificationId, userId)
            if (!notification) return res.status(404).json({error: "Notification not found"});
            res.json(notification);
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
            res.status(500).json({ error: "Failed to update notification"});
        }
    },

    getUnreadCount: async (req: AuthenticatedRequest, res: Response) => {
        try {
            const userId = req.user!.userId;
            const count = await notificationService.getUnreadCount(userId)
            res.json({count});
        } catch (err) {
            console.error("Failed to fetch unread notifications:", err);
            res.status(500).json({ error: "Failed to update notification"});
        }
    }
}