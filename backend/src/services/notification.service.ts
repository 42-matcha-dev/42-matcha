import { notificationRepository } from "../repositories/notification.repository.js";
import { notificationEmitter } from "../events/notification.emitter.js";
import type { NotificationType } from "../types/notification.types.js";

export const notificationService = {
    getNotifications: async (userId: number) => {
        return await notificationRepository.getNotifications(userId);
    },
    createNotification: async (userId: number, actorId: number, type: NotificationType, referenceId?: number) => {
        const notification = await notificationRepository.createNotification(userId, actorId, type, referenceId);
        if (notification) {
            notificationEmitter.emit('notification:created', { userId });
        }
        return notification;
    },
    deleteNotification: async (userId: number, actorId: number, type: NotificationType ) => {
        const result = await notificationRepository.deleteNotification(userId, actorId, type);
        if (result) {
            notificationEmitter.emit('notification:deleted', { userId });
        }
        return result;
    },
    markAsRead: async (notificationId: number, userId: number) => {
        return notificationRepository.markAsRead(notificationId, userId);
    },
    getUnreadCount: async (userId: number) => {
        return notificationRepository.getUnreadCount(userId);
    },
}