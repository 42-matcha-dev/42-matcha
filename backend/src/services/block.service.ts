import { blockRepository } from '../repositories/block.repository.js';

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

