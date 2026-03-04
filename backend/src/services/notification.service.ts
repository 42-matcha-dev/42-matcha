import { notificationRepository } from "../repositories/notification.repository.js";
import type { NotificationType } from "../types/notification.types.js";

export const notificationService = {
    createNotification: async (userId: number, actorId: number, type: NotificationType, referenceId?: number) => {
        return notificationRepository.createNotifiation(userId, actorId, type, referenceId);
    }
}