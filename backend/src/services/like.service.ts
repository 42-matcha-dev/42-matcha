import { likeRepository } from '../repositories/like.repository.js';

export const likeService = {
  likeUser: async (likerId: number, likedId: number) => {
    // Validate user cannot like themselves
    if (likerId === likedId) {
      throw new Error('Cannot like yourself');
    }

    // Check if like already exists
    const likeExists = await likeRepository.checkLikeExists(likerId, likedId);
    if (likeExists) {
      throw new Error('Like already exists');
    }

    // Create the like
    await likeRepository.createLike(likerId, likedId);

    // Check for mutual like (match)
    const isMatch = await likeRepository.checkMutualLike(likerId, likedId);

    return {
      success: true,
      isMatch,
      message: isMatch ? 'Match! You can now start conversation' : 'Like was sent successfully',
    };
  },

  getUserLikes: async (userId: number) => {
    const likes = await likeRepository.getUserLikes(userId);
    return likes;
  },

  getLikedBy: async (userId: number) => {
    const likedBy = await likeRepository.getLikedBy(userId);
    return likedBy;
  },
};

