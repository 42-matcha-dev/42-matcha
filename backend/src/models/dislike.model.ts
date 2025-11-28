export const createDislikeTable = `
CREATE TABLE IF NOT EXISTS dislikes (
  disliker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  disliked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (disliker_id, disliked_id),
  CHECK (disliker_id != disliked_id)
);
`;

