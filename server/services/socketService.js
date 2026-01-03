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

  // Handle admin and police connections
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Admin joins admin room
    socket.on('admin-join', () => {
      socket.join('admins');
      console.log(`Admin ${socket.id} joined admins room`);
    });

    // Police joins police room
    socket.on('police-join', () => {
      socket.join('police');
      console.log(`Police ${socket.id} joined police room`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
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

// Broadcast emergency alert to all connected admins and police
const broadcastEmergencyAlert = (alert) => {
  const ioInstance = getIO();
  const alertData = {
    alertId: alert._id.toString(),
    location: alert.location,
    emergencyType: alert.emergencyType,
    timestamp: alert.timestamp,
    description: alert.description,
    reportedBy: alert.reportedBy,
  };
  ioInstance.to('admins').emit('new-emergency', alertData);
  ioInstance.to('police').emit('new-emergency', alertData);
  console.log(`📢 Emergency alert broadcasted to admins and police: ${alert._id}`);
};

// Broadcast emergency status update to admins and police
const broadcastEmergencyUpdate = (alertId, status) => {
  const ioInstance = getIO();
  const updateData = {
    alertId: alertId.toString(),
    status,
  };
  ioInstance.to('admins').emit('emergency-updated', updateData);
  ioInstance.to('police').emit('emergency-updated', updateData);
};

module.exports = {
  initializeSocket,
  getIO,
  broadcastEmergencyAlert,
  broadcastEmergencyUpdate,
};

