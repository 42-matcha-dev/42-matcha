import pool from '../database/init.js';

export const authRepository = {
  findUserByEmail: async (email: string) => {
    const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return res.rows[0];
  },

  findUserByIdentifier: async (identifier: string) => {
    const normalized = identifier.toLowerCase().trim()
    const res = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR LOWER(username) = $1',
      [normalized]
    )
    return res.rows[0]
  },

  insertUser: async (data: any) => {
    const query = `
      INSERT INTO users (
        email, password_hash, username, first_name, last_name,
        birthdate, gender, sexual_preferences, biography, location, latitude, longitude, icon_url, photo_urls
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING id;
    `;
    const values = [
      data.email,
      data.password_hash,
      data.username,
      data.first_name,
      data.last_name,
      data.birthdate,
      data.gender,
      data.sexual_preferences,
      data.biography,
      data.location,
      data.latitude,
      data.longitude,
      data.icon_url,
      data.photo_urls,
    ];
    const res = await pool.query(query, values);
    return res.rows[0];
  },
};
