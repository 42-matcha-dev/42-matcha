import bcrypt from "bcrypt";
import { authRepository } from "../repositories/auth.repository.js";
import { userService } from "./user.service.js";
import type { RegisterSchema } from "../types/auth.types.js";
import { generateToken } from "../utils/jwt.util.js";

export const authService = {
  completeProfile: async (token: string, data: RegisterSchema) => {
    const pending = await authRepository.findPendingByToken(token);
    if (!pending) throw new Error("Invalid or expired token");

    const existing = await authRepository.findUserByEmail(pending.email);
    if (existing) throw new Error("User already registered");

    const username = `${data.firstName.toLowerCase()}_${Date.now()}`;
    const photoUrls = Array.isArray(data.photos) ? data.photos : data.photos.split(",");

    const user = await authRepository.insertUser({
      email: pending.email,
      password_hash: pending.password_hash,
      username,
      first_name: data.firstName,
      last_name: data.lastName,
      gender: data.gender.toLowerCase(),
      sexual_preferences: data.lookingFor.toLowerCase(),
      biography: data.description,
      location: data.location,
      icon_url: data.iconImage,
      photo_urls: photoUrls,
    });

    // Insert user tags if provided
    if (data.curiousAbout && data.curiousAbout.length > 0) {
      await userService.assignTags(user.id, data.curiousAbout);
    }

    await authRepository.deletePending(token);
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
