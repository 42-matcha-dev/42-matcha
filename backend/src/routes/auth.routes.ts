import { Router } from 'express';
import { signup, signin, completeRegistration } from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/register', completeRegistration);

export default router;
