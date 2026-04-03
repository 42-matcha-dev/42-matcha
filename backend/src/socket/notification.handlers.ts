import type { Server } from "socket.io";
import { notificationEmitter } from "../events/notification.emitter.js";
import { notificationRepository } from "../repositories/notification.repository.js";

export function setupNotificationSocket(io: Server): void {
    notificationEmitter.on('notification:created', async ({ userId, notification }: { userId: number; notification: any }) => {
        try {
            const count = await notificationRepository.getUnreadCount(userId);
            io.to(`user:${userId}`).emit('unreadNotificationCount', { count });
            io.to(`user:${userId}`).emit('newNotification', notification);
        } catch (err) {
            console.error('Failed to emit notification events:', err);
        }
    });
    notificationEmitter.on('notification:deleted', async ({ userId, notification }: { userId: number; notification: any}) => {
        try {
            const count = await notificationRepository.getUnreadCount(userId);
            io.to(`user:${userId}`).emit('unreadNotificationCount', { count });
            io.to(`user:${userId}`).emit('removeNotification', notification);
        } catch (err) {
            console.error('Failed to emit unreadNotificationCount:', err);
        }
    });
    notificationEmitter.on('notification:read', async ({ userId }: { userId: number }) => {
        try {
            const count = await notificationRepository.getUnreadCount(userId);
            io.to(`user:${userId}`).emit('unreadNotificationCount', { count });
        } catch (err) {
            console.error('Failed to emit unreadNotificationCount:', err);
        }
    });
}
