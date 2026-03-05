import { notificationRepository } from "../repositories/notification.repository.js";
import type { NotificationType } from "../types/notification.types.js";

export const notificationService = {
    getNotifications: async (userId: number) => {
        return await notificationRepository.getNotifications(userId);
    },
    createNotification: async (userId: number, actorId: number, type: NotificationType, referenceId?: number) => {
        return notificationRepository.createNotifiation(userId, actorId, type, referenceId);
    },
    markAsRead: async (notificationId: number, userId: number) => {
        return notificationRepository.markAsRead(notificationId, userId);
    }
}