import { Router } from 'express';
import { getOverview, getTrends, getPerformance } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/overview', getOverview);
router.get('/trends', getTrends);
router.get('/performance', getPerformance);

export default router;

