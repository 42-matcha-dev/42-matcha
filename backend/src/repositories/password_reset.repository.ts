import pool from '../database/init.js';

export const passwordResetRepository = {
  create: async (userId: number, token: string, expiresAt: Date) => {
    const query = `
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token, expires_at, created_at
    `;
    const res = await pool.query(query, [userId, token, expiresAt]);
    return res.rows[0];
  },

  findValidByToken: async (token: string) => {
    const query = `
      SELECT * FROM password_resets
      WHERE token = $1 AND used = FALSE AND expires_at > NOW()
      LIMIT 1
    `;
    const res = await pool.query(query, [token]);
    return res.rows[0];
  },

  markUsed: async (id: number) => {
    await pool.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [id]);
  },

  deleteByUserId: async (userId: number) => {
    await pool.query('DELETE FROM password_resets WHERE user_id = $1 AND used = FALSE', [userId]);
  },
};
