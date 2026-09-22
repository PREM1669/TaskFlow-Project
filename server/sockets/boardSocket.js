const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const Board = require('../models/Board');
const User = require('../models/User');

const canAccessBoard = async (boardId, userId) => {
  const board = await Board.findById(boardId).select('memberIds');
  return board?.memberIds.some((memberId) => memberId.equals(userId));
};

module.exports = (io) => {
  const broadcastActivity = (boardId, socket, action, message, details = {}) => {
    io.to(boardId).emit('activity', {
      id: `${Date.now()}-${socket.id}`,
      action,
      message,
      actor: socket.user,
      timestamp: new Date().toISOString(),
      ...details,
    });
  };

  io.use(async (socket, next) => {
    try {
      const rawCookies = socket.handshake.headers.cookie;
      if (!rawCookies) return next(new Error('Unauthorized'));

      const { token } = cookie.parse(rawCookies);
      if (!token) return next(new Error('Unauthorized'));

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select('name');
      if (!user) return next(new Error('Unauthorized'));

      socket.user = { id: user._id.toString(), name: user.name };
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    let currentBoardId = null;

    socket.on('join:board', async (boardId) => {
      if (typeof boardId !== 'string' || !(await canAccessBoard(boardId, socket.user.id))) {
        socket.emit('board:error', { message: 'Forbidden' });
        return;
      }

      if (currentBoardId && currentBoardId !== boardId) {
        socket.leave(currentBoardId);
        socket.to(currentBoardId).emit('user:left', { id: socket.user.id });
      }

      currentBoardId = boardId;
      socket.join(boardId);
      socket.to(boardId).emit('user:joined', {
        id: socket.user.id,
        name: socket.user.name,
      });
      broadcastActivity(boardId, socket, 'presence', `${socket.user.name} joined the board`);
    });

    socket.on('leave:board', (boardId) => {
      if (boardId !== currentBoardId) return;
      socket.leave(boardId);
      socket.to(boardId).emit('user:left', { id: socket.user.id });
      broadcastActivity(boardId, socket, 'presence', `${socket.user.name} left the board`);
      currentBoardId = null;
    });

    socket.on('task:moved', (payload) => {
      if (!payload || payload.boardId !== currentBoardId) return;
      socket.to(currentBoardId).emit('task:moved', payload);
      broadcastActivity(currentBoardId, socket, 'task:moved', `${socket.user.name} moved a task`, payload);
    });

    socket.on('task:created', (payload) => {
      if (!payload || payload.boardId !== currentBoardId) return;
      socket.to(currentBoardId).emit('task:created', payload);
      broadcastActivity(currentBoardId, socket, 'task:created', `${socket.user.name} created task "${payload.task?.title || 'Untitled'}"`, payload);
    });

    socket.on('task:updated', (payload) => {
      if (!payload || payload.boardId !== currentBoardId) return;
      socket.to(currentBoardId).emit('task:updated', payload);
      broadcastActivity(currentBoardId, socket, 'task:updated', `${socket.user.name} edited task "${payload.task?.title || 'Untitled'}"`, payload);
    });

    socket.on('task:deleted', (payload) => {
      if (!payload || payload.boardId !== currentBoardId) return;
      socket.to(currentBoardId).emit('task:deleted', payload);
      broadcastActivity(currentBoardId, socket, 'task:deleted', `${socket.user.name} deleted a task`, payload);
    });

    socket.on('column:created', (payload) => {
      if (!payload || payload.boardId !== currentBoardId) return;
      socket.to(currentBoardId).emit('column:created', payload);
      broadcastActivity(currentBoardId, socket, 'column:created', `${socket.user.name} created column "${payload.column?.title || 'Untitled'}"`, payload);
    });

    socket.on('column:deleted', (payload) => {
      if (!payload || payload.boardId !== currentBoardId) return;
      socket.to(currentBoardId).emit('column:deleted', payload);
      broadcastActivity(currentBoardId, socket, 'column:deleted', `${socket.user.name} deleted a column`, payload);
    });

    socket.on('column:moved', (payload) => {
      if (!payload || payload.boardId !== currentBoardId) return;
      socket.to(currentBoardId).emit('column:moved', payload);
      broadcastActivity(currentBoardId, socket, 'column:moved', `${socket.user.name} reordered the columns`, payload);
    });

    socket.on('disconnect', () => {
      if (currentBoardId) {
        socket.to(currentBoardId).emit('user:left', { id: socket.user.id });
        broadcastActivity(currentBoardId, socket, 'presence', `${socket.user.name} disconnected`);
      }
    });
  });
};
