import pool from '../database/init.js'
import { HttpError } from '../errors/HttpError.js'
import type { SearchUsersSchema } from '../schemas/search.schema.js'
import type { UpdateProfileSchema } from '../schemas/updateProfile.schema.js'

type UserRow = {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  birthdate: string
  gender: 'male' | 'female'
  sexual_preferences: 'male' | 'female' | 'both'
  biography: string
  fame_rating: number
  distance: number
  can_like: boolean
  location: string
  latitude: number
  longitude: number
  icon_url: string | null
  photo_urls: string[] | null
  updated_at: string
  is_online: boolean
  last_seen_at: string | null
}

function mapUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    firstName: row.first_name,
    lastName: row.last_name,
    birthday: row.birthdate,
    gender: row.gender,
    lookingFor: row.sexual_preferences,
    description: row.biography,
    fameRating: row.fame_rating,
    distance: row.distance,
    canLike: row.can_like,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    iconUrl: row.icon_url,
    photoUrls: row.photo_urls,
    isOnline: row.is_online,
    lastSeenAt: row.last_seen_at ?? null

  }
}

export const userRepository = {
  findCredentialById: async (userId: number) => {
    const res = await pool.query('SELECT id, email, password_hash FROM users WHERE id = $1', [
      userId
    ])
    return res.rows[0]
  },

  userExistsByEmail: async (email: string) => {
    const res = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    return res.rowCount > 0
  },

  userExistsByUsername: async (username: string) => {
    const res = await pool.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username])
    return res.rowCount > 0
  },

  findUserIdByUsername: async (username: string): Promise<number | null> => {
    const res = await pool.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username])
    return res.rows[0]?.id ?? null
  },

  setOnlineStatus: async (userId: number, isOnline: boolean) => {
    await pool.query(
      `UPDATE users
       SET is_online = $2,
           last_seen_at = CASE WHEN $2 = false THEN NOW() ELSE last_seen_at END
       WHERE id = $1`,
      [userId, isOnline]
    )
  },

  findUserById: async (userId: number, currentUserId: number) => {
    const query = `
      SELECT
        u.id,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.birthdate,
        u.gender,
        u.sexual_preferences,
        u.biography,
        u.location,
        u.latitude,
        u.longitude,
        u.icon_url,
        u.photo_urls,
        u.fame_rating,
        u.is_online,
        u.last_seen_at,

        -- distance from current user
        6371 * acos(
          cos(radians(me.latitude)) * cos(radians(u.latitude)) *
          cos(radians(u.longitude) - radians(me.longitude)) +
          sin(radians(me.latitude)) * sin(radians(u.latitude))
        ) AS distance,

        -- can like this user
        (
          (me.sexual_preferences::TEXT = 'both' OR me.sexual_preferences::TEXT = u.gender::TEXT)
          AND
          (u.sexual_preferences::TEXT = 'both' OR u.sexual_preferences::TEXT = me.gender::TEXT)
          AND
          (u.id != me.id)
        ) AS can_like

      FROM users u
      JOIN users me ON me.id = $2
      WHERE u.id = $1
    `
    const res = await pool.query(query, [userId, currentUserId])
    const row = res.rows[0]
    if (!row) return null
    return mapUser(row)
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

  updateUserTags: async (userId: number, tagIds: number[]) => {
    await pool.query(
      'DELETE FROM user_tags WHERE user_id = $1',
      [userId]
    )
    if (tagIds.length === 0) return
    // Insert tags one by one to avoid SQL injection and handle conflicts
    for (const tagId of tagIds) {
      await pool.query(
        'INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2) ON CONFLICT (user_id, tag_id) DO NOTHING',
        [userId, tagId]
      )
    }
  },

  usernameExistsForOther: async (username: string, excludeUserId: number) => {
    const res = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2',
      [username, excludeUserId]
    )
    return res.rowCount > 0
  },

  updateUserProfile: async (userId: number, data: UpdateProfileSchema) => {
    const fieldMap: Record<string, string> = {
      username: 'username',
      firstName: 'first_name',
      lastName: 'last_name',
      birthday: 'birthdate',
      gender: 'gender',
      lookingFor: 'sexual_preferences',
      description: 'biography',
      location: 'location',
      latitude: 'latitude',
      longitude: 'longitude',
      iconUrl: 'icon_url',
      photoUrls: 'photo_urls'
    }

    const fields: string[] = []
    const values: any[] = []
    let index = 1

    for (const key in data) {
      const typedKey = key as keyof UpdateProfileSchema

      if (fieldMap[typedKey as string]) {
        fields.push(`${fieldMap[typedKey as string]} = $${index}`)
        values.push(data[typedKey])
        index++
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields provided')
    }

    values.push(userId)

    const query = `
      UPDATE users
      SET ${fields.join(', ')},
        updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `

    try {
      const res = await pool.query(query, values)
      return res.rows[0]
    } catch (err: any) {
      if (err.code === '23505' && err.constraint?.includes('username')) {
        throw new HttpError(409, 'Username is already taken')
      }
      throw err
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

  searchUsers: async (currentUserId: number, params: SearchUsersSchema) => {
    const {
      ageMin,
      ageMax,
      distanceMax,
      fameMin,
      fameMax,
      tagIds,
      page = 0,
      limit = 20,
      sortBy = 'distance',
      order = 'asc'
    } = params

    const offset = page * limit

    // Build the base WHERE conditions
    let whereConditions = `
      ru.id != $1
      -- Sexual preferences filter
      AND (
        me.sexual_preferences::text = 'both' OR me.sexual_preferences::text = ru.gender::text
      )
      AND (
        ru.sexual_preferences::text = 'both' OR ru.sexual_preferences::text = me.gender::text
      )
      -- Exclude blocked users
      AND ru.id NOT IN (
        SELECT blocked_id FROM blocks WHERE blocker_id = $1
      )
      -- Exclude users that blocked me
      AND ru.id NOT IN (
        SELECT blocker_id FROM blocks WHERE blocked_id = $1
      )
      -- Exclude reported users
      AND ru.id NOT IN (
        SELECT reported_id FROM reports WHERE reporter_id = $1
      )
      -- Exclude users that reported me
      AND ru.id NOT IN (
        SELECT reporter_id FROM reports WHERE reported_id = $1
      )
    `

    const queryParams: any[] = [currentUserId]
    let paramIndex = 2

    // Add age filter
    if (ageMin !== undefined && ageMax !== undefined) {
      whereConditions += `
        AND ru.age BETWEEN $${paramIndex} AND $${paramIndex + 1}
      `
      queryParams.push(ageMin, ageMax)
      paramIndex += 2
    } else if (ageMin !== undefined) {
      whereConditions += `
        AND ru.age >= $${paramIndex}
      `
      queryParams.push(ageMin)
      paramIndex++
    } else if (ageMax !== undefined) {
      whereConditions += `
        AND ru.age <= $${paramIndex}
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
          WHERE ut.user_id = ru.id
            AND ut.tag_id = ANY($${paramIndex}::int[])
        ) >= $${paramIndex + 1}
      `
      queryParams.push(tagIds, tagIds.length)
      paramIndex += 2
    }

    // Fame rating filter
    if (fameMin !== undefined && fameMax !== undefined) {
      whereConditions += `
        AND ru.fame_rating BETWEEN $${paramIndex} AND $${paramIndex + 1}
      `
      queryParams.push(fameMin, fameMax)
      paramIndex += 2
    } else if (fameMin !== undefined) {
      whereConditions += `
        AND ru.fame_rating >= $${paramIndex}
      `
      queryParams.push(fameMin)
      paramIndex++
    } else if (fameMax !== undefined) {
      whereConditions += `
        AND ru.fame_rating <= $${paramIndex}
      `
      queryParams.push(fameMax)
      paramIndex++
    }

    // Add distance filter only if distanceMax is provided
    if (distanceMax !== undefined) {
      whereConditions += `
        -- Distance filter
        AND ru.distance BETWEEN 0 AND $${paramIndex}
      `
      queryParams.push(distanceMax)
      paramIndex += 1
    }

    // Main search query
    const limitParam = paramIndex
    const offsetParam = paramIndex + 1

    // Determine order by clause
    let orderByClause = 'ORDER BY ru.distance ASC'
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'
    switch (sortBy) {
      case 'age':
        orderByClause = `ORDER BY ru.age ${sortOrder}, ru.distance ASC`
        break
      case 'fame':
        orderByClause = `ORDER BY ru.fame_rating ${sortOrder}, ru.distance ASC`
        break
      case 'tags':
        orderByClause = `ORDER BY COALESCE(json_array_length(ru.common_tags), 0) ${sortOrder}, ru.distance ASC`
        break
      case 'distance':
      default:
        orderByClause = `ORDER BY ru.distance ${sortOrder}`
        break
    }

    const baseQuery = `
      WITH base_users AS (
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
          u.fame_rating,
          6371 * acos(
            cos(radians(me.latitude)) * cos(radians(u.latitude)) *
            cos(radians(u.longitude) - radians(me.longitude)) +
            sin(radians(me.latitude)) * sin(radians(u.latitude))
          ) AS distance,
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
      )
    `
    const searchQuery = `
      ${baseQuery}
      SELECT ru.*
      FROM base_users ru
      JOIN users me ON me.id = $1
      WHERE ${whereConditions}
      ${orderByClause}
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `
    queryParams.push(limit, offset)

    // Count query (same conditions but without LIMIT/OFFSET)
    const countQuery = `
      ${baseQuery}
      SELECT COUNT(*) as total
      FROM base_users ru
      JOIN users me ON me.id = $1
      WHERE ${whereConditions}
    `
    // Remove limit and offset from count query params
    const countParams = queryParams.slice(0, -2)

    try {
      const [searchResult, countResult] = await Promise.all([
        pool.query(searchQuery, queryParams),
        pool.query(countQuery, countParams)
      ])

      return {
        results: searchResult.rows,
        totalCount: parseInt(countResult.rows[0].total, 10)
      }
    } catch (error) {
      console.error('searchUsers query failed', {
        error,
        currentUserId,
        params
      })
      throw new Error('DATABASE_QUERY_FAILED')
    }
  }
}
