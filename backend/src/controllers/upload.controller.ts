import type { Request, Response } from 'express'
import { uploadService } from '../services/upload.service.js'
import { HttpError } from '../errors/HttpError.js'

export const processAndUploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }
    const url = await uploadService.processAndUploadImage(req.file.buffer)
    res.status(201).json({ url })
  } catch (err: any) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message })
    }

    res.status(500).json({ message: 'Internal server error' })
  }
}

export const uploadMultipleImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const files = req.files as Express.Multer.File[];
    const urls = await uploadService.processMultipleImages(files);
    res.status(201).json({ urls })
  } catch (err: any) {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ message: err.message })
    }

    res.status(500).json({ message: 'Internal server error' })
  } 
}