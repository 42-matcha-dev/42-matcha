import { Pool } from 'pg';
import { createUserTable } from '../models/user.model.js';
import { createPendingUserTable } from '../models/pending_user.model.js';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export const initDB = async () => {
  await pool.query(createUserTable);
  await pool.query(createPendingUserTable);
  console.log('✅ Database initialized');
};

export default pool;
