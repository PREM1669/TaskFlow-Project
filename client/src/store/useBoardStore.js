import { create } from 'zustand';
import api from '../api/axios';

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

  fetchBoard: async (id) => {
    const res = await api.get(`/boards/${id}`);
    set({
      currentBoard: res.data.board,
      columns: res.data.columns,
      tasks: res.data.tasks,
    });
  },

  moveTask: async (taskId, columnId, order) => {
    const previousTasks = get().tasks;
    set({
      tasks: previousTasks.map((task) => (
        task._id === taskId ? { ...task, columnId, order } : task
      )),
    });

    try {
      await api.patch(`/tasks/${taskId}`, { columnId, order });
    } catch (error) {
      set({ tasks: previousTasks });
      throw error;
    }
  },

  createTask: async (boardId, columnId, title) => {
    const res = await api.post('/tasks', { boardId, columnId, title });
    set({ tasks: [...get().tasks, res.data] });
    return res.data;
  },
}));

export default useBoardStore;
