import { Server } from 'socket.io';

interface SocketData {
  userId: number;
  tenantId: number;
}

const setupSocket = (io: Server) => {
  io.use((socket, next) => {
    const tenantId = socket.handshake.auth.tenantId;
    const userId = socket.handshake.auth.userId;

    if (!tenantId || !userId) {
      const err = new Error('Authentication error');
      return next(err);
    }

    socket.data = { userId, tenantId };
    next();
  });

  io.on('connection', (socket) => {
    const { tenantId } = socket.data as SocketData;

    socket.join(`tenant_${tenantId}`);

    socket.on('trackLocation', (locationData) => {
      io.to(`tenant_${tenantId}`).emit('locationUpdate', {
        userId: socket.data.userId,
        ...locationData
      });
    });

    socket.on('taskStatus', (taskStatusData) => {
      io.to(`tenant_${tenantId}`).emit('taskStatusUpdate', taskStatusData);
    });

    socket.on('disconnect', () => {
      // Handle cleanup or logging on disconnect
    });
  });
};

export default setupSocket;
