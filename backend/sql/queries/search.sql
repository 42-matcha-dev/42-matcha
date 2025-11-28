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
				SELECT tag_id FROM user_tags WHERE user_id = me.id
			)
	) AS fame_rating,
	(
		SELECT json_agg(t.name)
		FROM tags t
		JOIN user_tags ut ON ut.tag_id = t.id
		WHERE ut.user_id = u.id
			AND ut.tag_id IN (
				SELECT tag_id FROM user_tags WHERE user_id = me.id
			)
	) AS common_tags
FROM users u
JOIN users me ON me.id = 1
WHERE u.id != 1
	-- Sexual preferences filter
	AND (
		me.sexual_preferences::text = 'both' OR me.sexual_preferences::text = u.gender::text
	)
	AND (
		u.sexual_preferences::text = 'both' OR u.sexual_preferences::text = me.gender::text
	)
	-- Exclude disliked users
	AND u.id NOT IN (
		SELECT disliked_id FROM dislikes WHERE disliker_id = me.id
	)
	-- Exclude blocked users
	AND u.id NOT IN (
		SELECT blocked_id FROM blocks WHERE blocker_id = me.id
	)
	-- Exclude users that blocked me
	AND u.id NOT IN (
		SELECT blocker_id FROM blocks WHERE blocked_id = me.id
	)
	-- Age filter
	AND date_part('year', age(u.birthdate)) BETWEEN 18 AND 100
	-- Fame rating filter
	AND 20 * (
		SELECT COUNT(*)
		FROM tags t
		JOIN user_tags ut ON ut.tag_id = t.id
		WHERE ut.user_id = u.id
			AND ut.tag_id IN (
				SELECT tag_id FROM user_tags WHERE user_id = me.id
			)
	) BETWEEN 0 AND 100
	-- Distance filter
	AND 6371 * acos(
		cos(radians(me.latitude)) * cos(radians(u.latitude)) *
		cos(radians(u.longitude) - radians(me.longitude)) +
		sin(radians(me.latitude)) * sin(radians(u.latitude))
	) BETWEEN 0 AND 100
	-- Tags filter
	-- AND (
	-- 	SELECT COUNT(*)
	-- 	FROM user_tags ut
	-- 	WHERE ut.user_id = u.id
	-- 		AND ut.tag_id = ANY(
	-- 			'{1,2}'
	-- 		)
	-- ) >= 2
-- Order by distance
ORDER BY distance ASC
LIMIT 20
OFFSET 0; -- Page number * 20
