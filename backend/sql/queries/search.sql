SELECT
	u.username,
	date_part('year', age(u.birthdate)) AS age,
	u.gender,
	u.sexual_preferences,
	u.location,
	me.location,
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
ORDER BY distance DESC;
