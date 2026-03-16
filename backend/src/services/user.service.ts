import { userRepository } from '../repositories/user.repository.js'
import { likeRepository } from '../repositories/like.repository.js'
import { blockRepository } from '../repositories/block.repository.js'
import { reportRepository } from '../repositories/report.repository.js'
import { conversationRepository } from '../repositories/conversation.repository.js'
import { notificationService } from './notification.service.js'
import type { UpdateUserProfileDTO } from '../dto/user.dto.js'

export const userService = {
  getProfile: async (userId: number, currentUserId: number) => {
    const user = await userRepository.findUserById(userId, currentUserId)
    if (!user) throw new Error('User not found')

    // Fetch user tags
    const tags = await userRepository.findUserTags(userId)

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user

    // Check like status if currentUserId is provided
    let isLiked = false
    let isMatch = false
    let isBlocked = false
    let isReported = false
    let conversationId: number | null = null

    if (currentUserId && currentUserId !== userId) {
      const [liked, blocked, reported] = await Promise.all([
        likeRepository.checkLikeExists(currentUserId, userId),
        blockRepository.checkBlockExists(currentUserId, userId),
        reportRepository.checkReportExists(currentUserId, userId),
      ])
      isLiked = liked
      isBlocked = blocked
      isReported = reported
      if (isLiked) {
        isMatch = await likeRepository.checkMutualLike(currentUserId, userId)
      }
      if (isBlocked || isReported) {
        isMatch = false
        isLiked = false
      }
      if (isMatch) {
        const u1 = Math.min(currentUserId, userId)
        const u2 = Math.max(currentUserId, userId)
        const conv = await conversationRepository.getConversationByUserIds(u1, u2)
        conversationId = conv?.id ?? null
      }
      await notificationService.createNotification(userId, currentUserId, "VIEW", currentUserId)
    }

    return { ...userWithoutPassword, tags, isLiked, isMatch, isBlocked, isReported, conversationId }
  },

  updateUserProfile: async (userId: number, data: UpdateUserProfileDTO) => {
    return userRepository.updateUserProfile(userId, data);
  },

  assignTags: async (userId: number, tagIds: number[]) => {
    await userRepository.insertUserTags(userId, tagIds)
  },

  searchUsers: async (
    currentUserId: number,
    params: {
      ageMin?: number
      ageMax?: number
      distanceMax?: number
      fameMin?: number
      fameMax?: number
      tagIds?: number[]
      page?: number
      limit?: number
      sortBy?: string
      order?: string
    }
  ) => {
    // Set defaults only for pagination
    const page = params.page !== undefined ? Math.max(0, params.page) : 0
    const limit = params.limit !== undefined ? Math.max(1, Math.min(100, params.limit)) : 20

    // Validate sort parameters
    const validSortFields = ['age', 'distance', 'fame', 'tags']
    const validOrder = ['asc', 'desc']

    if (params.sortBy && !validSortFields.includes(params.sortBy)) {
      throw new Error(`Invalid sortBy parameter. Must be one of: ${validSortFields.join(', ')}`)
    }

    if (params.order && !validOrder.includes(params.order)) {
      throw new Error(`Invalid order parameter. Must be one of: ${validOrder.join(', ')}`)
    }

    // Validate age range only if both are provided
    if (params.ageMin !== undefined && params.ageMax !== undefined) {
      if (params.ageMin > params.ageMax) {
        throw new Error('ageMin must be less than or equal to ageMax')
      }
    }

    // Validate fame range only if both are provided
    if (params.fameMin !== undefined && params.fameMax !== undefined) {
      if (params.fameMin > params.fameMax) {
        throw new Error('fameMin must be less than or equal to fameMax')
      }
    }

    // Validate distanceMax if provided
    if (params.distanceMax !== undefined && params.distanceMax < 0) {
      throw new Error('distanceMax must be greater than or equal to 0')
    }

    // Pass through undefined values - filters will be excluded if not provided
    return await userRepository.searchUsers(currentUserId, {
      ageMin: params.ageMin,
      ageMax: params.ageMax,
      distanceMax: params.distanceMax,
      fameMin: params.fameMin,
      fameMax: params.fameMax,
      tagIds: params.tagIds && params.tagIds.length > 0 ? params.tagIds : undefined,
      page,
      limit,
      sortBy: params.sortBy,
      order: params.order
    })
  }
}
