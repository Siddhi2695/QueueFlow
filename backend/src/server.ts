import http from 'http';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { socketService } from './services/socket.service.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const app = createApp();
    const server = http.createServer(app);

    // Initialize Socket.io
    socketService.init(server);

    server.listen(PORT, () => {
      console.log(`[Server] QueueFlow backend running on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('\n[Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Server] Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server] Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();

