import type { Server } from "socket.io";
import { notificationEmitter } from "../events/notification.emitter.js";
import { notificationRepository } from "../repositories/notification.repository.js";

export function setupNotificationSocket(io: Server): void {
    notificationEmitter.on('notification:created', async ({ userId }: { userId: number}) => {
        try {
            const count = await notificationRepository.getUnreadCount(userId);
            io.to(`user:${userId}`).emit('unreadNotificationCount', { count });
        } catch (err) {
            console.error('Failed to emit unreadNotificationCount:', err);
        }
    });
}