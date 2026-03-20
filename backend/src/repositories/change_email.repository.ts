import pool from '../database/init.js';

export const emailChangeRepository = {
  create: async (userId: number, newEmail:string, token: string, expiresAt: Date) => {
    const query = `
      INSERT INTO change_emails (user_id, new_email, token, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, new_email, token, expires_at, created_at
    `;
    const res = await pool.query(query, [userId, newEmail, token, expiresAt]);
    return res.rows[0];
  },

  findValidByToken: async (token: string) => {
    const query = `
      SELECT * FROM change_emails
      WHERE token = $1 AND used = FALSE AND expires_at > NOW()
      LIMIT 1
    `;
    const res = await pool.query(query, [token]);
    return res.rows[0];
  },

  markUsed: async (id: number) => {
    await pool.query('UPDATE change_emails SET used = TRUE WHERE id = $1', [id]);
  },

  deleteByUserId: async (userId: number) => {
    await pool.query('DELETE FROM change_emails WHERE user_id = $1 AND used = FALSE', [userId]);
  },
};