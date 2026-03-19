import type { Request, Response } from "express";
import { uploadService } from "../services/upload.service.js";


export const createUploadUrls = async(req: Request, res: Response) => {
	const MAX_FILES = 5
	try {
	  const { fileNames } = req.body
	  if (!fileNames || !Array.isArray(fileNames)) {
		return res.status(400).json({ error: 'Invalid fileNames array' })
	  }
      const urls = await uploadService.createSignedUrls(fileNames.length)
	  res.json({ urls })
	} catch (err: any) {
	  console.error(err)
	  res.status(500).json({ error: 'Server error creating signed URLs' })
	}
}