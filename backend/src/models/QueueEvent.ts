import mongoose, { Document, Schema } from 'mongoose';
import { IQueueEvent, QueueEventType } from '../types/index.js';

export interface IQueueEventDocument extends Omit<IQueueEvent, '_id'>, Document {}

const queueEventSchema = new Schema<IQueueEventDocument>(
  {
    queueId: {
      type: Schema.Types.ObjectId,
      ref: 'Queue',
      required: [true, 'Queue ID is required'],
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'TOKEN_ADDED',
        'TOKEN_CALLED',
        'TOKEN_COMPLETED',
        'TOKEN_CANCELLED',
        'POSITION_CHANGED',
        'QUEUE_CREATED',
        'QUEUE_STATUS_CHANGED',
      ],
      required: [true, 'Event type is required'],
      index: true,
    },
    tokenId: {
      type: Schema.Types.ObjectId,
      ref: 'Token',
      default: null,
    },
    waitingCount: {
      type: Number,
      required: true,
      min: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

queueEventSchema.index({ queueId: 1, timestamp: -1 });

export const QueueEvent = mongoose.model<IQueueEventDocument>('QueueEvent', queueEventSchema);

