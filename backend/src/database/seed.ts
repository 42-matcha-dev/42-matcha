import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import pool from './init.js';
import tagsData from '../data/tags.json' with { type: 'json' };

interface TestUser {
  email: string;
  password: string;
  username: string;
  first_name: string;
  last_name: string;
  birthday: string;
  gender: 'male' | 'female';
  sexual_preferences: 'male' | 'female' | 'both';
  biography: string;
  location: string;
  latitude: number;
  longitude: number;
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
    birthday: '1991-01-01',
    gender: 'female',
    sexual_preferences: 'male',
    biography: 'Love traveling and photography!',
    location: 'Paris, France',
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    email: 'test2@example.com',
    password: 'password123',
    username: 'testuser2',
    first_name: 'Bob',
    last_name: 'Smith',
    birthday: '1992-01-01',
    gender: 'male',
    sexual_preferences: 'female',
    biography: 'Tech enthusiast and coffee lover.',
    location: 'New York, USA',
    latitude: 40.7128,
    longitude: -74.0060,
  },
  {
    email: 'test3@example.com',
    password: 'password123',
    username: 'testuser3',
    first_name: 'Charlie',
    last_name: 'Brown',
    birthday: '1993-01-01',
    gender: 'male',
    sexual_preferences: 'both',
    biography: 'Musician and artist. Always up for an adventure!',
    location: 'London, UK',
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    email: 'test4@example.com',
    password: 'password123',
    username: 'testuser4',
    first_name: 'Diana',
    last_name: 'Prince',
    birthday: '1994-01-01',
    gender: 'female',
    sexual_preferences: 'both',
    biography: 'Fitness enthusiast and nature lover.',
    location: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503,
  },
  {
    email: 'test5@example.com',
    password: 'password123',
    username: 'testuser5',
    first_name: 'Eve',
    last_name: 'Williams',
    birthday: '1995-01-01',
    gender: 'female',
    sexual_preferences: 'male',
    biography: 'Bookworm and foodie. Always exploring new restaurants!',
    location: 'Barcelona, Spain',
    latitude: 41.3851,
    longitude: 2.1734,
  },
];

// French cities with matching coordinates
const frenchCities = [
  { city: 'Paris', country: 'FR', latitude: 48.8566, longitude: 2.3522 },
  { city: 'Lyon', country: 'FR', latitude: 45.7640, longitude: 4.8357 },
  { city: 'Marseille', country: 'FR', latitude: 43.2965, longitude: 5.3698 },
  { city: 'Toulouse', country: 'FR', latitude: 43.6047, longitude: 1.4442 },
  { city: 'Nice', country: 'FR', latitude: 43.7102, longitude: 7.2620 },
  { city: 'Nantes', country: 'FR', latitude: 47.2184, longitude: -1.5536 },
  { city: 'Strasbourg', country: 'FR', latitude: 48.5734, longitude: 7.7521 },
  { city: 'Montpellier', country: 'FR', latitude: 43.6108, longitude: 3.8767 },
  { city: 'Bordeaux', country: 'FR', latitude: 44.8378, longitude: -0.5792 },
  { city: 'Lille', country: 'FR', latitude: 50.6292, longitude: 3.0573 },
  { city: 'Rennes', country: 'FR', latitude: 48.1173, longitude: -1.6778 },
  { city: 'Reims', country: 'FR', latitude: 49.2583, longitude: 4.0317 },
  { city: 'Le Havre', country: 'FR', latitude: 49.4944, longitude: 0.1079 },
  { city: 'Saint-Étienne', country: 'FR', latitude: 45.4397, longitude: 4.3872 },
  { city: 'Toulon', country: 'FR', latitude: 43.1242, longitude: 5.9280 },
  { city: 'Grenoble', country: 'FR', latitude: 45.1885, longitude: 5.7245 },
  { city: 'Dijon', country: 'FR', latitude: 47.3220, longitude: 5.0415 },
  { city: 'Angers', country: 'FR', latitude: 47.4739, longitude: -0.5517 },
  { city: 'Nîmes', country: 'FR', latitude: 43.8367, longitude: 4.3601 },
  { city: 'Villeurbanne', country: 'FR', latitude: 45.7719, longitude: 4.8902 },
  { city: 'Saint-Denis', country: 'FR', latitude: 48.9359, longitude: 2.3574 },
  { city: 'Le Mans', country: 'FR', latitude: 48.0061, longitude: 0.1996 },
  { city: 'Aix-en-Provence', country: 'FR', latitude: 43.5297, longitude: 5.4474 },
  { city: 'Brest', country: 'FR', latitude: 48.3904, longitude: -4.4861 },
  { city: 'Tours', country: 'FR', latitude: 47.3941, longitude: 0.6848 },
  { city: 'Amiens', country: 'FR', latitude: 49.8942, longitude: 2.2957 },
  { city: 'Limoges', country: 'FR', latitude: 45.8354, longitude: 1.2622 },
  { city: 'Perpignan', country: 'FR', latitude: 42.6977, longitude: 2.8954 },
  { city: 'Metz', country: 'FR', latitude: 49.1193, longitude: 6.1757 },
  { city: 'Besançon', country: 'FR', latitude: 47.2378, longitude: 6.0241 },
];

