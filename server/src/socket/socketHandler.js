const { User } = require('../models');

function setupSocket(io) {
  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;
      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          socket.user = user;
          return next();
        }
      }
      // Allow connection in dev mode
      if (process.env.NODE_ENV === 'development') {
        socket.user = { _id: 'dev', familyId: null };
        return next();
      }
      next(new Error('Authentication required'));
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user?.displayName || socket.id}`);

    // Join family room
    if (socket.user?.familyId) {
      const room = `family:${socket.user.familyId}`;
      socket.join(room);
      console.log(`   Joined room: ${room}`);
    }

    // Join family room manually
    socket.on('join:family', (familyId) => {
      const room = `family:${familyId}`;
      socket.join(room);
    });

    // Expense events
    socket.on('expense:added', (data) => {
      if (socket.user?.familyId) {
        socket.to(`family:${socket.user.familyId}`).emit('expense:added', data);
      }
    });

    socket.on('expense:updated', (data) => {
      if (socket.user?.familyId) {
        socket.to(`family:${socket.user.familyId}`).emit('expense:updated', data);
      }
    });

    socket.on('expense:deleted', (data) => {
      if (socket.user?.familyId) {
        socket.to(`family:${socket.user.familyId}`).emit('expense:deleted', data);
      }
    });

    // Budget events
    socket.on('budget:updated', (data) => {
      if (socket.user?.familyId) {
        socket.to(`family:${socket.user.familyId}`).emit('budget:updated', data);
      }
    });

    socket.on('budget:alert', (data) => {
      if (socket.user?.familyId) {
        io.to(`family:${socket.user.familyId}`).emit('budget:alert', data);
      }
    });

    // Notification events
    socket.on('notification:new', (data) => {
      if (data.targetUserId) {
        io.to(`user:${data.targetUserId}`).emit('notification:new', data);
      } else if (socket.user?.familyId) {
        socket.to(`family:${socket.user.familyId}`).emit('notification:new', data);
      }
    });

    // Member events
    socket.on('member:joined', (data) => {
      if (socket.user?.familyId) {
        socket.to(`family:${socket.user.familyId}`).emit('member:joined', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user?.displayName || socket.id}`);
    });
  });

  return io;
}

module.exports = setupSocket;
