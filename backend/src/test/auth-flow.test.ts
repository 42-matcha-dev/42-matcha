/// <reference types="jest" />
import pool from '../database/init.js';

const API_URL = process.env.API_URL || 'http://localhost:4000';

describe('Auth Flow Integration Tests', () => {
  let testEmail: string;
  let testPassword: string;

  beforeEach(() => {
    testEmail = `test_${Date.now()}@example.com`;
    testPassword = 'TestPassword123!';
  });

  afterEach(async () => {
    // Cleanup test data
    try {
      await pool.query('DELETE FROM pending_users WHERE email = $1', [testEmail]);
      await pool.query('DELETE FROM users WHERE email = $1', [testEmail]);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  afterAll(async () => {
    // Close database connection pool to allow Jest to exit
    await pool.end();
  });

  test('should complete signup → complete profile flow', async () => {
    // Step 1: Test signup
    const signupResponse = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const signupData = await signupResponse.json();
    expect(signupResponse.ok).toBe(true);
    expect(signupData.message).toBe('Verification email sent');

    // Step 2: Get token from database (since we can't intercept email)
    const tokenResult = await pool.query(
      'SELECT token FROM pending_users WHERE email = $1',
      [testEmail]
    );

    expect(tokenResult.rows.length).toBeGreaterThan(0);
    const token = tokenResult.rows[0].token;
    expect(token).toBeDefined();

    // Step 3: Test complete registration
    const completeResponse = await fetch(
      `${API_URL}/api/auth/complete-registration?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          gender: 'male',
          lookingFor: 'female',
          description: 'Test biography',
          location: 'Paris, France',
          iconImage: 'https://example.com/icon.jpg',
          photos: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
        }),
      }
    );

    const completeData = await completeResponse.json();
    expect(completeResponse.ok).toBe(true);
    expect(completeData.message).toBe('User profile completed');
    expect(completeData.userId).toBeDefined();

    // Step 4: Verify user was created
    const userResult = await pool.query(
      'SELECT id, email, username, first_name, last_name FROM users WHERE email = $1',
      [testEmail]
    );

    expect(userResult.rows.length).toBe(1);
    expect(userResult.rows[0].email).toBe(testEmail);
    expect(userResult.rows[0].first_name).toBe('John');
    expect(userResult.rows[0].last_name).toBe('Doe');

    // Step 5: Verify pending user was deleted
    const pendingCheck = await pool.query(
      'SELECT * FROM pending_users WHERE email = $1',
      [testEmail]
    );

    expect(pendingCheck.rows.length).toBe(0);
  });

  test('should reject signup with missing fields', async () => {
    const signupResponse = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        // Missing password
      }),
    });

    expect(signupResponse.ok).toBe(false);
    expect(signupResponse.status).toBe(400);
  });

  test('should reject complete registration with invalid token', async () => {
    const completeResponse = await fetch(
      `${API_URL}/api/auth/complete-registration?token=invalid-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          gender: 'male',
          lookingFor: 'female',
          description: 'Test biography',
          location: 'Paris, France',
          iconImage: 'https://example.com/icon.jpg',
          photos: ['https://example.com/photo1.jpg'],
        }),
      }
    );

    expect(completeResponse.ok).toBe(false);
    expect(completeResponse.status).toBe(400);
  });
});
