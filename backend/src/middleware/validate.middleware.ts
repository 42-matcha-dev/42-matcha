import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export const validate =
  (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json(result.error.flatten())
    }

    req.body = result.data
    next()
  }

export const validateQuery =
  <T>(schema: z.ZodType<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query || {})
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      })
    }

    ;(req as any).validatedQuery = result.data
    next()
  }
