export const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  password_hash TEXT NOT NULL,
  gender VARCHAR(20),
  sexual_preferences VARCHAR(20),
  biography TEXT,
  fame_rating INTEGER DEFAULT 0,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
`;
