import pool from '../database/init.js'

export const userRepository = {
  findUserById: async (id: number) => {
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    return res.rows[0]
  },

  insertUserTags: async (userId: number, tagIds: number[]) => {
    if (tagIds.length === 0) return

    // Insert tags one by one to avoid SQL injection and handle conflicts
    for (const tagId of tagIds) {
      await pool.query(
        'INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2) ON CONFLICT (user_id, tag_id) DO NOTHING',
        [userId, tagId]
      )
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
    )
    return res.rows
  },

  searchUsers: async (
    currentUserId: number,
    params: {
      ageMin?: number
      ageMax?: number
      distanceMax?: number
      fameMin?: number
      fameMax?: number
      tagIds?: number[]
      page?: number
      limit?: number
    }
  ) => {
    const { ageMin, ageMax, distanceMax, fameMin, fameMax, tagIds, page = 0, limit = 20 } = params

    const offset = page * limit

    // Build the base WHERE conditions
    let whereConditions = `
      u.id != $1
      -- Sexual preferences filter
      AND (
        me.sexual_preferences::text = 'both' OR me.sexual_preferences::text = u.gender::text
      )
      AND (
        u.sexual_preferences::text = 'both' OR u.sexual_preferences::text = me.gender::text
      )
      -- Exclude disliked users
      AND u.id NOT IN (
        SELECT disliked_id FROM dislikes WHERE disliker_id = $1
      )
      -- Exclude blocked users
      AND u.id NOT IN (
        SELECT blocked_id FROM blocks WHERE blocker_id = $1
      )
      -- Exclude users that blocked me
      AND u.id NOT IN (
        SELECT blocker_id FROM blocks WHERE blocked_id = $1
      )
    `

    const queryParams: any[] = [currentUserId]
    let paramIndex = 2

    // Add age filter
    if (ageMin !== undefined && ageMax !== undefined) {
      whereConditions += `
    AND date_part('year', age(u.birthdate))
        BETWEEN $${paramIndex} AND $${paramIndex + 1}
  `
      queryParams.push(ageMin, ageMax)
      paramIndex += 2
    } else if (ageMin !== undefined) {
      whereConditions += `
    AND date_part('year', age(u.birthdate)) >= $${paramIndex}
  `
      queryParams.push(ageMin)
      paramIndex++
    } else if (ageMax !== undefined) {
      whereConditions += `
    AND date_part('year', age(u.birthdate)) <= $${paramIndex}
  `
      queryParams.push(ageMax)
      paramIndex++
    }

    // Add tags filter if provided
    if (tagIds && tagIds.length > 0) {
      whereConditions += `
        -- Tags filter
        AND (
          SELECT COUNT(*)
          FROM user_tags ut
          WHERE ut.user_id = u.id
            AND ut.tag_id = ANY($${paramIndex}::int[])
        ) >= $${paramIndex + 1}
      `
      queryParams.push(tagIds, tagIds.length)
      paramIndex += 2
    }

    // Add fame rating filter only if both fameMin and fameMax are provided
    if (fameMin !== undefined && fameMax !== undefined) {
      whereConditions += `
        -- Fame rating filter
        AND 20 * (
          SELECT COUNT(*)
          FROM tags t
          JOIN user_tags ut ON ut.tag_id = t.id
          WHERE ut.user_id = u.id
            AND ut.tag_id IN (
              SELECT tag_id FROM user_tags WHERE user_id = $1
            )
        ) BETWEEN $${paramIndex} AND $${paramIndex + 1}
      `
      queryParams.push(fameMin, fameMax)
      paramIndex += 2
    }

    // Add distance filter only if distanceMax is provided
    if (distanceMax !== undefined) {
      whereConditions += `
        -- Distance filter
        AND 6371 * acos(
          cos(radians(me.latitude)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians(me.longitude)) +
          sin(radians(me.latitude)) * sin(radians(u.latitude))
        ) BETWEEN 0 AND $${paramIndex}
      `
      queryParams.push(distanceMax)
      paramIndex += 1
    }

    // Main search query
    const limitParam = paramIndex
    const offsetParam = paramIndex + 1
    const searchQuery = `
      SELECT
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        date_part('year', age(u.birthdate)) AS age,
        u.gender,
        u.sexual_preferences,
        u.location,
        u.icon_url,
        u.photo_urls[1] AS photo_url,
        6371 * acos(
          cos(radians(me.latitude)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians(me.longitude)) +
          sin(radians(me.latitude)) * sin(radians(u.latitude))
        ) AS distance,
        20 * (
          SELECT COUNT(*)
          FROM tags t
          JOIN user_tags ut ON ut.tag_id = t.id
          WHERE ut.user_id = u.id
            AND ut.tag_id IN (
              SELECT tag_id FROM user_tags WHERE user_id = $1
            )
        ) AS fame_rating,
        (
          SELECT json_agg(t.name)
          FROM tags t
          JOIN user_tags ut ON ut.tag_id = t.id
          WHERE ut.user_id = u.id
            AND ut.tag_id IN (
              SELECT tag_id FROM user_tags WHERE user_id = $1
            )
        ) AS common_tags
      FROM users u
      JOIN users me ON me.id = $1
      WHERE ${whereConditions}
      ORDER BY distance ASC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `
    queryParams.push(limit, offset)

    // Count query (same conditions but without LIMIT/OFFSET)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      JOIN users me ON me.id = $1
      WHERE ${whereConditions}
    `
    // Remove limit and offset from count query params
    const countParams = queryParams.slice(0, -2)

    const [searchResult, countResult] = await Promise.all([
      pool.query(searchQuery, queryParams),
      pool.query(countQuery, countParams)
    ])

    return {
      results: searchResult.rows,
      totalCount: parseInt(countResult.rows[0].total, 10)
    }
  }
}
