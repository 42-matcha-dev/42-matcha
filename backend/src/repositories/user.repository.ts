import pool from '../database/init.js';

export const userRepository = {
  findUserById: async (id: number) => {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return res.rows[0];
  },

  insertUserTags: async (userId: number, tagIds: number[]) => {
    if (tagIds.length === 0) return;

    // Insert tags one by one to avoid SQL injection and handle conflicts
    for (const tagId of tagIds) {
      await pool.query(
        'INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2) ON CONFLICT (user_id, tag_id) DO NOTHING',
        [userId, tagId]
      );
    }
  },

  findUserTags: async (userId: number) => {
    const res = await pool.query(
      `SELECT t.id, t.name, t.category
       FROM tags t
       INNER JOIN user_tags ut ON t.id = ut.tag_id
       WHERE ut.user_id = $1
       ORDER BY t.category, t.name`,
      [userId]
    );
    return res.rows;
  },
};

