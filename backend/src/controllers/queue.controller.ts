import { Response, NextFunction } from 'express';
import { Queue } from '../models/Queue.js';
import { Token } from '../models/Token.js';
import { QueueEvent } from '../models/QueueEvent.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../types/index.js';
import { socketService } from '../services/socket.service.js';

export const getQueues = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const queues = await Queue.find({ managerId }).sort({ createdAt: -1 });

    // Aggregate statistics for each queue
    const queuesWithStats = await Promise.all(
      queues.map(async (queue) => {
        const waitingCount = await Token.countDocuments({ queueId: queue._id, status: 'Waiting' });
        const servingCount = await Token.countDocuments({ queueId: queue._id, status: 'Serving' });
        const completedCount = await Token.countDocuments({ queueId: queue._id, status: 'Completed' });
        const cancelledCount = await Token.countDocuments({ queueId: queue._id, status: 'Cancelled' });
        const totalCount = waitingCount + servingCount + completedCount + cancelledCount;

        // Current serving token
        const currentServing = await Token.findOne({ queueId: queue._id, status: 'Serving' });

        return {
          ...queue.toObject(),
          stats: {
            waitingCount,
            servingCount,
            completedCount,
            cancelledCount,
            totalCount,
          },
          currentServing: currentServing
            ? {
                id: currentServing._id,
                tokenNumber: currentServing.tokenNumber,
                personName: currentServing.personName,
                calledAt: currentServing.calledAt,
              }
            : null,
        };
      })
    );

    sendSuccess(res, 'Queues retrieved successfully', queuesWithStats);
  } catch (error) {
    next(error);
  }
};

export const createQueue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const { name } = req.body;

    const queue = await Queue.create({
      name,
      managerId,
      status: 'active',
      nextTokenNumber: 1,
    });

    // Record QueueEvent
    await QueueEvent.create({
      queueId: queue._id,
      eventType: 'QUEUE_CREATED',
      waitingCount: 0,
    });

    socketService.emitToManager(managerId, 'queue_created', queue);

    sendSuccess(res, 'Queue created successfully', queue, 201);
  } catch (error) {
    next(error);
  }
};

export const getQueueById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const { id } = req.params;

    const queue = await Queue.findOne({ _id: id, managerId });
    if (!queue) {
      sendError(res, 'Queue not found or you do not have permission to view it', 404);
      return;
    }

    const waitingTokens = await Token.find({ queueId: queue._id, status: 'Waiting' }).sort({ position: 1 });
    const currentServing = await Token.findOne({ queueId: queue._id, status: 'Serving' });
    const completedCount = await Token.countDocuments({ queueId: queue._id, status: 'Completed' });
    const cancelledCount = await Token.countDocuments({ queueId: queue._id, status: 'Cancelled' });

    sendSuccess(res, 'Queue details retrieved', {
      queue,
      stats: {
        waitingCount: waitingTokens.length,
        servingCount: currentServing ? 1 : 0,
        completedCount,
        cancelledCount,
        totalTokens: queue.nextTokenNumber - 1,
      },
      currentServing,
      waitingTokens,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQueue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const { id } = req.params;
    const { name, status } = req.body;

    const queue = await Queue.findOne({ _id: id, managerId });
    if (!queue) {
      sendError(res, 'Queue not found or you do not have permission to edit it', 404);
      return;
    }

    if (name) queue.name = name.trim();
    if (status) {
      queue.status = status;
      const waitingCount = await Token.countDocuments({ queueId: queue._id, status: 'Waiting' });
      await QueueEvent.create({
        queueId: queue._id,
        eventType: 'QUEUE_STATUS_CHANGED',
        waitingCount,
      });
    }

    await queue.save();

    socketService.emitToQueue(queue._id.toString(), 'queue_updated', queue);
    socketService.emitToManager(managerId, 'queue_updated', queue);

    sendSuccess(res, 'Queue updated successfully', queue);
  } catch (error) {
    next(error);
  }
};

export const deleteQueue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const id = String(req.params.id);

    const queue = await Queue.findOne({ _id: id, managerId });
    if (!queue) {
      sendError(res, 'Queue not found or you do not have permission to delete it', 404);
      return;
    }

    // Cascade delete tokens and events
    await Token.deleteMany({ queueId: queue._id });
    await QueueEvent.deleteMany({ queueId: queue._id });
    await queue.deleteOne();

    socketService.emitToQueue(id, 'queue_deleted', { id });
    socketService.emitToManager(managerId, 'queue_deleted', { id });

    sendSuccess(res, 'Queue and its associated records deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Public queue display endpoint (for public waiting room TVs / screens)
 * Does NOT expose phone numbers or manager personal info
 */
export const getPublicQueueDisplay = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const queue = await Queue.findById(id).select('name status createdAt');
    if (!queue) {
      sendError(res, 'Queue not found', 404);
      return;
    }

    const currentServing = await Token.findOne({ queueId: queue._id, status: 'Serving' })
      .select('tokenNumber personName calledAt status');

    const waitingTokens = await Token.find({ queueId: queue._id, status: 'Waiting' })
      .sort({ position: 1 })
      .limit(10)
      .select('tokenNumber personName position status createdAt');

    const waitingCount = await Token.countDocuments({ queueId: queue._id, status: 'Waiting' });

    sendSuccess(res, 'Public queue data retrieved', {
      queue: {
        id: queue._id,
        name: queue.name,
        status: queue.status,
      },
      currentServing,
      waitingTokens,
      totalWaiting: waitingCount,
    });
  } catch (error) {
    next(error);
  }
};
