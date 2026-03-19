import pool from '../database/init.js';
import type { NotificationType } from '../types/notification.types.js';

export const notificationRepository = {
  getNotifications: async (userId: number) => {
    const query = `
    SELECT
        n.id,
        n.type,
        n.actor_id,
        u.username,
        u.first_name,
        u.last_name,
        u.icon_url,
        n.reference_id,
        n.is_read,
        n.created_at
    FROM notifications n
    JOIN users u ON u.id = n.actor_id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },
    
  createNotification: async (userId: number, actorId: number, type: NotificationType, referenceId?: number) => {
    const query = `
      INSERT INTO notifications (user_id, actor_id, type, reference_id)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, actor_id, type, reference_id)
      DO NOTHING
      RETURNING id, user_id, actor_id, type, reference_id, is_read, created_at
    `;
    const res = await pool.query(query, [userId, actorId, type, referenceId]);
    return res.rows[0];
  },

  deleteNotification: async (userId: number, actorId: number, type: NotificationType) => {
    const query = `
      DELETE FROM notifications
      WHERE user_id = $1 AND actor_id = $2 AND type = $3
    `
    const res = await pool.query(query, [userId, actorId, type]);
    return res.rowCount > 0;
  },

  markAsRead: async (notificationId: number, userId: number) => {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND user_id = $2
      RETURNING id, is_read
    `;

    const result = await pool.query(query, [notificationId, userId]);
    return result.rows[0];
  },

  getUnreadCount: async (userId: number) => {
    const query = `
      SELECT COUNT(*) AS count
      FROM notifications
      WHERE user_id = $1
      AND is_read = false
    `;
    const result = await pool.query(query, [userId]);
    return Number(result.rows[0].count);
  },
};
