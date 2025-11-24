export const createUserTable = `
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
CREATE TYPE preference_enum AS ENUM ('male', 'female', 'both');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  password_hash TEXT NOT NULL,
  gender gender_enum,
  sexual_preferences preference_enum,
  biography TEXT,
  fame_rating INTEGER DEFAULT 0,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  icon_url TEXT,
  photo_urls TEXT[] CHECK (array_length(photo_urls, 1) <= 4),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;
