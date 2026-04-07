import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { passwordResetRepository } from '../repositories/password_reset.repository.js';
import { authRepository } from '../repositories/auth.repository.js';
import { sendEmail } from '../utils/email.util.js';
import { HttpError } from '../errors/HttpError.js';

const RESET_TOKEN_EXPIRY_HOURS = 1;

export const passwordResetService = {
  requestReset: async (email: string) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) return; // silent — don't leak whether email exists

    await passwordResetRepository.deleteByUserId(user.id);

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await passwordResetRepository.create(user.id, token, expiresAt);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Reset your Matcha password',
      text: `Click here to reset your password: ${resetLink}\n\nThis link expires in ${RESET_TOKEN_EXPIRY_HOURS} hour(s).`,
      html: `
        <h2>Reset your password</h2>
        <p>Click the link below to reset your Matcha password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in ${RESET_TOKEN_EXPIRY_HOURS} hour(s). If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    const resetRecord = await passwordResetRepository.findValidByToken(token);
    if (!resetRecord) {
      throw new HttpError(400, 'Invalid or expired reset token')
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { default: pool } = await import('../database/init.js');
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      hashedPassword,
      resetRecord.user_id,
    ]);

    await passwordResetRepository.markUsed(resetRecord.id);
  },
};
