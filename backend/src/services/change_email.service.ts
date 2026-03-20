import { v4 as uuidv4 } from 'uuid';
import { emailChangeRepository } from '../repositories/change_email.repository.js';
import { authRepository } from '../repositories/auth.repository.js';
import { sendEmail } from '../utils/email.util.js';

const VERIFY_TOKEN_EXPIRY_HOURS = 1;

export const emailChangeService = {
  requestReset: async (userId: number, newEmail: string) => {
    const user = await authRepository.findUserByEmail(newEmail);
    if (user) return; // silent — don't leak whether email exists
    await emailChangeRepository.deleteByUserId(userId);

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + VERIFY_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await emailChangeRepository.create(userId, newEmail, token, expiresAt);

    const verifyLink = `${process.env.FRONTEND_URL}/confirm-email-change?token=${token}`;
    await sendEmail({
    to: newEmail,
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
    })
  },

  changeEmail: async (token: string) => {
    const record = await emailChangeRepository.findValidByToken(token);
    if (!record) throw new Error('Invalid or expired reset token');

    const { default: pool } = await import('../database/init.js');
    await pool.query('UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2', [
      record.new_email,
      record.user_id,
    ]);

    await emailChangeRepository.markUsed(record.id);
  },
};
