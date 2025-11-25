import pool from '../database/init.js';

export const blockRepository = {
  createBlock: async (blockerId: number, blockedId: number) => {
    const query = `
      INSERT INTO blocks (blocker_id, blocked_id)
      VALUES ($1, $2)
      RETURNING blocker_id, blocked_id, created_at
    `;
    const res = await pool.query(query, [blockerId, blockedId]);
    return res.rows[0];
  },

  checkBlockExists: async (blockerId: number, blockedId: number): Promise<boolean> => {
    const query = `
      SELECT 1 FROM blocks
      WHERE blocker_id = $1 AND blocked_id = $2
      LIMIT 1
    `;
    const res = await pool.query(query, [blockerId, blockedId]);
    return res.rows.length > 0;
  },

  removeBlock: async (blockerId: number, blockedId: number) => {
    const query = `
      DELETE FROM blocks
      WHERE blocker_id = $1 AND blocked_id = $2
      RETURNING blocker_id, blocked_id
    `;
    const res = await pool.query(query, [blockerId, blockedId]);
    return res.rows[0];
  },

  getBlockedUsers: async (userId: number) => {
    const query = `
      SELECT blocked_id, created_at
      FROM blocks
      WHERE blocker_id = $1
      ORDER BY created_at DESC
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },

  getBlockedBy: async (userId: number) => {
    const query = `
      SELECT blocker_id, created_at
      FROM blocks
      WHERE blocked_id = $1
      ORDER BY created_at DESC
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },

  isBlocked: async (blockerId: number, blockedId: number): Promise<boolean> => {
    const query = `
      SELECT 1 FROM blocks
      WHERE (blocker_id = $1 AND blocked_id = $2)
         OR (blocker_id = $2 AND blocked_id = $1)
      LIMIT 1
    `;
    const res = await pool.query(query, [blockerId, blockedId]);
    return res.rows.length > 0;
  },
};

