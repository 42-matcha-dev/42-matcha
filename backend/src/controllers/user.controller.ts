import express from 'express'
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { userService } from '../services/user.service.js'
import { emailChangeService } from '../services/change_email.service.js'
import { HttpError } from '../errors/HttpError.js'
import type {
  AuthenticatedValidatedBodyRequest,
  AuthenticatedValidatedQueryRequest
} from '../types/request.types.js'
import type { SearchUsersSchema } from '../schemas/search.schema.js'
import type { UpdateProfileSchema } from '../schemas/updateProfile.schema.js'

type Response = express.Response

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required')
    }

    const profile = await userService.getProfile(req.user.userId, req.user.userId)
    return res.status(200).json(profile)
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' })
  }
}

export const getUserById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new Error('Authentication required')
    }

    const userId = parseInt(req.params.id, 10)
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    const profile = await userService.getProfile(userId, req.user.userId)
    return res.status(200).json(profile)
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' })
    }
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' })
  }
}

export const updateCurrentUser = async (
  req: AuthenticatedValidatedBodyRequest<UpdateProfileSchema>,
  res: Response
) => {
  try {
    const userId = req.user!.userId
    const updatedUser = await userService.updateUserProfile(userId, req.body)
    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update profile'
    })
  }
}

export const updateCurrentUserEmail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { newEmail, currentPassword } = req.body
    const result = await emailChangeService.requestChange(
      req.user.userId,
      newEmail,
      currentPassword
    )
    return res.status(200).json(result)
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message })
    }
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to update email'
    })
  }
}

export const searchUsers = async (
  req: AuthenticatedValidatedQueryRequest<SearchUsersSchema>,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    // Call service
    const searchResults = await userService.searchUsers(req.user.userId, req.validatedQuery)

    return res.status(200).json(searchResults)
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ message: error.message })
    }
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Server error'
    })
  }
}
