import { Router } from 'express';
import { forwardGeocode, reverseGeocode } from '../controllers/geocoding.controller.js';
import { geocodeRateLimiter } from '../middleware/notification.middleware.js';

const router = Router();

router.get('/forward', geocodeRateLimiter, forwardGeocode);
router.get('/reverse', geocodeRateLimiter, reverseGeocode);

export default router;

