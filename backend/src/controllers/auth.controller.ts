import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../database/init.js';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { authService } from '../services/auth.service.js';
import type { RegisterSchema } from '../types/auth.types.js';

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
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
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

const validateRegisterData = (data: any): RegisterSchema => {
  if (!data.firstName || !data.lastName || !data.gender || !data.lookingFor ||
      !data.description || !data.location || !data.iconImage || !data.photos) {
    throw new Error('Missing required fields');
  }
  return data as RegisterSchema;
};

export const completeRegistration = async (req: Request, res: Response) => {
  try {
    const parsed = validateRegisterData(req.body);
    const { token } = req.query;

    const result = await authService.completeProfile(token as string, parsed);
    res.status(201).json({ message: "User profile completed", userId: result.id });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid input" });
  }
};

export const signin = async (req: Request, res: Response) => {
  res.json({ message: 'signin route (to implement)' });
};
