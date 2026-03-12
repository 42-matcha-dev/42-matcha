export const createReportTable = `
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(20) NOT NULL
    CHECK (reason IN ('FAKE_ACCOUNT', 'SPAM', 'HARASSMENT', 'INAPPROPRIATE', 'OTHER')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (reporter_id, reported_id),
  CHECK (reporter_id != reported_id)
);
`;