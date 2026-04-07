
import express from 'express'
import { authService } from '../services/auth.service.js'
import { passwordResetService } from '../services/password_reset.service.js'
import { emailChangeService } from '../services/change_email.service.js'
import { HttpError } from '../errors/HttpError.js'
import { validatePasswordPolicy } from '../utils/password.util.js'

type Request = express.Request
type Response = express.Response

export const signup = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body required' })
    }
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
    await authService.signup(email, password)
    res.status(200).json({ message: 'Verification email sent' })
  } catch (err: any) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: err.message, field: 'password' })
    }
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const completeRegistration = async (req: Request, res: Response) => {
  try {
    const { token } = req.query

    const result = await authService.completeProfile(token as string, req.body)
    res.status(201).json({ message: 'User profile completed', userId: result.id })
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message })
    }
    res.status(500).json({ error: error instanceof Error ? error.message : 'Invalid input' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body required' })
    }
    const { identifier, password } = req.body
    if (!identifier || !password) return res.status(400).json({ error: 'Missing fields' })

    const { user, token } = await authService.login(identifier, password)
    res.status(200).json({ message: 'Login successful', user, token })
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message })
    }
    res.status(500).json({ error: error instanceof Error ? error.message : 'Invalid input' })
  }
}

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body required' })
    }
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })

    await passwordResetService.requestReset(email)
    res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
}

export const resetPassword = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body required' })
    }
    const { token, password } = req.body
    if (!token || !password)
      return res.status(400).json({ error: 'Token and password are required' })

    const passwordError = await validatePasswordPolicy(password)
    if (passwordError) {
      return res.status(400).json({ error: passwordError, field: 'password' })
    }

    await passwordResetService.resetPassword(token, password)
    res.status(200).json({ message: 'Password has been reset successfully' })
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message })
    }
    res.status(500).json({ error: error instanceof Error ? error.message : 'Invalid request' })
  }
}

export const confirmEmailChange = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Request body required' })
    }
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    const result = await emailChangeService.confirmChange(token)
    res.status(200).json(result)
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.message })
    }
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message })
    }
    res.status(500).json({ error: 'Server error' })
  }
}
