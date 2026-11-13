import { body, param } from 'express-validator';

export const createTokenValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid queue ID format'),
  body('personName')
    .trim()
    .notEmpty()
    .withMessage('Person name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Person name must be between 1 and 100 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
];

export const tokenIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid token ID format'),
];

