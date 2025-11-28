import pool from '../database/init.js';

export const dislikeRepository = {
  createDislike: async (dislikerId: number, dislikedId: number) => {
    const query = `
      INSERT INTO dislikes (disliker_id, disliked_id)
      VALUES ($1, $2)
      RETURNING disliker_id, disliked_id, created_at
    `;
    const res = await pool.query(query, [dislikerId, dislikedId]);
    return res.rows[0];
  },

  checkDislikeExists: async (dislikerId: number, dislikedId: number): Promise<boolean> => {
    const query = `
      SELECT 1 FROM dislikes
      WHERE disliker_id = $1 AND disliked_id = $2
      LIMIT 1
    `;
    const res = await pool.query(query, [dislikerId, dislikedId]);
    return res.rows.length > 0;
  },

  removeDislike: async (dislikerId: number, dislikedId: number) => {
    const query = `
      DELETE FROM dislikes
      WHERE disliker_id = $1 AND disliked_id = $2
      RETURNING disliker_id, disliked_id
    `;
    const res = await pool.query(query, [dislikerId, dislikedId]);
    return res.rows[0];
  },

  getDislikedUsers: async (userId: number) => {
    const query = `
      SELECT disliked_id, created_at
      FROM dislikes
      WHERE disliker_id = $1
      ORDER BY created_at DESC
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },

  getDislikedBy: async (userId: number) => {
    const query = `
      SELECT disliker_id, created_at
      FROM dislikes
      WHERE disliked_id = $1
      ORDER BY created_at DESC
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },

  isDisliked: async (dislikerId: number, dislikedId: number): Promise<boolean> => {
    const query = `
      SELECT 1 FROM dislikes
      WHERE disliker_id = $1 AND disliked_id = $2
      LIMIT 1
    `;
    const res = await pool.query(query, [dislikerId, dislikedId]);
    return res.rows.length > 0;
  },
};

