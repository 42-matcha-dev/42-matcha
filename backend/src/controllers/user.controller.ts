import express from 'express'
import { type AuthenticatedRequest } from '../middleware/auth.middleware.js'
import { userService } from '../services/user.service.js'
import { emailChangeService } from '../services/change_email.service.js'
import { HttpError } from '../errors/HttpError.js'

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

export const updateCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const updatedUser = await userService.updateUserProfile(userId, req.body)
    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to update profile"
    })
  }
}

export const updateCurrentUserEmail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { newEmail, currentPassword } = req.body
    const result = await emailChangeService.requestChange(req.user.userId, newEmail, currentPassword)
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

export const searchUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Helper to parse a number safely
    const parseNumber = (value: any): number | undefined => {
      if (value === undefined) return undefined
      const num = Number(value)
      return isNaN(num) ? undefined : num
    }

    // Extract params
    const ageMin = parseNumber(req.query.ageMin)
    const ageMax = parseNumber(req.query.ageMax)
    const distanceMax = parseNumber(req.query.distanceMax)
    const fameMin = parseNumber(req.query.fameMin)
    const fameMax = parseNumber(req.query.fameMax)
    const page = parseNumber(req.query.page)
    const limit = parseNumber(req.query.limit)

    let sortBy: string | undefined = undefined
    let order: string | undefined = undefined

    if (typeof req.query.sortBy === 'string') {
      switch (req.query.sortBy) {
        case 'distance-asc':
          sortBy = 'distance'
          order = 'asc'
          break
        case 'fame-desc':
          sortBy = 'fame'
          order = 'desc'
          break
        case 'age-asc':
          sortBy = 'age'
          order = 'asc'
          break
        case 'age-desc':
          sortBy = 'age'
          order = 'desc'
          break
        case 'common-desc':
          sortBy = 'tags'
          order = 'desc'
          break
      }
    }

    // Validate ranges
    if (page !== undefined && page < 0) {
      return res.status(400).json({ error: 'Invalid page parameter' })
    }

    if (limit !== undefined && limit < 1) {
      return res.status(400).json({ error: 'Invalid limit parameter' })
    }

    if (distanceMax !== undefined && distanceMax < 0) {
      return res.status(400).json({ error: 'Invalid distanceMax parameter' })
    }

    // Parse tag list (comma-separated)
    let tagIds: number[] | undefined = undefined
    if (typeof req.query.tags === 'string') {
      tagIds = req.query.tags
        .split(',')
        .map((v) => Number(v.trim()))
        .filter((v) => !isNaN(v))

      if (tagIds.length === 0) tagIds = undefined
    }

    // Call service
    const searchResults = await userService.searchUsers(req.user.userId, {
      ageMin,
      ageMax,
      distanceMax,
      fameMin,
      fameMax,
      tagIds,
      page,
      limit,
      sortBy,
      order
    })

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
