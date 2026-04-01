import { Router } from 'express'
import {
  getProfile,
  getUserById,
  searchUsers,
  updateCurrentUser,
  updateCurrentUserEmail
} from '../controllers/user.controller.js'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { validateBody, validateQuery } from '../middleware/validate.middleware.js'
import { searchUsersShema } from '../schemas/search.schema.js'
import { updateProfileSchema } from '../schemas/updateProfile.schema.js'

const router = Router()

router.get('/me', authenticateToken, getProfile)
router.patch('/me', authenticateToken, validateBody(updateProfileSchema), updateCurrentUser)
router.patch('/me/email', authenticateToken, updateCurrentUserEmail)
router.get('/search', authenticateToken, validateQuery(searchUsersShema), searchUsers)
router.get('/:id', authenticateToken, getUserById)

export default router
