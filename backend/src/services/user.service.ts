import { userRepository } from '../repositories/user.repository.js'
import { likeRepository } from '../repositories/like.repository.js'
import { blockRepository } from '../repositories/block.repository.js'
import { reportRepository } from '../repositories/report.repository.js'
import { conversationRepository } from '../repositories/conversation.repository.js'
import { notificationService } from './notification.service.js'
import { HttpError } from '../errors/HttpError.js'
import type { SearchUsersSchema } from '../schemas/search.schema.js'
import type { UpdateProfileSchema } from '../schemas/updateProfile.schema.js'

export const userService = {
  getProfile: async (userId: number, currentUserId: number) => {
    const user = await userRepository.findUserById(userId, currentUserId)
    if (!user) throw new Error('User not found')

    // Fetch user tags
    const tags = await userRepository.findUserTags(userId)

    // Check like status if currentUserId is provided
    let isLiked = false
    let hasLikedMe = false
    let isMatch = false
    let isBlocked = false
    let isReported = false
    let conversationId: number | null = null

    if (currentUserId && currentUserId !== userId) {
      const [liked, likeBack, blocked, reported] = await Promise.all([
        likeRepository.checkLikeExists(currentUserId, userId),
        likeRepository.checkLikeExists(userId, currentUserId),
        blockRepository.checkBlockExists(currentUserId, userId),
        reportRepository.checkReportExists(currentUserId, userId)
      ])
      isLiked = liked
      hasLikedMe = likeBack
      isBlocked = blocked
      isReported = reported
      isMatch = isLiked && hasLikedMe
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
      await notificationService.createNotification(userId, currentUserId, 'VIEW', currentUserId)
    }

    return { ...user, tags, isLiked, hasLikedMe, isMatch, isBlocked, isReported, conversationId }
  },

  updateUserProfile: async (userId: number, data: UpdateProfileSchema) => {
    if (data.username) {
      data.username = data.username.toLowerCase()
      const taken = await userRepository.usernameExistsForOther(data.username, userId)
      if (taken) throw new HttpError(409, 'Username is already taken')
    }
    await userRepository.updateUserTags(userId, data.curiousAbout ?? [])
    return userRepository.updateUserProfile(userId, data)
  },

  assignTags: async (userId: number, tagIds: number[]) => {
    await userRepository.insertUserTags(userId, tagIds)
  },

  searchUsers: async (currentUserId: number, data: SearchUsersSchema) => {
    try {
      const result = await userRepository.searchUsers(currentUserId, data)
      return result
    } catch (err) {
      throw new HttpError(500, 'Failed to search users')
    }
  }
}
