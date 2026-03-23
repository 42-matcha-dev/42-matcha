import { Router } from 'express';
import { uploadImage, uploadImages } from '../middleware/upload.middleware.js';
import { processAndUploadImage, uploadMultipleImages } from '../controllers/upload.controller.js';
const router = Router();

router.post('/images/avatar', uploadImage, processAndUploadImage)
router.post('/images', uploadImages, uploadMultipleImages)

export default router;
