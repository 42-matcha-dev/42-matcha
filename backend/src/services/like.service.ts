import { likeRepository } from '../repositories/like.repository.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { notificationService } from './notification.service.js';
import { HttpError } from '../errors/HttpError.js';
import { blockRepository } from '../repositories/block.repository.js';
import { reportRepository } from '../repositories/report.repository.js';

export const likeService = {
  likeUser: async (likerId: number, likedId: number) => {
    // Validate user cannot like themselves
    if (likerId === likedId) {
      throw new HttpError(400, 'Cannot like yourself');
    }

    const [isBlocked, isBlockedBy, isReported, isReportedBy] = await Promise.all([
      blockRepository.checkBlockExists(likerId, likedId),
      blockRepository.checkBlockExists(likedId, likerId),
      reportRepository.checkReportExists(likerId, likedId),
      reportRepository.checkReportExists(likedId, likerId),
    ]);
    
    // Block checks - separate messages
    if (isBlocked) {
      throw new HttpError(403, 'Cannot like a blocked user');
    }
    if (isBlockedBy) {
      throw new HttpError(403, 'Cannot like this user');
    }

    // Report checks - separate messages
    if (isReported) {
      throw new HttpError(403, 'Cannot like a reported user');
    }
    if (isReportedBy) {
      throw new HttpError(403, 'Cannot like this user');
    }

    // Check if like already exists
    const likeExists = await likeRepository.checkLikeExists(likerId, likedId);
    if (likeExists) {
      throw new HttpError(409, 'Like already exists');
    }

    // Create the like
    await likeRepository.createLike(likerId, likedId);

    // Check for mutual like (match)
    const isMatch = await likeRepository.checkMutualLike(likerId, likedId);
    let conversationId: number | null = null;
    await notificationService.deleteNotification(likerId, likedId, "UNLIKE")
    await notificationService.deleteNotification(likedId, likerId, "UNLIKE")
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
        throw new HttpError(500, 'Failed to create or retrieve conversation for match');
      }

      conversationId = conversation.id;
      // Notify both users of the match
      await notificationService.createNotification(likerId, likedId, "MATCH", conversation.id);
      await notificationService.createNotification(likedId, likerId, "MATCH", conversation.id);
    }


    return {
      success: true,
      isMatch,
      conversationId,
      message: isMatch ? 'Match! You can now start conversation' : 'Like was sent successfully',
    };
  },

  deleteLike: async (likerId: number, likedId: number) => {
    if (likerId === likedId) {
      throw new HttpError(400, 'Cannot unlike yourself');
    }
    const wasMatch = await likeRepository.checkMutualLike(likerId, likedId);
    const deleted = await likeRepository.deleteLike(likerId, likedId);
    if (!deleted) {
      throw new HttpError(404, "Like does not exist");
    }
    await notificationService.deleteNotification(likedId, likerId, "LIKE");
    await notificationService.deleteNotification(likerId, likedId, "MATCH");
    await notificationService.deleteNotification(likedId, likerId, "MATCH");
    if (wasMatch) {
      await conversationRepository.removeConversation(likerId, likedId);
      await likeRepository.deleteLike(likedId, likerId)
      await notificationService.createNotification(likedId, likerId, "UNLIKE", likerId);
    }

    return {
      success: true,
      isMatch: false,
      message: wasMatch ? 'Match broken' : 'Like removed',
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

