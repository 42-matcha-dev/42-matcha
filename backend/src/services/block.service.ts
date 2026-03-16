import { blockRepository } from '../repositories/block.repository.js';
import { likeRepository } from '../repositories/like.repository.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { reportRepository } from '../repositories/report.repository.js';
import { notificationService } from './notification.service.js';

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
      notificationService.deleteByActorAndType(blockerId, blockedId, "LIKE"),
      notificationService.deleteByActorAndType(blockedId, blockerId, "LIKE"),
      notificationService.deleteByActorAndType(blockerId, blockedId, "MATCH"),
      notificationService.deleteByActorAndType(blockedId, blockerId, "MATCH"),
      notificationService.deleteByActorAndType(blockerId, blockedId, "VIEW"),
      notificationService.deleteByActorAndType(blockedId, blockerId, "VIEW"),
    ]);

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

    const isReported = await reportRepository.isReported(blockerId, blockedId);
    if (isReported) {
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

