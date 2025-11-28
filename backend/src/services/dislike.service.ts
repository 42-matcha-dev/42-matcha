import { dislikeRepository } from '../repositories/dislike.repository.js';

export const dislikeService = {
  dislikeUser: async (dislikerId: number, dislikedId: number) => {
    // Validate user cannot dislike themselves
    if (dislikerId === dislikedId) {
      throw new Error('Cannot dislike yourself');
    }

    // Check if dislike already exists
    const dislikeExists = await dislikeRepository.checkDislikeExists(dislikerId, dislikedId);
    if (dislikeExists) {
      throw new Error('User is already disliked');
    }

    // Create the dislike
    await dislikeRepository.createDislike(dislikerId, dislikedId);

    return {
      success: true,
      message: 'User disliked successfully',
    };
  },

  undislikeUser: async (dislikerId: number, dislikedId: number) => {
    // Validate user cannot undislike themselves
    if (dislikerId === dislikedId) {
      throw new Error('Invalid operation');
    }

    // Check if dislike exists
    const dislikeExists = await dislikeRepository.checkDislikeExists(dislikerId, dislikedId);
    if (!dislikeExists) {
      throw new Error('User is not disliked');
    }

    // Remove the dislike
    await dislikeRepository.removeDislike(dislikerId, dislikedId);

    return {
      success: true,
      message: 'User undisliked successfully',
    };
  },

  getDislikedUsers: async (userId: number) => {
    const dislikedUsers = await dislikeRepository.getDislikedUsers(userId);
    return dislikedUsers;
  },

  getDislikedBy: async (userId: number) => {
    const dislikedBy = await dislikeRepository.getDislikedBy(userId);
    return dislikedBy;
  },
};

