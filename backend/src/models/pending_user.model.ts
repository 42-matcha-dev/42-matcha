export const createPendingUserTable = `
CREATE TABLE IF NOT EXISTS pending_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  token UUID UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
`;
