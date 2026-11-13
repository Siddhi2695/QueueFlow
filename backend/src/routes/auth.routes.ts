import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;

