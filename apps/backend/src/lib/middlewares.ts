import { StaticOrigin } from '@/lib/types.ts'
import { AppError } from '@/lib/utility-classes.ts'
// import {
// Public routes are disabled for now
// PUBLIC_ROUTES,
// } from "@/settings.ts";
import { Session } from '@/user/user.types.ts'
import type { NextFunction, Request, Response } from 'express'
import { ZodError, type AnyZodObject } from 'zod'
import * as AuthService from '@/user/user.service.ts'

// Public routes are disabled for now
// const routeIsPublic = (route: string) => PUBLIC_ROUTES.includes(route);

export const authorization = (
  req: Request<unknown>,
  res: Response,
  next: NextFunction
) => {
  res.session = {
    userId: null
  }

  if (req.method === 'OPTIONS') {
    res.send({ message: 'Preflight checked successfully.' })
    return
  }

  if (!process.env.JWT_SECRET_KEY) {
    return next(new AppError('unauthorized', 'JWT secret key is not defined.'))
  }

  // Public routes are disabled for now
  // if (routeIsPublic(req.path)) {
  //   return next();
  // }

  if (!req.headers.authorization) {
    return next(
      new AppError('unauthorized', '`Authorization` header is required.')
    )
  }

  if (!req.headers.authorization.startsWith('Bearer ')) {
    return next(new AppError('unauthorized', 'Invalid access token.'))
  }

  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    return next(new AppError('unauthorized', 'Invalid access token.'))
  }

  try {
    const data = AuthService.validateJWT(token) as Session['userId']

    res.session.userId = data
    next()
  } catch {
    return next(new AppError('forbidden', 'Token expired or invalid.'))
  }
}

export const originResolver = (
  allowedOrigins: string[],
  origin: string | undefined,
  callback: (err: Error | null, origin?: StaticOrigin) => void
) => {
  if (allowedOrigins.includes(origin as string)) {
    callback(null, true)
  } else if (!origin) {
    return callback(null, true)
  }

  return callback(new AppError('badRequest', 'Not allowed by CORS'))
}

export const errorFallback = (
  err: Error,
  _: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  res.status('statusCode' in err ? (err.statusCode as number) : 500).json({
    message: err instanceof AppError ? err.message : 'Internal Server Error'
  })
}

export const validate =
  (schema: AnyZodObject) =>
    async (req: Request<unknown>, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params
        })

        return next()
      } catch (err) {
        if (err instanceof ZodError) {
          const invalids = err.issues.map((issue) => issue.path.pop())
          next(
            new AppError(
              'validation',
            `Invalid or missing input${
              invalids.length > 1 ? 's' : ''
            } provided for: ${invalids.join(', ')}`
            )
          )
        } else {
          next(new AppError('validation', 'Invalid input'))
        }
      }
    }
