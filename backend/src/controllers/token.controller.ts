import { Response, NextFunction } from 'express';
import { Queue } from '../models/Queue.js';
import { Token } from '../models/Token.js';
import { QueueEvent } from '../models/QueueEvent.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { formatTokenNumber } from '../utils/tokenFormatter.js';
import { AuthRequest } from '../types/index.js';
import { socketService } from '../services/socket.service.js';

export const addToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const queueId = String(req.params.id);
    const { personName, phoneNumber } = req.body;

    // Verify queue ownership
    const queue = await Queue.findOne({ _id: queueId, managerId });
    if (!queue) {
      sendError(res, 'Queue not found or you do not have permission', 404);
      return;
    }

    if (queue.status !== 'active') {
      sendError(res, 'Cannot add people to an inactive or closed queue', 400);
      return;
    }

    // Atomic fetch-and-increment nextTokenNumber
    const updatedQueue = await Queue.findByIdAndUpdate(
      queueId,
      { $inc: { nextTokenNumber: 1 } },
      { new: false } // returns document before update
    );

    const tokenSeq = updatedQueue ? updatedQueue.nextTokenNumber : 1;
    const tokenNumber = formatTokenNumber(tokenSeq);

    // Calculate next available waiting position
    const currentWaitingCount = await Token.countDocuments({ queueId, status: 'Waiting' });
    const nextPosition = currentWaitingCount + 1;

    const token = await Token.create({
      tokenNumber,
      personName,
      phoneNumber: phoneNumber || '',
      queueId,
      managerId,
      position: nextPosition,
      status: 'Waiting',
    });

    const newWaitingCount = currentWaitingCount + 1;

    // Record QueueEvent
    await QueueEvent.create({
      queueId,
      eventType: 'TOKEN_ADDED',
      tokenId: token._id,
      waitingCount: newWaitingCount,
    });

    socketService.emitToQueue(queueId, 'token_added', { token, waitingCount: newWaitingCount });
    socketService.emitToManager(managerId, 'queue_stats_updated', { queueId });

    sendSuccess(res, `Token ${tokenNumber} generated successfully`, token, 201);
  } catch (error) {
    next(error);
  }
};

export const getTokensByQueue = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const queueId = String(req.params.id);

    const queue = await Queue.findOne({ _id: queueId, managerId });
    if (!queue) {
      sendError(res, 'Queue not found or unauthorized', 404);
      return;
    }

    const { status } = req.query;
    const filter: any = { queueId };
    if (status) {
      filter.status = status;
    }

    const tokens = await Token.find(filter).sort({
      status: 1, // Serving first if filtered
      position: 1, // Waiting in order
      createdAt: -1,
    });

    sendSuccess(res, 'Tokens retrieved successfully', tokens);
  } catch (error) {
    next(error);
  }
};

export const moveUp = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const tokenId = String(req.params.id);

    const token = await Token.findOne({ _id: tokenId, managerId });
    if (!token) {
      sendError(res, 'Token not found or unauthorized', 404);
      return;
    }

    if (token.status !== 'Waiting') {
      sendError(res, 'Only waiting tokens can be moved in the queue', 400);
      return;
    }

    const currentPos = token.position;
    if (!currentPos || currentPos <= 1) {
      sendError(res, 'Token is already at the first position in the queue', 400);
      return;
    }

    const targetPos = currentPos - 1;

    // Find the token currently occupying targetPos
    const prevToken = await Token.findOne({
      queueId: token.queueId,
      status: 'Waiting',
      position: targetPos,
    });

    if (prevToken) {
      // Swap positions
      prevToken.position = currentPos;
      token.position = targetPos;

      await prevToken.save();
      await token.save();
    } else {
      token.position = targetPos;
      await token.save();
    }

    const waitingCount = await Token.countDocuments({ queueId: token.queueId, status: 'Waiting' });
    await QueueEvent.create({
      queueId: token.queueId,
      eventType: 'POSITION_CHANGED',
      tokenId: token._id,
      waitingCount,
    });

    socketService.emitToQueue(token.queueId.toString(), 'token_moved', {
      tokenId: token._id,
      direction: 'up',
    });

    sendSuccess(res, `Token ${token.tokenNumber} moved up to position ${targetPos}`, token);
  } catch (error) {
    next(error);
  }
};

export const moveDown = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const tokenId = String(req.params.id);

    const token = await Token.findOne({ _id: tokenId, managerId });
    if (!token) {
      sendError(res, 'Token not found or unauthorized', 404);
      return;
    }

    if (token.status !== 'Waiting') {
      sendError(res, 'Only waiting tokens can be moved in the queue', 400);
      return;
    }

    const currentPos = token.position;
    if (!currentPos) {
      sendError(res, 'Invalid token position', 400);
      return;
    }

    const maxPos = await Token.countDocuments({ queueId: token.queueId, status: 'Waiting' });
    if (currentPos >= maxPos) {
      sendError(res, 'Token is already at the last position in the queue', 400);
      return;
    }

    const targetPos = currentPos + 1;

    // Find the token currently occupying targetPos
    const nextToken = await Token.findOne({
      queueId: token.queueId,
      status: 'Waiting',
      position: targetPos,
    });

    if (nextToken) {
      // Swap positions
      nextToken.position = currentPos;
      token.position = targetPos;

      await nextToken.save();
      await token.save();
    } else {
      token.position = targetPos;
      await token.save();
    }

    const waitingCount = await Token.countDocuments({ queueId: token.queueId, status: 'Waiting' });
    await QueueEvent.create({
      queueId: token.queueId,
      eventType: 'POSITION_CHANGED',
      tokenId: token._id,
      waitingCount,
    });

    socketService.emitToQueue(token.queueId.toString(), 'token_moved', {
      tokenId: token._id,
      direction: 'down',
    });

    sendSuccess(res, `Token ${token.tokenNumber} moved down to position ${targetPos}`, token);
  } catch (error) {
    next(error);
  }
};

