import { Router } from 'express';
import { signup, signin, verifyEmail } from '../controllers/auth.controller.ts';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/verify', verifyEmail);

export default router;
