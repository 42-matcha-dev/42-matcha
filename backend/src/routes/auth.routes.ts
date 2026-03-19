import { Router } from 'express';
import { signup, login, completeRegistration, forgotPassword, resetPassword } from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/register', completeRegistration);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
