import pool from '../database/init.js';

export const userRepository = {
  findUserById: async (id: number) => {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return res.rows[0];
  },
};

