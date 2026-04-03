import pool from '../database/init.js';

type ConversationRow = {
  id: number;
  user1_id: number;
  user2_id: number;
  created_at: Date;
};

export const conversationRepository = {
  createConversation: async (user1_id: number, user2_id: number): Promise<ConversationRow | undefined> => {
    const query = `
      INSERT INTO conversations (user1_id, user2_id)
      VALUES ($1, $2)
      ON CONFLICT (user1_id, user2_id)
      DO NOTHING
      RETURNING id, user1_id, user2_id, created_at
    `;
    const res = await pool.query(query, [user1_id, user2_id]);
    return res.rows[0];
  },

  getConversationByUserIds: async (user1_id: number, user2_id: number): Promise<ConversationRow | undefined> => {
    const [u1, u2] = user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];
    const query = `
      SELECT id, user1_id, user2_id, created_at
      FROM conversations
      WHERE user1_id = $1 AND user2_id = $2
      LIMIT 1
    `;
    const res = await pool.query(query, [u1, u2]);
    return res.rows[0];
  },

  getConversationById: async (id: number): Promise<ConversationRow | undefined> => {
    const query = `
      SELECT id, user1_id, user2_id, created_at
      FROM conversations
      WHERE id = $1
      LIMIT 1
    `;
    const res = await pool.query(query, [id]);
    return res.rows[0];
  },

  getConversationsByUserId: async (userId: number) => {
    const query = `
      SELECT
        c.id AS conversation_id,
        c.user1_id,
        c.user2_id,
        c.created_at,
        CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END AS other_user_id,
        u.username AS other_username,
        u.first_name AS other_first_name,
        u.last_name AS other_last_name,
        u.icon_url AS other_icon_url,
        u.is_online AS other_is_online,
        u.last_seen_at AS other_last_seen_at,
        last_msg.content AS last_message_content,
        last_msg.created_at AS last_message_at,
        (SELECT COUNT(*)::int FROM messages m
         WHERE m.conversation_id = c.id
            AND m.sender_id != $1
            AND m.is_read = false) AS unread_count
      FROM conversations c
      JOIN users u ON u.id = (CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END)
      LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) last_msg ON true
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
        AND NOT EXISTS (
          SELECT 1 FROM blocks
          WHERE (blocker_id = $1 AND blocked_id = u.id)
             OR (blocker_id = u.id AND blocked_id = $1)
        )
        AND NOT EXISTS (
          SELECT 1 FROM reports
          WHERE (reporter_id = $1 AND reported_id = u.id)
             OR (reporter_id = u.id AND reported_id = $1)
        )
      ORDER BY last_msg.created_at DESC NULLS LAST, c.created_at DESC
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },

  getConversationSummaryByIdForUser: async (userId: number, conversationId: number) => {
    const query = `
      SELECT
        c.id AS conversation_id,
        c.user1_id,
        c.user2_id,
        c.created_at,
        CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END AS other_user_id,
        u.username AS other_username,
        u.first_name AS other_first_name,
        u.last_name AS other_last_name,
        u.icon_url AS other_icon_url,
        u.is_online AS other_is_online,
        u.last_seen_at AS other_last_seen_at,
        last_msg.content AS last_message_content,
        last_msg.created_at AS last_message_at,
        (
          SELECT COUNT(*)::int
          FROM messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id != $1
            AND m.is_read = false
        ) AS unread_count
      FROM conversations c
      JOIN users u
        ON u.id = (CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END)
      LEFT JOIN LATERAL (
        SELECT content, created_at
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) last_msg ON true
      WHERE c.id = $2
        AND (c.user1_id = $1 OR c.user2_id = $1)
      LIMIT 1
    `;
    const res = await pool.query(query, [userId, conversationId]);
    return res.rows[0];
  },

  getTotalUnreadCount: async (userId: number): Promise<number> => {
    const query = `
      SELECT COUNT(*)::int AS total
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
        AND m.sender_id != $1
        AND m.is_read = false
    `;
    const res = await pool.query(query, [userId]);
    return res.rows[0]?.total ?? 0;
  },

  removeConversation: async (user1_id: number, user2_id: number) => {
    const [u1, u2] = user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];
    await pool.query('DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE user1_id = $1 AND user2_id = $2)', [u1, u2]);
    await pool.query('DELETE FROM conversations WHERE user1_id = $1 AND user2_id = $2', [u1, u2]);
  },
};
