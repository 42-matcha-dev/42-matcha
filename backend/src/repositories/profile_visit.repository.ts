import pool from '../database/init.js';

export const profileVisitRepository = {
  createVisit: async (visitorId: number, visitedId: number) => {
    const query = `
      INSERT INTO profile_visits (visitor_id, visited_id)
      VALUES ($1, $2)
      RETURNING id, visitor_id, visited_id, created_at
    `;
    const res = await pool.query(query, [visitorId, visitedId]);
    return res.rows[0];
  },

  getVisitors: async (visitedId: number) => {
    const query = `
      SELECT * FROM (
        SELECT DISTINCT ON (pv.visitor_id)
          pv.visitor_id AS id,
          u.username,
          u.first_name,
          u.last_name,
          u.icon_url,
          pv.created_at
        FROM profile_visits pv
        JOIN users u ON u.id = pv.visitor_id
        WHERE pv.visited_id = $1
        ORDER BY pv.visitor_id, pv.created_at DESC
      ) latest_visits
      ORDER BY created_at DESC
    `;
    const res = await pool.query(query, [visitedId]);
    return res.rows;
  },
};
