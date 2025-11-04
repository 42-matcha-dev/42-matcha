import bcrypt from 'bcrypt';
import pool from './init.js';

interface TestUser {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  gender: 'male' | 'female' | 'other';
  sexual_preferences: 'male' | 'female' | 'both';
  biography: string;
  location: string;
  icon_url?: string;
  photo_urls?: string[];
}

const testUsers: TestUser[] = [
  {
    email: 'test1@example.com',
    password: 'password123',
    username: 'testuser1',
    first_name: 'Alice',
    last_name: 'Johnson',
    gender: 'female',
    sexual_preferences: 'male',
    biography: 'Love traveling and photography!',
    location: 'Paris, France',
  },
  {
    email: 'test2@example.com',
    password: 'password123',
    username: 'testuser2',
    first_name: 'Bob',
    last_name: 'Smith',
    gender: 'male',
    sexual_preferences: 'female',
    biography: 'Tech enthusiast and coffee lover.',
    location: 'New York, USA',
  },
  {
    email: 'test3@example.com',
    password: 'password123',
    username: 'testuser3',
    first_name: 'Charlie',
    last_name: 'Brown',
    gender: 'male',
    sexual_preferences: 'both',
    biography: 'Musician and artist. Always up for an adventure!',
    location: 'London, UK',
  },
  {
    email: 'test4@example.com',
    password: 'password123',
    username: 'testuser4',
    first_name: 'Diana',
    last_name: 'Prince',
    gender: 'female',
    sexual_preferences: 'both',
    biography: 'Fitness enthusiast and nature lover.',
    location: 'Tokyo, Japan',
  },
  {
    email: 'test5@example.com',
    password: 'password123',
    username: 'testuser5',
    first_name: 'Eve',
    last_name: 'Williams',
    gender: 'female',
    sexual_preferences: 'male',
    biography: 'Bookworm and foodie. Always exploring new restaurants!',
    location: 'Barcelona, Spain',
  },
];

export const seedTestUsers = async () => {
  // Only seed if SEED_TEST_USERS environment variable is set
  if (process.env.SEED_TEST_USERS !== 'true') {
    console.log('ℹ️  Skipping test user seeding (set SEED_TEST_USERS=true to enable)');
    return;
  }

  console.log('🌱 Seeding test users...');

  try {
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [userData.email, userData.username]
      );

      if (existingUser.rows.length > 0) {
        console.log(`⏭️  User ${userData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const password_hash = await bcrypt.hash(userData.password, 10);

      // Insert user
      const query = `
        INSERT INTO users (
          email, password_hash, username, first_name, last_name,
          gender, sexual_preferences, biography, location, icon_url, photo_urls
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, email, username;
      `;
      const values = [
        userData.email,
        password_hash,
        userData.username,
        userData.first_name,
        userData.last_name,
        userData.gender,
        userData.sexual_preferences,
        userData.biography,
        userData.location,
        userData.icon_url || null,
        userData.photo_urls || null,
      ];

      const result = await pool.query(query, values);
      console.log(`✅ Created test user: ${result.rows[0].email} (${result.rows[0].username})`);
    }

    console.log('✅ Test user seeding completed!');
  } catch (err: any) {
    console.error('❌ Error seeding test users:', err.message);
    // Don't throw - allow app to continue even if seeding fails
  }
};

