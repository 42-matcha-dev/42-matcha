import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import type { WithValidatedBody, WithValidatedQuery } from '../types/request.types.js'

export const validate =
  (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json(result.error.flatten())
    }

    req.body = result.data
    next()
  }

export const validateBody =
  <T>(schema: z.ZodType<T>) =>
  <R extends Request>(req: R, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        result.error.issues.map((issue) => [issue.path.join('.'), issue.message])
      )

      return res.status(400).json({
        error: 'Validation failed',
        fields: fieldErrors
      })
    }

    ;(req as WithValidatedBody<R, T>).body = result.data
    next()
  }

export const validateQuery =
  <T>(schema: z.ZodType<T>) =>
  <R extends Request>(req: R, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query || {})

    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        result.error.issues.map((issue) => [issue.path.join('.'), issue.message])
      )
      return res.status(400).json({
        error: 'Invalid query parameter',
        fields: fieldErrors
      })
    }

    ;(req as WithValidatedQuery<R, T>).validatedQuery = result.data
    next()
  }
