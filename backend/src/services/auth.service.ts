import bcrypt from "bcrypt";
import { authRepository } from "../repositories/auth.repository.js";
import { userService } from "./user.service.js";
import type { RegisterSchema } from "../types/auth.types.js";
import { generateToken } from "../utils/jwt.util.js";
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '../utils/email.util.js';
import { validatePasswordPolicy } from '../utils/password.util.js';
import { HttpError } from "../errors/HttpError.js";
import { userRepository } from "../repositories/user.repository.js";
import { pendingUserRepository } from "../repositories/pending_user.repository.js";

const PENDING_TOKEN_EXPIRY_HOURS = 24;

export const authService = {
  signup: async (mail: string, password: string) => {
    const email = mail.toLowerCase().trim();
    //validate password
    const passwordError = await validatePasswordPolicy(password);
    if (passwordError) {
      throw new HttpError(400, passwordError)
    }

    const userExists = await userRepository.userExistsByEmail(email)
    if (userExists) return; // silent — don't leak whether email exists

    const hashed = await bcrypt.hash(password, 10);
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + PENDING_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await pendingUserRepository.createOrUpdate(email, hashed, token, expiresAt);

    const verifyLink = `${process.env.FRONTEND_URL}/register?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Verify your Matcha account',
      text: `Click here to verify your account: ${verifyLink}. This link expires in ${PENDING_TOKEN_EXPIRY_HOURS} hour(s).`,
    });
  },

  completeProfile: async (token: string, data: RegisterSchema) => {
    const pending = await pendingUserRepository.findByToken(token);
    if (!pending) throw new Error("Invalid or expired token");

    const existing = await authRepository.findUserByEmail(pending.email);
    if (existing) throw new Error("User already registered");

    const username = `${data.firstName.toLowerCase()}_${Date.now()}`;
    const photoUrls = Array.isArray(data.photoUrls) ? data.photoUrls : data.photoUrls.split(",");

    const user = await authRepository.insertUser({
      email: pending.email,
      password_hash: pending.password_hash,
      username,
      first_name: data.firstName,
      last_name: data.lastName,
      birthdate: data.birthday,
      gender: data.gender.toLowerCase(),
      sexual_preferences: data.lookingFor.toLowerCase(),
      biography: data.description,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      icon_url: data.iconUrl,
      photo_urls: photoUrls,
    });

    // Insert user tags if provided
    if (data.curiousAbout && data.curiousAbout.length > 0) {
      await userService.assignTags(user.id, data.curiousAbout);
    }

    await pendingUserRepository.delete(token);
    return user;
  },

  login: async (email: string, password: string) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) throw new Error("Invalid email or password");

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Return user without password_hash for security
    const { password_hash, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  },
};
