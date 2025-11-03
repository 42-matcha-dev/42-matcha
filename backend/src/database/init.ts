import { Pool } from 'pg';
import { createUserTable } from '../models/user.model.js';
import { createPendingUserTable } from '../models/pending_user.model.js';

let pool: any;

if (process.env.NODE_ENV === 'production') {
  console.log('🚀 Using Supabase');
  pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL, // from Supabase settings
    ssl: { rejectUnauthorized: false },
  });
} else {
  console.log('🚀 Using local database');
  pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}


export const initDB = async () => {
  for (let i = 0; i < 10; i++) {
    try {
      await pool.query(createUserTable);
      await pool.query(createPendingUserTable);
      console.log('✅ Database initialized');
      return;
    } catch (err) {
      console.log(`⏳ Waiting for database... (${i + 1}/10)`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  throw new Error('❌ Database connection failed after retries');
};


export default pool;
