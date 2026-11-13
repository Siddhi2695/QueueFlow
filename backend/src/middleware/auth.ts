import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types/index.js';
import { Manager } from '../models/Manager.js';
import { sendError } from '../utils/response.js';

interface JwtPayload {
  id: string;
  email: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication token missing or malformed', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'queueflow_super_secret_jwt_key_2026';

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const manager = await Manager.findById(decoded.id).select('-password');
    if (!manager) {
      sendError(res, 'Manager account not found or has been removed', 401);
      return;
    }

    req.manager = {
      id: manager._id.toString(),
      email: manager.email,
      name: manager.name,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Session token expired. Please log in again.', 401);
      return;
    }
    sendError(res, 'Invalid authentication token', 401);
  }
};

