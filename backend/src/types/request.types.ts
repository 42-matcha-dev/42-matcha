import type { Request } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js'

export type AuthenticatedValidatedBodyRequest<T> = AuthenticatedRequest & {
  body: T
}

export type WithValidatedBody<R extends Request, T> = R & {
  body: T
}

export type ValidatedQueryRequest<T> = Request & {
  validatedQuery: T
}

export type AuthenticatedValidatedQueryRequest<T> = AuthenticatedRequest & {
  validatedQuery: T
}

export type WithValidatedQuery<R extends Request, T> = R & {
  validatedQuery: T
}
