import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { emailChangeRepository } from '../repositories/change_email.repository.js';
import { authRepository } from '../repositories/auth.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendEmail } from '../utils/email.util.js';
import { HttpError } from '../errors/HttpError.js';

const VERIFY_TOKEN_EXPIRY_HOURS = 1;

export const emailChangeService = {
  requestChange: async (userId: number, newEmail: string, currentPassword: string) => {
    const normalizedEmail = newEmail.trim().toLowerCase();
    const password = currentPassword.trim();

    if (!normalizedEmail || !password) {
      throw new HttpError(400, 'New email and current password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new HttpError(400, 'Invalid email format');
    }

    const currentUser = await userRepository.findCredentialById(userId);
    if (!currentUser) {
      throw new HttpError(404, 'User not found');
    }

    if (normalizedEmail === currentUser.email) {
      throw new HttpError(400, 'New email must be different from current email');
    }

    const isPasswordValid = await bcrypt.compare(password, currentUser.password_hash);
    if (!isPasswordValid) {
      throw new HttpError(401, 'Current password is incorrect');
    }

    const existing = await authRepository.findUserByEmail(normalizedEmail);
    if (existing && existing.id !== userId) {
      throw new HttpError(409, 'This email is already in use');
    }

    await emailChangeRepository.deleteByUserId(userId);

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await emailChangeRepository.create(userId, normalizedEmail, token, expiresAt);

    const verifyLink = `${process.env.FRONTEND_URL}/confirm-email-change?token=${token}`;
    await sendEmail({
      to: normalizedEmail,
      subject: 'Confirm your new email address',
      text: `Click here to confirm your new email address: ${verifyLink}\n\nThis link expires in ${VERIFY_TOKEN_EXPIRY_HOURS} hour(s). If you didn’t request this change, you can ignore this email.`,
      html: `
        <h2>Confirm your email change</h2>
        <p>We received a request to update your email address.</p>
        <p>Click the link below to confirm your new email:</p>
        <a href="${verifyLink}">${verifyLink}</a>
        <p>This link expires in ${VERIFY_TOKEN_EXPIRY_HOURS} hour(s).</p>
        <p>If you didn’t request this change, you can safely ignore this email and your current email will remain unchanged.</p>
    `,
    });

    await sendEmail({
      to: currentUser.email,
      subject: 'Email change requested',
      text: `A request to change your account email to ${normalizedEmail} was made. If this wasn't you, please secure your account immediately.`,
    });

    return {
      message: 'Verification email sent to your new address',
    };
  },

  confirmChange: async (token: string) => {
    if (!token || !token.trim()) {
      throw new HttpError(400, 'Token is required');
    }

    const record = await emailChangeRepository.findValidByToken(token);
    if (!record) {
      throw new HttpError(400, 'Invalid or expired verification token');
    }

    const existing = await authRepository.findUserByEmail(record.new_email);
    if (existing && existing.id !== record.user_id) {
      throw new HttpError(409, 'This email is already in use');
    }

    const { default: pool } = await import('../database/init.js');
    await pool.query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [
      record.new_email,
      record.user_id,
    ]);

    await emailChangeRepository.markUsed(record.id);
    return { message: 'Email updated successfully' };
  },
};
