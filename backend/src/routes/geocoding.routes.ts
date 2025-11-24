import { Router } from 'express';
import { forwardGeocode, reverseGeocode } from '../controllers/geocoding.controller.js';

const router = Router();

router.get('/forward', forwardGeocode);
router.get('/reverse', reverseGeocode);

export default router;

