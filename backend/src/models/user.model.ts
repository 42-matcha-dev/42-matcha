export const createUserTable = `
DO $$ BEGIN
    CREATE TYPE gender_enum AS ENUM ('male', 'female');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE preference_enum AS ENUM ('male', 'female', 'both');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  birthdate DATE,
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
  updated_at TIMESTAMP DEFAULT NOW(),
  is_online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMP
);
`;
