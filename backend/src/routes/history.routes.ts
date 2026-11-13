import { Router } from 'express';
import { getHistory } from '../controllers/history.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getHistory);

export default router;

