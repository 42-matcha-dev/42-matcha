import pool from '../database/init.js';

export const likeRepository = {
  createLike: async (likerId: number, likedId: number) => {
    const query = `
      INSERT INTO likes (liker_id, liked_id)
      VALUES ($1, $2)
      RETURNING liker_id, liked_id, created_at
    `;
    const res = await pool.query(query, [likerId, likedId]);
    return res.rows[0];
  },

  deleteLike: async (likerId: number, likedId: number) => {
    const query = `
      DELETE FROM likes
      WHERE liker_id = $1 AND liked_id = $2
    `;
    const res = await pool.query(query, [likerId, likedId]);
    return res.rowCount > 0;
  },

  checkLikeExists: async (likerId: number, likedId: number): Promise<boolean> => {
    const query = `
      SELECT 1 FROM likes
      WHERE liker_id = $1 AND liked_id = $2
      LIMIT 1
    `;
    const res = await pool.query(query, [likerId, likedId]);
    return res.rows.length > 0;
  },

  checkMutualLike: async (likerId: number, likedId: number): Promise<boolean> => {
    const query = `
      SELECT 1 FROM likes
      WHERE liker_id = $1 AND liked_id = $2
      LIMIT 1
    `;
    const res = await pool.query(query, [likedId, likerId]);
    return res.rows.length > 0;
  },

  getUserLikes: async (userId: number) => {
    const query = `
      SELECT liked_id, created_at
      FROM likes
      WHERE liker_id = $1
      ORDER BY created_at DESC
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },

  getLikedBy: async (userId: number) => {
    const query = `
      SELECT liker_id, created_at
      FROM likes
      WHERE liked_id = $1
      ORDER BY created_at DESC
    `;
    const res = await pool.query(query, [userId]);
    return res.rows;
  },
};

