import { Response, NextFunction } from 'express';
import { Token } from '../models/Token.js';
import { sendSuccess } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';

export const getHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const {
      search,
      status,
      queueId,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { managerId };

    if (queueId) {
      filter.queueId = queueId;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      filter.$or = [
        { tokenNumber: searchRegex },
        { personName: searchRegex },
        { phoneNumber: searchRegex },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const [tokens, totalCount] = await Promise.all([
      Token.find(filter)
        .populate('queueId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Token.countDocuments(filter),
    ]);

    const formattedTokens = tokens.map((t) => {
      const obj = t.toObject() as any;
      return {
        ...obj,
        queueName: obj.queueId?.name || 'Unknown Queue',
      };
    });

    sendSuccess(res, 'Queue history retrieved successfully', {
      tokens: formattedTokens,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

