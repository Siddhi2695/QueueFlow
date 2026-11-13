import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '../utils/response.js';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: (err as any).path || (err as any).param,
      message: err.msg,
    }));
    sendError(res, 'Validation failed. Please check your input.', 422, extractedErrors);
    return;
  }
  next();
};

