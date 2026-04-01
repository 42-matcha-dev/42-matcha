import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import type { WithValidatedBody, WithValidatedQuery } from '../types/request.types.js'

const formatZodErrors = (error: z.ZodError) => {
  return Object.fromEntries(error.issues.map((issue) => [issue.path.join('.'), issue.message]))
}

export const validateBody =
  <T>(schema: z.ZodType<T>) =>
  <R extends Request>(req: R, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        fields: formatZodErrors(result.error)
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
      return res.status(400).json({
        error: 'Validation failed',
        fields: formatZodErrors(result.error)
      })
    }

    ;(req as WithValidatedQuery<R, T>).validatedQuery = result.data
    next()
  }
