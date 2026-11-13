import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

class SocketService {
  private io: Server | null = null;

  public init(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*', // Allows frontend local dev & prod
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      },
    });

    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket.IO] Client connected: ${socket.id}`);

      // Client can join a specific queue room (for live token board / public display)
      socket.on('join_queue', (queueId: string) => {
        if (queueId) {
          socket.join(`queue:${queueId}`);
          console.log(`[Socket.IO] ${socket.id} joined queue room: queue:${queueId}`);
        }
      });

      socket.on('leave_queue', (queueId: string) => {
        if (queueId) {
          socket.leave(`queue:${queueId}`);
          console.log(`[Socket.IO] ${socket.id} left queue room: queue:${queueId}`);
        }
      });

      // Manager can join their own manager room for global dashboard stats updates
      socket.on('join_manager', (managerId: string) => {
        if (managerId) {
          socket.join(`manager:${managerId}`);
          console.log(`[Socket.IO] ${socket.id} joined manager room: manager:${managerId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.io has not been initialized yet!');
    }
    return this.io;
  }

  /**
   * Broadcast an event to everyone listening to a specific queue
   */
  public emitToQueue(queueId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`queue:${queueId}`).emit(event, data);
    }
  }

  /**
   * Broadcast an event to a manager
   */
  public emitToManager(managerId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`manager:${managerId}`).emit(event, data);
    }
  }
}

export const socketService = new SocketService();

