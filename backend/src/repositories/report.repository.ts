import pool from '../database/init.js';

export type ReportReason = 'FAKE_ACCOUNT' | 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'OTHER';

export const reportRepository = {
  createReport: async (reporterId: number, reportedId: number, reason: ReportReason, description?: string) => {
    const query = `
      INSERT INTO reports (reporter_id, reported_id, reason, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, reporter_id, reported_id, reason, description, created_at
    `;
    const res = await pool.query(query, [reporterId, reportedId, reason, description ?? null]);
    return res.rows[0];
  },

  checkReportExists: async (reporterId: number, reportedId: number): Promise<boolean> => {
    const query = `
      SELECT 1 FROM reports
      WHERE reporter_id = $1 AND reported_id = $2
      LIMIT 1
    `;
    const res = await pool.query(query, [reporterId, reportedId]);
    return res.rows.length > 0;
  },

  isReported: async (userA: number, userB: number): Promise<boolean> => {
    const query = `
      SELECT 1 FROM reports
      WHERE (reporter_id = $1 AND reported_id = $2)
         OR (reporter_id = $2 AND reported_id = $1)
      LIMIT 1
    `;
    const res = await pool.query(query, [userA, userB]);
    return res.rows.length > 0;
  },

  getReportsByUser: async (reporterId: number) => {
    const query = `
      SELECT id, reporter_id, reported_id, reason, description, created_at
      FROM reports
      WHERE reporter_id = $1
      ORDER BY created_at DESC
    `;
    const res = await pool.query(query, [reporterId]);
    return res.rows;
  },
};