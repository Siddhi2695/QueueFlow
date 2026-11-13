import mongoose, { Document, Schema } from 'mongoose';
import { IQueue } from '../types/index.js';

export interface IQueueDocument extends Omit<IQueue, '_id'>, Document {}

const queueSchema = new Schema<IQueueDocument>(
  {
    name: {
      type: String,
      required: [true, 'Queue name is required'],
      trim: true,
      minlength: [2, 'Queue name must be at least 2 characters long'],
      maxlength: [100, 'Queue name cannot exceed 100 characters'],
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
      required: [true, 'Manager ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
      index: true,
    },
    nextTokenNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

queueSchema.index({ managerId: 1, name: 1 });

export const Queue = mongoose.model<IQueueDocument>('Queue', queueSchema);

