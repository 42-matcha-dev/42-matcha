import { notificationRepository } from "../repositories/notification.repository.js";
import { notificationEmitter } from "../events/notification.emitter.js";
import type { NotificationType } from "../types/notification.types.js";
import { blockRepository } from "../repositories/block.repository.js";
import { reportRepository } from "../repositories/report.repository.js";

export const notificationService = {
    getNotifications: async (userId: number) => {
        return await notificationRepository.getNotifications(userId);
    },

    createNotification: async (userId: number, actorId: number, type: NotificationType, referenceId?: number) => {
        const [blockCheck, reportCheck] = await Promise.all([
            blockRepository.checkBlockEitherDirection(userId, actorId),
            reportRepository.checkReportEitherDirection(userId, actorId),
        ]);
        if (blockCheck || reportCheck) return;
        const notification = await notificationRepository.createNotification(userId, actorId, type, referenceId);
        if (notification) {
            const fullNotification = await notificationRepository.getNotificationById(notification.id);
            notificationEmitter.emit('notification:created', {
                userId,
                notification: fullNotification,
            });
        }
        return notification;
    },

    deleteNotification: async (userId: number, actorId: number, type: NotificationType ) => {
        const result = await notificationRepository.deleteNotification(userId, actorId, type);
        if (result) {
            notificationEmitter.emit('notification:deleted', { userId, notification : {userId, actorId, type} });
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