export const callNext = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const queueId = String(req.params.id);

    const queue = await Queue.findOne({ _id: queueId, managerId });
    if (!queue) {
      sendError(res, 'Queue not found or unauthorized', 404);
      return;
    }

    if (queue.status !== 'active') {
      sendError(res, 'Cannot call tokens in an inactive or closed queue', 400);
      return;
    }

    // Rule: Only one token per queue can be in Serving status at a time
    const existingServing = await Token.findOne({ queueId, status: 'Serving' });
    if (existingServing) {
      sendError(
        res,
        `Token ${existingServing.tokenNumber} (${existingServing.personName}) is currently being served. Please complete this service before calling the next person.`,
        400
      );
      return;
    }

    // Find the first waiting token
    const firstWaitingToken = await Token.findOne({ queueId, status: 'Waiting' }).sort({ position: 1 });
    if (!firstWaitingToken) {
      sendError(res, 'No waiting tokens in this queue', 404);
      return;
    }

    const oldPosition = firstWaitingToken.position || 1;
    const now = new Date();
    const waitingTime = Math.max(0, Math.round((now.getTime() - firstWaitingToken.createdAt.getTime()) / 1000));

    firstWaitingToken.status = 'Serving';
    firstWaitingToken.position = null;
    firstWaitingToken.calledAt = now;
    firstWaitingToken.waitingTime = waitingTime;
    await firstWaitingToken.save();

    // Re-index remaining waiting tokens
    await Token.updateMany(
      { queueId, status: 'Waiting', position: { $gt: oldPosition } },
      { $inc: { position: -1 } }
    );

    const remainingWaiting = await Token.countDocuments({ queueId, status: 'Waiting' });

    // Record QueueEvent
    await QueueEvent.create({
      queueId,
      eventType: 'TOKEN_CALLED',
      tokenId: firstWaitingToken._id,
      waitingCount: remainingWaiting,
    });

    socketService.emitToQueue(queueId, 'token_called', {
      token: firstWaitingToken,
      waitingCount: remainingWaiting,
    });
    socketService.emitToManager(managerId, 'queue_stats_updated', { queueId });

    sendSuccess(res, `Token ${firstWaitingToken.tokenNumber} is now being served`, firstWaitingToken);
  } catch (error) {
    next(error);
  }
};

export const completeService = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const tokenId = String(req.params.id);

    const token = await Token.findOne({ _id: tokenId, managerId });
    if (!token) {
      sendError(res, 'Token not found or unauthorized', 404);
      return;
    }

    if (token.status !== 'Serving') {
      sendError(res, 'Only currently serving tokens can be marked as completed', 400);
      return;
    }

    const now = new Date();
    const serviceStartTime = token.calledAt ? token.calledAt.getTime() : token.createdAt.getTime();
    const serviceDuration = Math.max(0, Math.round((now.getTime() - serviceStartTime) / 1000));

    token.status = 'Completed';
    token.completedAt = now;
    token.serviceDuration = serviceDuration;
    await token.save();

    const waitingCount = await Token.countDocuments({ queueId: token.queueId, status: 'Waiting' });

    await QueueEvent.create({
      queueId: token.queueId,
      eventType: 'TOKEN_COMPLETED',
      tokenId: token._id,
      waitingCount,
    });

    socketService.emitToQueue(token.queueId.toString(), 'token_completed', {
      token,
      waitingCount,
    });
    socketService.emitToManager(managerId, 'queue_stats_updated', { queueId: token.queueId });

    sendSuccess(res, `Service completed for Token ${token.tokenNumber}`, token);
  } catch (error) {
    next(error);
  }
};

export const cancelToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const managerId = req.manager!.id;
    const tokenId = String(req.params.id);

    const token = await Token.findOne({ _id: tokenId, managerId });
    if (!token) {
      sendError(res, 'Token not found or unauthorized', 404);
      return;
    }

    // Rule: Serving tokens cannot be cancelled using waiting cancellation action
    if (token.status !== 'Waiting') {
      sendError(res, `Cannot cancel token in status: ${token.status}. Only waiting tokens can be cancelled.`, 400);
      return;
    }

    const oldPosition = token.position;
    token.status = 'Cancelled';
    token.position = null;
    token.completedAt = new Date();
    await token.save();

    // Re-index remaining waiting tokens
    if (oldPosition) {
      await Token.updateMany(
        { queueId: token.queueId, status: 'Waiting', position: { $gt: oldPosition } },
        { $inc: { position: -1 } }
      );
    }

    const remainingWaiting = await Token.countDocuments({ queueId: token.queueId, status: 'Waiting' });

    await QueueEvent.create({
      queueId: token.queueId,
      eventType: 'TOKEN_CANCELLED',
      tokenId: token._id,
      waitingCount: remainingWaiting,
    });

    socketService.emitToQueue(token.queueId.toString(), 'token_cancelled', {
      token,
      waitingCount: remainingWaiting,
    });
    socketService.emitToManager(managerId, 'queue_stats_updated', { queueId: token.queueId });

    sendSuccess(res, `Token ${token.tokenNumber} has been cancelled`, token);
  } catch (error) {
    next(error);
  }
};
