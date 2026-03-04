import pool from '../database/init.js';
import type { NotificationType } from '../types/notification.types.js';

export const notificationRepository = {
  createNotifiation: async (userId: number, actorId: number, type: NotificationType, referenceId?: number) => {
    const query = `
      INSERT INTO notifications (user_id, actor_id, type, reference_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, actor_id, type, reference_id, is_read, created_at
    `;
    const res = await pool.query(query, [userId, actorId, type, referenceId]);
    return res.rows[0];
  },
};
