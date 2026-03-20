export const createChangeEmailTable = `
CREATE TABLE IF NOT EXISTS change_emails (
  id SERIAL PRIMARY KEY,
  new_email VARCHAR(255) NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token UUID UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
`;
