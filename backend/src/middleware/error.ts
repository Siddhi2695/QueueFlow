import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('[Error Middleware]:', err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use a unique value.`;
    sendError(res, message, 409);
    return;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, `Resource not found or invalid ID format: ${err.value}`, 400);
    return;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    sendError(res, 'Validation error', 400, messages);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';

  sendError(res, message, statusCode);
};

