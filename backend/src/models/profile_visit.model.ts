export const createProfileVisitTable = `
CREATE TABLE IF NOT EXISTS profile_visits (
  id SERIAL PRIMARY KEY,
  visitor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visited_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
`;
