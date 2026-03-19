import type { Request, Response } from 'express'
import { uploadService } from '../services/upload.service.js'
import { HttpError } from '../errors/HttpError.js'

export const createUploadUrls = async (req: Request, res: Response) => {
  try {
    const { files } = req.body
    if (!files || !Array.isArray(files)) {
      return res.status(400).json({ error: 'Invalid files array' })
    }
    const urls = await uploadService.createSignedUrls(files)
    res.json({ urls })
  } catch (err) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message })
    }
    res.status(500).json({ message: 'Server error creating signed URLs' })
  }
}
