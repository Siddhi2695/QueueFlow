import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import queueRoutes from './routes/queue.routes.js';
import tokenRoutes from './routes/token.routes.js';
import historyRoutes from './routes/history.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import { errorHandler } from './middleware/error.js';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'QueueFlow API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/queues', queueRoutes);
  app.use('/api/tokens', tokenRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // 404 handler for undefined API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

