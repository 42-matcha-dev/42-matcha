import type { Request, Response, NextFunction } from 'express'
import multer from 'multer'

export function multerErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large. Max size is 5MB.'
      })
    }

    return res.status(400).json({
      error: err.message
    })
  }

  next(err)
}
