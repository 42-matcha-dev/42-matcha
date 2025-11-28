export const createLikeTable = `
CREATE TABLE IF NOT EXISTS likes (
  liker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  liked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (liker_id, liked_id),
  CHECK (liker_id != liked_id)
);
`;

