import pool from '../database/init.js';

export const conversationRepository = {
  createConversation: async (user1_id: number, user2_id: number) => {
    const query = `
      INSERT INTO conversations (user1_id, user2_id)
      VALUES ($1, $2)
      ON CONFLICT (user1_id, user2_id)
      DO NOTHING
      RETURNING user1_id, user2_id, created_at
    `;
    const res = await pool.query(query, [user1_id, user2_id]);
    return res.rows[0];
  },
};
