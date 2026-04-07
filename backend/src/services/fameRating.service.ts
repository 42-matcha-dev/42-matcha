import pool from '../database/init.js'

export const fameRatingService = {
  refresh: async (): Promise<void> => {
    const query = `
      WITH raw_scores AS (
        SELECT
          u.id AS user_id,
          GREATEST(0,
            COALESCE((
              SELECT SUM(
                CASE n.type
                  WHEN 'MATCH' THEN
                    CASE
                      WHEN n.created_at >= NOW() - INTERVAL '30 days' THEN 10.0
                      WHEN n.created_at >= NOW() - INTERVAL '90 days' THEN 5.0
                      ELSE 2.0
                    END
                  WHEN 'LIKE' THEN
                    CASE WHEN NOT EXISTS (
                      SELECT 1 FROM notifications m
                      WHERE m.user_id = u.id AND m.actor_id = n.actor_id AND m.type = 'MATCH'
                    ) THEN
                      CASE
                        WHEN n.created_at >= NOW() - INTERVAL '30 days' THEN 7.0
                        WHEN n.created_at >= NOW() - INTERVAL '90 days' THEN 3.5
                        ELSE 1.4
                      END
                    ELSE 0 END
                  WHEN 'VIEW' THEN
                    CASE
                      WHEN n.created_at >= NOW() - INTERVAL '30 days' THEN 1.0
                      WHEN n.created_at >= NOW() - INTERVAL '90 days' THEN 0.5
                      ELSE 0.2
                    END
                  WHEN 'UNLIKE' THEN
                    CASE
                      WHEN n.created_at >= NOW() - INTERVAL '30 days' THEN -3.0
                      WHEN n.created_at >= NOW() - INTERVAL '90 days' THEN -1.5
                      ELSE -0.6
                    END
                  ELSE 0
                END
              )
              FROM notifications n
              WHERE n.user_id = u.id
            ), 0)
            - (SELECT COUNT(*) FROM blocks   WHERE blocked_id  = u.id) * 5
            - (SELECT COUNT(*) FROM reports  WHERE reported_id = u.id) * 15
            + CASE WHEN array_length(u.photo_urls, 1) >= 2 THEN 5 ELSE 0 END
            + CASE WHEN (SELECT COUNT(*) FROM user_tags WHERE user_id = u.id) >= 3 THEN 5 ELSE 0 END
          ) AS raw_score
        FROM users u
      ),
      percentiles AS (
        SELECT
          user_id,
          ROUND(PERCENT_RANK() OVER (ORDER BY raw_score) * 100)::int AS fame_rating
        FROM raw_scores
      )
      UPDATE users u
      SET fame_rating = p.fame_rating
      FROM percentiles p
      WHERE u.id = p.user_id
    `
    await pool.query(query)
  },

  scheduleRefresh: (intervalMs = 3_600_000): NodeJS.Timeout => {
    return setInterval(() => {
      fameRatingService.refresh().catch(err =>
        console.error('❌ Scheduled fame rating refresh failed:', err)
      )
    }, intervalMs)
  }
}
