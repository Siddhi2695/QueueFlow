import { Router } from 'express';
import {
  moveUp,
  moveDown,
  completeService,
  cancelToken,
} from '../controllers/token.controller.js';
import { tokenIdParamValidator } from '../validators/token.validator.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.patch('/:id/move-up', tokenIdParamValidator, validateRequest, moveUp);
router.patch('/:id/move-down', tokenIdParamValidator, validateRequest, moveDown);
router.patch('/:id/complete', tokenIdParamValidator, validateRequest, completeService);
router.patch('/:id/cancel', tokenIdParamValidator, validateRequest, cancelToken);

export default router;

