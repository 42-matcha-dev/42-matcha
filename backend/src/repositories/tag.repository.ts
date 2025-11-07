import pool from '../database/init.js';

export const tagRepository = {
  getAllTags: async () => {
    const res = await pool.query("SELECT id, name, category FROM tags ORDER BY category, name");
    return res.rows;
  },
};

