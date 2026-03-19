import { Router } from 'express';
import { createUploadUrls } from '../controllers/upload.controller.js';
const router = Router();

router.post('/upload-urls', createUploadUrls)

export default router;
