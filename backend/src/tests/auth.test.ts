import request from 'supertest'
import app from '../app.js'
import { initDB } from '../database/init.js'
import pool from '../database/init.js'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

let token: string

const validProfile = {
  firstName: 'John',
  lastName: 'Doe',
  birthday: '1995-01-01',
  gender: 'male',
  lookingFor: 'female',
  description: 'Hello world',
  location: 'Paris',
  latitude: 48.85,
  longitude: 2.35,
  iconUrl: 'http://example.com/photo.jpg',
  photoUrls: ['http://example.com/photo.jpg'],
  curiousAbout: [1, 2]
}

beforeAll(async () => {
  await initDB()
})

beforeEach(async () => {
  await pool.query('TRUNCATE pending_users, users CASCADE')
  const email = 'test@test.com'
  const password = 'password123'
  const hashed = await bcrypt.hash(password, 10)
  token = uuidv4()
  await pool.query('INSERT INTO pending_users (email, password_hash, token) VALUES ($1, $2, $3)', [
    email,
    hashed,
    token
  ])
})

afterAll(async () => {
  await pool.end()
})

describe('Complete profile', () => {
  it('success', async () => {
    const res = await request(app).post(`/api/auth/register?token=${token}`).send(validProfile)

    expect(res.status).toBe(201)
  })
  // First Name
  it('missing firstName', async () => {
    const data: Partial<typeof validProfile> = { ...validProfile }
    delete data.firstName

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })

  it('empty firstName', async () => {
    const data = { ...validProfile, firstName: '' }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })
  //Birthday
  it('invalid birthday (under 18)', async () => {
    const data = { ...validProfile, birthday: '2015-01-01' }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })

  it('birthday exactly 18 years old', async () => {
    const today = new Date()
    const year = today.getFullYear() - 18
    const birthday = `${year}-01-01`

    const data = { ...validProfile, birthday }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(201)
  })
  //Localisation
  it('invalid latitude type', async () => {
    const data = { ...validProfile, latitude: '48.85' }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })

  //Gender
  it('invalid gender', async () => {
    const data = { ...validProfile, gender: 'alien' }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })

  //Looking For
  it('invalid lookingFor', async () => {
    const data = { ...validProfile, lookingFor: 'unknown' }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })

  //Description
  it('empty description allowed or not', async () => {
    const data = { ...validProfile, description: '' }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400) // or 400 depending your rules
  })

  it('script injection in description', async () => {
    const data = { ...validProfile, description: '<script>alert(1)</script>' }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(201) // but sanitized in DB
  })

  //Icon
  it('invalid iconUrl', async () => {
    const data = { ...validProfile, iconUrl: 'not-a-url' }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })

  //Tags
  it('invalid curiousAbout type', async () => {
    const data = { ...validProfile, curiousAbout: 'not-array' }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })

  it('too many tags', async () => {
    const data = { ...validProfile, curiousAbout: [1, 2, 3, 4, 5, 6] }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })
  //Photos
  it('photoUrls not array', async () => {
    const data = { ...validProfile, photoUrls: 'http://example.com/photo.jpg' }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })

  it('too many photos', async () => {
    const data = {
      ...validProfile,
      photoUrls: [
        'http://example.com/1.jpg',
        'http://example.com/2.jpg',
        'http://example.com/3.jpg',
        'http://example.com/4.jpg',
        'http://example.com/5.jpg'
      ]
    }

    const res = await request(app).post(`/api/auth/register?token=${token}`).send(data)

    expect(res.status).toBe(400)
  })
})

describe('Complete profile token', () => {
  it('invalid token', async () => {
    const res = await request(app).post(`/api/auth/register?token=wrong-token`).send(validProfile)

    expect(res.status).toBe(400)
  })

  it('missing token', async () => {
    const res = await request(app).post(`/api/auth/register`).send(validProfile)

    expect(res.status).toBe(400)
  })

  it('expired/used token', async () => {
    // First use token
    await request(app).post(`/api/auth/register?token=${token}`).send(validProfile)

    // Use again
    const res = await request(app).post(`/api/auth/register?token=${token}`).send(validProfile)

    expect(res.status).toBe(400)
  })
})
