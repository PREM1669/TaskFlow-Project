import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      { withCredentials: true, autoConnect: true },
    );
  }
  return socketInstance;
}

export function useBoardSocket(boardId, handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!boardId) return undefined;

    const socket = getSocket();
    const joinBoard = () => socket.emit('join:board', boardId);
    const onTaskMoved = (payload) => handlersRef.current.onTaskMoved?.(payload);
    const onTaskCreated = (payload) => handlersRef.current.onTaskCreated?.(payload);
    const onTaskDeleted = (payload) => handlersRef.current.onTaskDeleted?.(payload);
    const onTaskUpdated = (payload) => handlersRef.current.onTaskUpdated?.(payload);
    const onColumnCreated = (payload) => handlersRef.current.onColumnCreated?.(payload);
    const onColumnDeleted = (payload) => handlersRef.current.onColumnDeleted?.(payload);
    const onColumnMoved = (payload) => handlersRef.current.onColumnMoved?.(payload);
    const onActivity = (payload) => handlersRef.current.onActivity?.(payload);
    const onUserJoined = (payload) => handlersRef.current.onUserJoined?.(payload);
    const onUserLeft = (payload) => handlersRef.current.onUserLeft?.(payload);
    const onReconnect = () => handlersRef.current.onReconnect?.();

    socket.on('connect', joinBoard);
    socket.on('task:moved', onTaskMoved);
    socket.on('task:created', onTaskCreated);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('task:updated', onTaskUpdated);
    socket.on('column:created', onColumnCreated);
    socket.on('column:deleted', onColumnDeleted);
    socket.on('column:moved', onColumnMoved);
    socket.on('activity', onActivity);
    socket.on('user:joined', onUserJoined);
    socket.on('user:left', onUserLeft);
    socket.io.on('reconnect', onReconnect);
    if (socket.connected) joinBoard();

    return () => {
      socket.emit('leave:board', boardId);
      socket.off('connect', joinBoard);
      socket.off('task:moved', onTaskMoved);
      socket.off('task:created', onTaskCreated);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('task:updated', onTaskUpdated);
      socket.off('column:created', onColumnCreated);
      socket.off('column:deleted', onColumnDeleted);
      socket.off('column:moved', onColumnMoved);
      socket.off('activity', onActivity);
      socket.off('user:joined', onUserJoined);
      socket.off('user:left', onUserLeft);
      socket.io.off('reconnect', onReconnect);
    };
  }, [boardId]);
}
