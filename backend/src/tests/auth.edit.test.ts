import request from 'supertest'
import app from '../app.js'
import pool from '../database/init.js'
import { initDB } from '../database/init.js'
import bcrypt from 'bcrypt'

let token: string

beforeAll(async () => {
  await initDB()
})

beforeEach(async () => {
  await pool.query('TRUNCATE users RESTART IDENTITY CASCADE')

  const password = 'password123'
  const hashed = await bcrypt.hash(password, 10)

  await pool.query(
    `INSERT INTO users (
      email, password_hash, username,
      first_name, last_name, birthdate,
      gender, sexual_preferences,
      biography, location, latitude, longitude,
      icon_url, photo_urls
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      'test1@example.com',
      hashed,
      'testuser',
      'John',
      'Doe',
      '1995-01-01',
      'male',
      'female',
      'Hello',
      'Paris',
      48.85,
      2.35,
      'http://example.com/icon.jpg',
      ['http://example.com/icon.jpg']
    ]
  )

  // Login to get token
  const res = await request(app).post('/api/auth/login').send({
    email: 'test1@example.com',
    password: 'password123'
  })

  token = res.body.token
})

describe('Edit profile', () => {
  it('update first name', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'UpdatedName' })
    console.log('BODY:', res.body)
    expect(res.status).toBe(200)
  })

  it('update location', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        location: 'Lyon',
        latitude: 45.764,
        longitude: 4.8357
      })

    expect(res.status).toBe(200)
  })

  it('invalid latitude', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ latitude: 999 })

    expect(res.status).toBe(400)
  })

  it('too many photos', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        photoUrls: [
          'http://example.com/1.jpg',
          'http://example.com/2.jpg',
          'http://example.com/3.jpg',
          'http://example.com/4.jpg',
          'http://example.com/5.jpg'
        ]
      })

    expect(res.status).toBe(400)
  })

  it('empty body', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(res.status).toBe(400)
  })

  it('unauthorized', async () => {
    const res = await request(app).patch('/api/users/me').send({ firstName: 'NoAuth' })

    expect(res.status).toBe(401)
  })
})
