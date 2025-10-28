import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database/init.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

type Request = express.Request;
type Response = express.Response;

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Missing fields' });

    const hashed = await bcrypt.hash(password, 10);
    const token = uuidv4();

    await pool.query(
      'INSERT INTO pending_users (email, password_hash, token) VALUES ($1, $2, $3)',
      [email, hashed, token]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const verifyLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your Matcha account',
      text: `Click here to verify your account: ${verifyLink}`,
    });

    res.status(200).json({ message: 'Verification email sent' });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};


export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;
  const result = await pool.query('SELECT * FROM pending_users WHERE token = $1', [token]);

  if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired token' });

  const { email, password_hash } = result.rows[0];
  await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email, password_hash]);
  await pool.query('DELETE FROM pending_users WHERE token = $1', [token]);

  res.status(200).json({ message: 'Account verified' });
};

export const signin = async (req: Request, res: Response) => {
  res.json({ message: 'signin route (to implement)' });
};
