import { Request } from 'express';
import { Types } from 'mongoose';

export interface IManager {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type QueueStatus = 'active' | 'closed';

export interface IQueue {
  _id: Types.ObjectId;
  name: string;
  managerId: Types.ObjectId;
  status: QueueStatus;
  nextTokenNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TokenStatus = 'Waiting' | 'Serving' | 'Completed' | 'Cancelled';

export interface IToken {
  _id: Types.ObjectId;
  tokenNumber: string;
  personName: string;
  phoneNumber?: string;
  queueId: Types.ObjectId;
  managerId: Types.ObjectId;
  position: number | null;
  status: TokenStatus;
  createdAt: Date;
  calledAt?: Date | null;
  completedAt?: Date | null;
  waitingTime?: number | null; // in seconds
  serviceDuration?: number | null; // in seconds
  updatedAt?: Date;
}

export type QueueEventType = 
  | 'TOKEN_ADDED'
  | 'TOKEN_CALLED'
  | 'TOKEN_COMPLETED'
  | 'TOKEN_CANCELLED'
  | 'POSITION_CHANGED'
  | 'QUEUE_CREATED'
  | 'QUEUE_STATUS_CHANGED';

export interface IQueueEvent {
  _id: Types.ObjectId;
  queueId: Types.ObjectId;
  eventType: QueueEventType;
  tokenId?: Types.ObjectId;
  waitingCount: number;
  timestamp: Date;
}

export interface AuthRequest extends Request {
  manager?: {
    id: string;
    email: string;
    name: string;
  };
}

