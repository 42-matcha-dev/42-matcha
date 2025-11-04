import { Router } from 'express';
import { signup, login, completeRegistration } from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/register', completeRegistration);

export default router;