const generateFakerUser = (): TestUser => {
  const gender = faker.helpers.arrayElement(['male', 'female'] as const);
  const sexualPreferences = faker.helpers.arrayElement(['male', 'female', 'both'] as const);

  // Generate birthday between 18-80 years ago
  const minAge = 18;
  const maxAge = 42;
  const birthYear = new Date().getFullYear() - faker.number.int({ min: minAge, max: maxAge });
  const birthMonth = faker.number.int({ min: 1, max: 12 });
  const birthDay = faker.number.int({ min: 1, max: 28 }); // Use 28 to avoid month-end issues
  const birthday = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

  // Generate location with coordinates (select from French cities)
  const selectedCity = faker.helpers.arrayElement(frenchCities);
  const location = `${selectedCity.city}, ${selectedCity.country}`;
  const latitude = selectedCity.latitude;
  const longitude = selectedCity.longitude;

  // Generate photo URLs (mandatory, 1-4 photos)
  const photoUrls = Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => faker.image.avatar());

  // Generate icon URL (mandatory)
  const iconUrl = faker.image.avatar();

  return {
    email: faker.internet.email(),
    password: 'password123', // Use same default password as test users
    username: faker.internet.username(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    birthday,
    gender,
    sexual_preferences: sexualPreferences,
    biography: faker.person.bio(),
    location,
    latitude,
    longitude,
    icon_url: iconUrl,
    photo_urls: photoUrls,
  };
};

export const seedTags = async () => {
  console.log('🌱 Seeding tags...');

  try {
    const tagMap = new Map<string, number>(); // name -> id

    for (const [category, tags] of Object.entries(tagsData)) {
      const tagArray = tags as string[];
      for (const tagName of tagArray) {
        // Check if tag already exists
        const existingTag = await pool.query(
          'SELECT id FROM tags WHERE name = $1',
          [tagName]
        );

        if (existingTag.rows.length > 0) {
          tagMap.set(tagName, existingTag.rows[0].id);
          continue;
        }

        // Insert new tag
        const result = await pool.query(
          'INSERT INTO tags (name, category) VALUES ($1, $2) RETURNING id',
          [tagName, category]
        );
        tagMap.set(tagName, result.rows[0].id);
        console.log(`✅ Created tag: ${tagName} (${category})`);
      }
    }

    console.log('✅ Tag seeding completed!');
    return tagMap;
  } catch (err: any) {
    console.error('❌ Error seeding tags:', err.message);
    throw err;
  }
};

export const assignTagsToUser = async (userId: number, tagMap: Map<string, number>) => {
  try {
    // Get all tag IDs
    const allTagIds = Array.from(tagMap.values());

    // Randomly assign 3-6 tags to each user
    const numTags = Math.floor(Math.random() * 4) + 3; // 3-6 tags
    const shuffled = [...allTagIds].sort(() => 0.5 - Math.random());
    const selectedTagIds = shuffled.slice(0, numTags);

    // Insert user_tags associations
    for (const tagId of selectedTagIds) {
      await pool.query(
        'INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2) ON CONFLICT (user_id, tag_id) DO NOTHING',
        [userId, tagId]
      );
    }

    console.log(`✅ Assigned ${selectedTagIds.length} tags to user ${userId}`);
  } catch (err: any) {
    console.error(`❌ Error assigning tags to user ${userId}:`, err.message);
  }
};

export const seedTestUsers = async () => {
  // Only seed if SEED_TEST_USERS environment variable is set
  if (process.env.SEED_TEST_USERS !== 'true') {
    console.log('ℹ️  Skipping test user seeding (set SEED_TEST_USERS=true to enable)');
    return;
  }

  console.log('🌱 Seeding test users...');

  try {
    // First, seed tags
    const tagMap = await seedTags();

    // Generate 300 faker users
    console.log('🌱 Generating 300 faker users...');
    const fakerUsers = Array.from({ length: 1000 }, () => generateFakerUser());

    // Combine existing test users with faker-generated users
    const allUsers = [...testUsers, ...fakerUsers];
    console.log(`📊 Total users to seed: ${allUsers.length} (${testUsers.length} test users + ${fakerUsers.length} faker users)`);

    for (const userData of allUsers) {
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
      // NOTE: Database schema must include latitude and longitude columns for this to work
      // Add to users table: latitude DOUBLE PRECISION, longitude DOUBLE PRECISION
      const query = `
        INSERT INTO users (
          email, password_hash, username, first_name, last_name,
          birthdate, gender, sexual_preferences, biography, location, latitude, longitude, icon_url, photo_urls
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, email, username;
      `;
      const values = [
        userData.email,
        password_hash,
        userData.username,
        userData.first_name,
        userData.last_name,
        userData.birthday,
        userData.gender,
        userData.sexual_preferences,
        userData.biography,
        userData.location,
        userData.latitude,
        userData.longitude,
        userData.icon_url || null,
        userData.photo_urls || null,
      ];

      const result = await pool.query(query, values);
      const userId = result.rows[0].id;
      console.log(`✅ Created test user: ${result.rows[0].email} (${result.rows[0].username})`);

      // Assign tags to the user
      await assignTagsToUser(userId, tagMap);
    }

    console.log('✅ Test user seeding completed!');
  } catch (err: any) {
    console.error('❌ Error seeding test users:', err.message);
    // Don't throw - allow app to continue even if seeding fails
  }
};

