import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinQueue: (queueId: string) => void;
  leaveQueue: (queueId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { manager } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket.IO] Connected to server with ID:', socketInstance.id);
      if (manager?.id) {
        socketInstance.emit('join_manager', manager.id);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket.IO] Disconnected from server');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [manager?.id]);

  const joinQueue = (queueId: string) => {
    if (socket && queueId) {
      socket.emit('join_queue', queueId);
    }
  };

  const leaveQueue = (queueId: string) => {
    if (socket && queueId) {
      socket.emit('leave_queue', queueId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinQueue, leaveQueue }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

