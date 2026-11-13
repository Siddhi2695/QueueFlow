import { Router } from 'express';
import {
  getQueues,
  createQueue,
  getQueueById,
  updateQueue,
  deleteQueue,
  getPublicQueueDisplay,
} from '../controllers/queue.controller.js';
import { addToken, getTokensByQueue, callNext } from '../controllers/token.controller.js';
import {
  createQueueValidator,
  updateQueueValidator,
  queueIdParamValidator,
} from '../validators/queue.validator.js';
import { createTokenValidator } from '../validators/token.validator.js';
import { validateRequest } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Public route for waiting room screen displays (no sensitive data)
router.get('/:id/public', queueIdParamValidator, validateRequest, getPublicQueueDisplay);

// Protected routes (Manager only)
router.use(authenticate);

router.get('/', getQueues);
router.post('/', createQueueValidator, validateRequest, createQueue);
router.get('/:id', queueIdParamValidator, validateRequest, getQueueById);
router.put('/:id', updateQueueValidator, validateRequest, updateQueue);
router.delete('/:id', queueIdParamValidator, validateRequest, deleteQueue);

// Nested token endpoints under /api/queues/:id
router.post('/:id/tokens', createTokenValidator, validateRequest, addToken);
router.get('/:id/tokens', queueIdParamValidator, validateRequest, getTokensByQueue);
router.patch('/:id/call-next', queueIdParamValidator, validateRequest, callNext);

export default router;

