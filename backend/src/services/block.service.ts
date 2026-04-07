import { blockRepository } from '../repositories/block.repository.js';
import { likeRepository } from '../repositories/like.repository.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { reportRepository } from '../repositories/report.repository.js';
import { notificationService } from './notification.service.js';
import { fameRatingService } from './fameRating.service.js';

export const blockService = {
  blockUser: async (blockerId: number, blockedId: number) => {
    // Validate user cannot block themselves
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }

    // Check if block already exists
    const blockExists = await blockRepository.checkBlockExists(blockerId, blockedId);
    if (blockExists) {
      throw new Error('User is already blocked');
    }

    // Create the block
    await blockRepository.createBlock(blockerId, blockedId);

    // Remove likes in both directions to break any match
    await Promise.all([
      likeRepository.removeLike(blockerId, blockedId),
      likeRepository.removeLike(blockedId, blockerId),
      conversationRepository.removeConversation(blockerId, blockedId),
    ])

    // Remove notifications in both directions
    await Promise.all([
      notificationService.deleteNotification(blockerId, blockedId, "LIKE"),
      notificationService.deleteNotification(blockedId, blockerId, "LIKE"),
      notificationService.deleteNotification(blockerId, blockedId, "MATCH"),
      notificationService.deleteNotification(blockedId, blockerId, "MATCH"),
      notificationService.deleteNotification(blockerId, blockedId, "VIEW"),
      notificationService.deleteNotification(blockedId, blockerId, "VIEW"),
      notificationService.deleteNotification(blockerId, blockedId, "UNLIKE"),
      notificationService.deleteNotification(blockedId, blockerId, "UNLIKE"),
    ]);

    fameRatingService.refresh().catch(err =>
      console.error('❌ Fame rating refresh failed after block:', err)
    )

    return {
      success: true,
      message: 'User blocked successfully',
    };
  },

  unblockUser: async (blockerId: number, blockedId: number) => {
    // Validate user cannot unblock themselves
    if (blockerId === blockedId) {
      throw new Error('Invalid operation');
    }

    // Check if block exists
    const blockExists = await blockRepository.checkBlockExists(blockerId, blockedId);
    if (!blockExists) {
      throw new Error('User is not blocked');
    }

    // const isReported = await reportRepository.isReported(blockerId, blockedId);
    const blockerReportedBlocked = await reportRepository.checkReportExists(blockerId, blockedId);
    if (blockerReportedBlocked) {
      throw new Error('Cannot unblock a reported user');
    }
    
    // Remove the block
    await blockRepository.removeBlock(blockerId, blockedId);

    return {
      success: true,
      message: 'User unblocked successfully',
    };
  },

  getBlockedUsers: async (userId: number) => {
    const blockedUsers = await blockRepository.getBlockedUsers(userId);
    return blockedUsers;
  },

  getBlockedBy: async (userId: number) => {
    const blockedBy = await blockRepository.getBlockedBy(userId);
    return blockedBy;
  },
};

