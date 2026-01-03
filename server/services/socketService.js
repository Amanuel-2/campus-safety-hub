const { Server } = require('socket.io');

let io = null;

// Initialize Socket.io with HTTP server
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Handle admin connections
  io.on('connection', (socket) => {
    console.log(`Admin connected: ${socket.id}`);

    // Admin joins admin room
    socket.on('admin-join', () => {
      socket.join('admins');
      console.log(`Admin ${socket.id} joined admins room`);
    });

    socket.on('disconnect', () => {
      console.log(`Admin disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Get Socket.io instance
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

// Broadcast emergency alert to all connected admins
const broadcastEmergencyAlert = (alert) => {
  const ioInstance = getIO();
  ioInstance.to('admins').emit('new-emergency', {
    alertId: alert._id.toString(),
    location: alert.location,
    emergencyType: alert.emergencyType,
    timestamp: alert.timestamp,
    description: alert.description,
  });
  console.log(`📢 Emergency alert broadcasted to admins: ${alert._id}`);
};

// Broadcast emergency status update
const broadcastEmergencyUpdate = (alertId, status) => {
  const ioInstance = getIO();
  ioInstance.to('admins').emit('emergency-updated', {
    alertId: alertId.toString(),
    status,
  });
};

module.exports = {
  initializeSocket,
  getIO,
  broadcastEmergencyAlert,
  broadcastEmergencyUpdate,
};

