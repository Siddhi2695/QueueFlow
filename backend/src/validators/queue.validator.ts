import { body, param } from 'express-validator';

export const createQueueValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Queue name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Queue name must be between 2 and 100 characters'),
];

export const updateQueueValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid queue ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Queue name must be between 2 and 100 characters'),
  body('status')
    .optional()
    .isIn(['active', 'closed'])
    .withMessage('Status must be either active or closed'),
];

export const queueIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid queue ID format'),
];

