import { create } from 'zustand';
import api from '../api/axios';
import { getSocket } from '../hooks/useSocket';

const useBoardStore = create((set, get) => ({
  boards: [],
  setBoards: (boards) => set({ boards }),
  currentBoard: null,
  columns: [],
  tasks: [],

  fetchBoards: async () => {
    const res = await api.get('/boards');
    set({ boards: res.data });
  },

  createBoard: async (title) => {
    const res = await api.post('/boards', { title });
    set({ boards: [res.data, ...get().boards] });
    return res.data;
  },

  deleteBoard: async (boardId) => {
    await api.delete(`/boards/${boardId}`);
    set({ boards: get().boards.filter((board) => board._id !== boardId) });
  },

  fetchBoard: async (id) => {
    const res = await api.get(`/boards/${id}`);
    set({
      currentBoard: res.data.board,
      columns: res.data.columns,
      tasks: res.data.tasks,
    });
  },

  moveTask: async (taskId, columnId, order, boardId) => {
    const previousTasks = get().tasks;
    set({
      tasks: previousTasks.map((task) => (
        task._id === taskId ? { ...task, columnId, order } : task
      )),
    });

    try {
      await api.patch(`/tasks/${taskId}`, { columnId, order });
      getSocket().emit('task:moved', {
        taskId,
        boardId: boardId || get().currentBoard?._id,
        columnId,
        order,
      });
    } catch (error) {
      set({ tasks: previousTasks });
      throw error;
    }
  },

  createTask: async (boardId, columnId, title) => {
    const res = await api.post('/tasks', { boardId, columnId, title });
    set({ tasks: [...get().tasks, res.data] });
    getSocket().emit('task:created', { boardId, task: res.data });
    return res.data;
  },

  updateTask: async (taskId, changes, boardId) => {
    const res = await api.patch(`/tasks/${taskId}`, changes);
    set({
      tasks: get().tasks.map((task) => (task._id === taskId ? res.data : task)),
    });
    getSocket().emit('task:updated', { boardId, task: res.data });
    return res.data;
  },

  deleteTask: async (taskId, boardId) => {
    await api.delete(`/tasks/${taskId}`);
    set({ tasks: get().tasks.filter((task) => task._id !== taskId) });
    getSocket().emit('task:deleted', { boardId, taskId });
  },

  createColumn: async (boardId, title) => {
    const res = await api.post('/columns', { boardId, title });
    set({ columns: [...get().columns, res.data] });
    getSocket().emit('column:created', { boardId, column: res.data });
    return res.data;
  },

  deleteColumn: async (columnId, boardId) => {
    await api.delete(`/columns/${columnId}`);
    set({
      columns: get().columns.filter((column) => column._id !== columnId),
      tasks: get().tasks.filter((task) => task.columnId !== columnId),
    });
    getSocket().emit('column:deleted', { boardId, columnId });
  },

  moveColumn: async (columnId, order, boardId) => {
    const previousColumns = get().columns;
    const orderedColumns = previousColumns.slice().sort((a, b) => a.order - b.order);
    const fromIndex = orderedColumns.findIndex((column) => column._id === columnId);
    const nextColumns = orderedColumns.slice();
    const [movingColumn] = nextColumns.splice(fromIndex, 1);
    nextColumns.splice(order, 0, movingColumn);
    const reindexedColumns = nextColumns.map((column, index) => ({ ...column, order: index }));
    set({ columns: reindexedColumns });

    try {
      await Promise.all(
        reindexedColumns.map((column) => api.patch(`/columns/${column._id}`, { order: column.order })),
      );
      getSocket().emit('column:moved', { boardId, columnId, order });
    } catch (error) {
      set({ columns: previousColumns });
      throw error;
    }
  },

  applyRemoteTaskMove: (payload) => {
    set({
      tasks: get().tasks.map((task) => (
        task._id === payload.taskId
          ? { ...task, columnId: payload.columnId, order: payload.order }
          : task
      )),
    });
  },

  applyRemoteTaskCreated: (payload) => {
    if (get().tasks.some((task) => task._id === payload.task?._id)) return;
    set({ tasks: [...get().tasks, payload.task] });
  },

  applyRemoteTaskUpdated: (payload) => {
    set({
      tasks: get().tasks.map((task) => (
        task._id === payload.task?._id ? payload.task : task
      )),
    });
  },

  applyRemoteTaskDeleted: (payload) => {
    set({ tasks: get().tasks.filter((task) => task._id !== payload.taskId) });
  },

  applyRemoteColumnCreated: (payload) => {
    if (get().columns.some((column) => column._id === payload.column?._id)) return;
    set({ columns: [...get().columns, payload.column] });
  },

  applyRemoteColumnDeleted: (payload) => {
    set({
      columns: get().columns.filter((column) => column._id !== payload.columnId),
      tasks: get().tasks.filter((task) => task.columnId !== payload.columnId),
    });
  },

  applyRemoteColumnMove: (payload) => {
    set({
      columns: get().columns.map((column) => (
        column._id === payload.columnId
          ? { ...column, order: payload.order }
          : column
      )),
    });
  },
}));

export default useBoardStore;
