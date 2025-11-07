export const createUserTagsTable = `
CREATE TABLE user_tags (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, tag_id)
);
`;
