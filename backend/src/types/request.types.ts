import type { Request } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'

export type ValidatedQueryRequest<T> = Request & {
  validatedQuery: T
}

export type AuthenticatedValidatedQueryRequest<T> = AuthenticatedRequest & {
  validatedQuery: T
}

export type WithValidatedQuery<R extends Request, T> = R & {
  validatedQuery: T
}
