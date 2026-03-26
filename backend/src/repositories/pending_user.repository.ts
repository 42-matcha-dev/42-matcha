import pool from '../database/init.js'

export const pendingUserRepository = {
  create: async (email: string, hashed: string, token: string, expiresAt: Date) => {
    const res = await pool.query( `
      INSERT INTO pending_users (email, password_hash, token, expiresAt)
      VALUES ($1, $2, $3, $4)
    `, [email, hashed, token, expiresAt])
    return res.rows[0]
  },
  createOrUpdate: async (email: string, hashed: string, token: string, expiresAt: Date) => {
    const res = await pool.query(`
      INSERT INTO pending_users (email, password_hash, token, expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email)
      DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          token = EXCLUDED.token,
          expires_at = EXCLUDED.expires_at,
          updated_at = NOW()
    `, [email, hashed, token, expiresAt]);
    return res.rows[0]
  },
  findByToken: async (token: string) => {
    const res = await pool.query('SELECT * FROM pending_users WHERE token = $1', [token])
    return res.rows[0]
  },
  delete: async (token: string) => {
    await pool.query('DELETE FROM pending_users WHERE token = $1', [token])
  }
}
