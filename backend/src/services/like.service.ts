import { likeRepository } from '../repositories/like.repository.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { notificationService } from './notification.service.js';
import { fameRatingService } from './fameRating.service.js';
import { HttpError } from '../errors/HttpError.js';
import { blockRepository } from '../repositories/block.repository.js';
import { reportRepository } from '../repositories/report.repository.js';
import pool from '../database/init.js';

export const likeService = {
  likeUser: async (likerId: number, likedId: number) => {
    // Validate user cannot like themselves
    if (likerId === likedId) {
      throw new HttpError(400, 'Cannot like yourself');
    }

    const [likerRow, isBlocked, isBlockedBy, isReported, isReportedBy] = await Promise.all([
      pool.query('SELECT icon_url FROM users WHERE id = $1', [likerId]),
      blockRepository.checkBlockExists(likerId, likedId),
      blockRepository.checkBlockExists(likedId, likerId),
      reportRepository.checkReportExists(likerId, likedId),
      reportRepository.checkReportExists(likedId, likerId),
    ]);

    if (!likerRow.rows[0]?.icon_url) {
      throw new HttpError(403, 'You must have a profile picture to like someone');
    }
    
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

    // Clear any stale UNLIKE from a previous unlike cycle (both directions)
    await notificationService.deleteNotification(likedId, likerId, "UNLIKE");
    await notificationService.deleteNotification(likerId, likedId, "UNLIKE");

    // Check for mutual like (match)
    const isMatch = await likeRepository.checkMutualLike(likerId, likedId);
    let conversationId: number | null = null;

    if (!isMatch) {
      // Send LIKE notification to the liked user
      await notificationService.createNotification(likedId, likerId, "LIKE", likerId);
    } else {
      // Clear the old LIKE notification (now superseded by MATCH)
      await notificationService.deleteNotification(likerId, likedId, "LIKE");

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


    fameRatingService.refresh().catch(err =>
      console.error('❌ Fame rating refresh failed after like:', err)
    )

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
      await likeRepository.deleteLike(likedId, likerId);
      await conversationRepository.removeConversation(likerId, likedId);
      await notificationService.createNotification(likedId, likerId, "UNLIKE", likerId);
    }

    fameRatingService.refresh().catch(err =>
      console.error('❌ Fame rating refresh failed after unlike:', err)
    )

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

