import { Router } from 'express'
import {
  signup,
  login,
  completeRegistration,
  forgotPassword,
  resetPassword,
  confirmEmailChange
} from '../controllers/auth.controller.js'
import { registerSchema } from '../schemas/auth.schema.js'
import { validate } from '../middleware/validate.middleware.js'

const router = Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/register', validate(registerSchema), completeRegistration)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/confirm-email-change', confirmEmailChange)

export default router
