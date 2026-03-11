import { likeRepository } from '../repositories/like.repository.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { notificationService } from './notification.service.js';

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

    if (!isMatch) {
      // Send LIKE notification to the liked user
      await notificationService.createNotification(likedId, likerId, "LIKE", likerId);
    } else {
      const user1 = Math.min(likerId, likedId);
      const user2 = Math.max(likerId, likedId);

      let conversation = await conversationRepository.createConversation(user1, user2);
      if (!conversation) {
        conversation = await conversationRepository.getConversationByUserIds(user1, user2);
      }
      if (!conversation) {
        throw new Error('Failed to create or retrieve conversation for match');
      }
      // Notify both users of the match
      await notificationService.createNotification(likerId, likedId, "MATCH", conversation.id);
      await notificationService.createNotification(likedId, likerId, "MATCH", conversation.id);
    }


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

