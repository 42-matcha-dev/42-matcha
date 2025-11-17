import { userRepository } from '../repositories/user.repository.js';
import { likeRepository } from '../repositories/like.repository.js';

export const userService = {
  getProfile: async (userId: number, currentUserId?: number) => {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    // Fetch user tags
    const tags = await userRepository.findUserTags(userId);

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    // Check like status if currentUserId is provided
    let isLiked = false;
    let isMatch = false;

    if (currentUserId && currentUserId !== userId) {
      isLiked = await likeRepository.checkLikeExists(currentUserId, userId);
      if (isLiked) {
        isMatch = await likeRepository.checkMutualLike(currentUserId, userId);
      }
    }

    return { ...userWithoutPassword, tags, isLiked, isMatch };
  },

  assignTags: async (userId: number, tagIds: number[]) => {
    await userRepository.insertUserTags(userId, tagIds);
  },
};

