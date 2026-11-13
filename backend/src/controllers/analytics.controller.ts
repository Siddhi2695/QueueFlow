import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Queue } from '../models/Queue.js';
import { Token } from '../models/Token.js';
import { QueueEvent } from '../models/QueueEvent.js';
import { sendSuccess } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';

export const getOverview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = new mongoose.Types.ObjectId(req.manager!.id);

    // Get total queues
    const totalQueues = await Queue.countDocuments({ managerId });
    const activeQueues = await Queue.countDocuments({ managerId, status: 'active' });

    // Aggregate tokens by status for this manager
    const tokenCounts = await Token.aggregate([
      { $match: { managerId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    let waitingCount = 0;
    let servingCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;

    tokenCounts.forEach((tc) => {
      if (tc._id === 'Waiting') waitingCount = tc.count;
      if (tc._id === 'Serving') servingCount = tc.count;
      if (tc._id === 'Completed') completedCount = tc.count;
      if (tc._id === 'Cancelled') cancelledCount = tc.count;
    });

    const totalTokens = waitingCount + servingCount + completedCount + cancelledCount;
    const cancellationRate = totalTokens > 0 ? Number(((cancelledCount / totalTokens) * 100).toFixed(1)) : 0;

    // Real waiting time and service duration of completed tokens
    const avgStats = await Token.aggregate([
      {
        $match: {
          managerId,
          status: 'Completed',
          waitingTime: { $exists: true, $ne: null },
          serviceDuration: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgWaitingTime: { $avg: '$waitingTime' },
          avgServiceDuration: { $avg: '$serviceDuration' },
          totalCompleted: { $sum: 1 },
        },
      },
    ]);

    const avgWaitingTime = avgStats.length > 0 ? Math.round(avgStats[0].avgWaitingTime || 0) : 0;
    const avgServiceDuration = avgStats.length > 0 ? Math.round(avgStats[0].avgServiceDuration || 0) : 0;

    sendSuccess(res, 'Analytics overview retrieved', {
      totalQueues,
      activeQueues,
      totalTokens,
      waitingCount,
      servingCount,
      completedCount,
      cancelledCount,
      cancellationRate, // percentage
      avgWaitingTime, // in seconds
      avgServiceDuration, // in seconds
    });
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = new mongoose.Types.ObjectId(req.manager!.id);
    const { period = 'week' } = req.query; // 'day' | 'week' | 'month'

    const now = new Date();
    const startDate = new Date();

    if (period === 'day') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      startDate.setDate(now.getDate() - 30);
    } else {
      // 'week' default
      startDate.setDate(now.getDate() - 7);
    }

    // 1. Daily / periodic token generation and resolution
    const tokenTrends = await Token.aggregate([
      {
        $match: {
          managerId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          generated: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. Queue length trends over time (from QueueEvents for manager's queues)
    const managerQueues = await Queue.find({ managerId }).select('_id');
    const queueIds = managerQueues.map((q) => q._id);

    const lengthEvents = await QueueEvent.find({
      queueId: { $in: queueIds },
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: 1 })
      .limit(50);

    const lengthTrends = lengthEvents.map((evt) => ({
      timestamp: evt.timestamp.toISOString(),
      timeFormatted: new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waitingCount: evt.waitingCount,
      eventType: evt.eventType,
    }));

    // 3. Hourly distribution for peak period identification
    const hourlyDistribution = await Token.aggregate([
      {
        $match: {
          managerId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedHourly = Array.from({ length: 24 }).map((_, hour) => {
      const found = hourlyDistribution.find((h) => h._id === hour);
      return {
        hour: `${String(hour).padStart(2, '0')}:00`,
        count: found ? found.count : 0,
      };
    });

    sendSuccess(res, 'Analytics trends retrieved', {
      tokenTrends,
      lengthTrends,
      hourlyDistribution: formattedHourly,
    });
  } catch (error) {
    next(error);
  }
};

export const getPerformance = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = new mongoose.Types.ObjectId(req.manager!.id);

    const queues = await Queue.find({ managerId });

    const queuePerformance = await Promise.all(
      queues.map(async (queue) => {
        const tokens = await Token.find({ queueId: queue._id });

        const totalTokens = tokens.length;
        const waiting = tokens.filter((t) => t.status === 'Waiting').length;
        const serving = tokens.filter((t) => t.status === 'Serving').length;
        const completedTokens = tokens.filter((t) => t.status === 'Completed');
        const completed = completedTokens.length;
        const cancelled = tokens.filter((t) => t.status === 'Cancelled').length;

        const totalWaitTime = completedTokens.reduce((acc, cur) => acc + (cur.waitingTime || 0), 0);
        const avgWaitTime = completed > 0 ? Math.round(totalWaitTime / completed) : 0;

        const totalServiceTime = completedTokens.reduce((acc, cur) => acc + (cur.serviceDuration || 0), 0);
        const avgServiceDuration = completed > 0 ? Math.round(totalServiceTime / completed) : 0;

        const cancellationRate = totalTokens > 0 ? Number(((cancelled / totalTokens) * 100).toFixed(1)) : 0;

        return {
          queueId: queue._id,
          queueName: queue.name,
          status: queue.status,
          totalTokens,
          waiting,
          serving,
          completed,
          cancelled,
          avgWaitTime, // seconds
          avgServiceDuration, // seconds
          cancellationRate,
        };
      })
    );

    sendSuccess(res, 'Queue performance metrics retrieved', queuePerformance);
  } catch (error) {
    next(error);
  }
};

