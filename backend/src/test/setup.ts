import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
const envPath = resolve(process.cwd(), '.env');
config({ path: envPath });

// Override DB_HOST for tests running from host (not in container)
// In Docker, DB_HOST is 'db', but from host it should be 'localhost'
if (process.env.DB_HOST === 'db' && !process.env.DOCKER_CONTAINER) {
  // If running from host, use localhost instead of 'db' service name
  process.env.DB_HOST = 'localhost';
}

// Ensure required env vars are set
if (!process.env.DB_PASSWORD) {
  console.warn('⚠️  DB_PASSWORD not set. Make sure .env file is loaded correctly.');
}

