import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IManager } from '../types/index.js';

export interface IManagerDocument extends Omit<IManager, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const managerSchema = new Schema<IManagerDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to hash password if modified
managerSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Instance method to compare password
managerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Manager = mongoose.model<IManagerDocument>('Manager', managerSchema);

