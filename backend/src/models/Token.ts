import mongoose, { Document, Schema } from 'mongoose';
import { IToken, TokenStatus } from '../types/index.js';

export interface ITokenDocument extends Omit<IToken, '_id'>, Document {}

const tokenSchema = new Schema<ITokenDocument>(
  {
    tokenNumber: {
      type: String,
      required: [true, 'Token number is required'],
      trim: true,
    },
    personName: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
      minlength: [1, 'Person name cannot be empty'],
      maxlength: [100, 'Person name cannot exceed 100 characters'],
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    queueId: {
      type: Schema.Types.ObjectId,
      ref: 'Queue',
      required: [true, 'Queue ID is required'],
      index: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Manager',
      required: [true, 'Manager ID is required'],
      index: true,
    },
    position: {
      type: Number,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['Waiting', 'Serving', 'Completed', 'Cancelled'],
      default: 'Waiting',
      index: true,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    waitingTime: {
      type: Number, // in seconds
      default: null,
    },
    serviceDuration: {
      type: Number, // in seconds
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate token numbers within the same queue
tokenSchema.index({ queueId: 1, tokenNumber: 1 }, { unique: true });
tokenSchema.index({ queueId: 1, status: 1, position: 1 });
tokenSchema.index({ managerId: 1, createdAt: -1 });

export const Token = mongoose.model<ITokenDocument>('Token', tokenSchema);

