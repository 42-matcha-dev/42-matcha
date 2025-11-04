import { userRepository } from '../repositories/user.repository.js';

export const userService = {
  getProfile: async (userId: number) => {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};

