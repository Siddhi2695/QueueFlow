import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Manager } from '../models/Manager.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';

const generateToken = (id: string, email: string): string => {
  const secret = process.env.JWT_SECRET || 'queueflow_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id, email }, secret, { expiresIn } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      sendError(res, 'An account with this email address already exists', 400);
      return;
    }

    const manager = await Manager.create({
      name,
      email,
      password,
    });

    const token = generateToken(manager._id.toString(), manager.email);

    sendSuccess(
      res,
      'Manager registered successfully',
      {
        manager: {
          id: manager._id,
          name: manager.name,
          email: manager.email,
          createdAt: manager.createdAt,
        },
        token,
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const manager = await Manager.findOne({ email }).select('+password');
    if (!manager) {
      sendError(res, 'Invalid email or password credentials', 401);
      return;
    }

    const isMatch = await manager.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password credentials', 401);
      return;
    }

    const token = generateToken(manager._id.toString(), manager.email);

    sendSuccess(res, 'Logged in successfully', {
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        createdAt: manager.createdAt,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.manager) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const manager = await Manager.findById(req.manager.id).select('-password');
    if (!manager) {
      sendError(res, 'Manager not found', 404);
      return;
    }

    sendSuccess(res, 'Manager profile retrieved', {
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        createdAt: manager.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.manager) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const { name, currentPassword, newPassword } = req.body;
    const manager = await Manager.findById(req.manager.id).select('+password');

    if (!manager) {
      sendError(res, 'Manager not found', 404);
      return;
    }

    if (name) {
      manager.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        sendError(res, 'Current password is required to set a new password', 400);
        return;
      }
      const isMatch = await manager.comparePassword(currentPassword);
      if (!isMatch) {
        sendError(res, 'Current password does not match', 400);
        return;
      }
      if (newPassword.length < 6) {
        sendError(res, 'New password must be at least 6 characters', 400);
        return;
      }
      manager.password = newPassword;
    }

    await manager.save();

    sendSuccess(res, 'Profile updated successfully', {
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        createdAt: manager.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

