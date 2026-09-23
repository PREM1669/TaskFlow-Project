import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Board from '../components/Board';
import useBoardStore from '../store/useBoardStore';
import { useBoardSocket } from '../hooks/useSocket';
import PresenceIndicator from '../components/PresenceIndicator';
import ActivityAlerts from '../components/ActivityAlerts';

export default function BoardView() {
  const { id } = useParams();
  const currentBoard = useBoardStore((state) => state.currentBoard);
  const columns = useBoardStore((state) => state.columns);
  const tasks = useBoardStore((state) => state.tasks);
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
  const applyRemoteTaskMove = useBoardStore((state) => state.applyRemoteTaskMove);
  const applyRemoteTaskCreated = useBoardStore((state) => state.applyRemoteTaskCreated);
  const applyRemoteTaskUpdated = useBoardStore((state) => state.applyRemoteTaskUpdated);
  const applyRemoteTaskDeleted = useBoardStore((state) => state.applyRemoteTaskDeleted);
  const applyRemoteColumnCreated = useBoardStore((state) => state.applyRemoteColumnCreated);
  const applyRemoteColumnDeleted = useBoardStore((state) => state.applyRemoteColumnDeleted);
  const applyRemoteColumnMove = useBoardStore((state) => state.applyRemoteColumnMove);
  const [activeUsers, setActiveUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchBoard(id)
      .catch((requestError) => {
        setError(requestError.response?.data?.message || 'Could not load board');
      })
      .finally(() => setLoading(false));
  }, [id, fetchBoard]);

  useBoardSocket(id, {
    onTaskMoved: applyRemoteTaskMove,
    onTaskCreated: applyRemoteTaskCreated,
    onTaskUpdated: applyRemoteTaskUpdated,
    onTaskDeleted: applyRemoteTaskDeleted,
    onColumnCreated: applyRemoteColumnCreated,
    onColumnDeleted: applyRemoteColumnDeleted,
    onColumnMoved: applyRemoteColumnMove,
    onActivity: (activity) => {
      setAlerts((currentAlerts) => [...currentAlerts.slice(-3), activity]);
      window.setTimeout(() => {
        setAlerts((currentAlerts) => currentAlerts.filter((item) => item.id !== activity.id));
      }, 5000);
    },
    onUserJoined: (user) => setActiveUsers((users) => (
      users.some((item) => item.id === user.id) ? users : [...users, user]
    )),
    onUserLeft: ({ id: userId }) => setActiveUsers((users) => (
      users.filter((user) => user.id !== userId)
    )),
    onReconnect: () => fetchBoard(id),
  });

  if (loading) return <div className="min-h-screen bg-[#faf9f4] p-8 text-[#8b897f] dark:bg-slate-950 dark:text-slate-400">Loading board...</div>;
  if (error) return <div className="min-h-screen bg-[#faf9f4] p-8 text-[#a34f38] dark:bg-slate-950 dark:text-red-300">{error}</div>;
  if (!currentBoard) return <div className="min-h-screen bg-[#faf9f4] p-8 text-[#8b897f] dark:bg-slate-950 dark:text-slate-400">Board not found.</div>;

  const dismissAlert = (alertId) => {
    setAlerts((currentAlerts) => currentAlerts.filter((alert) => alert.id !== alertId));
  };

  return (
    <div className="flex min-h-screen bg-[#faf9f4]">
      <ActivityAlerts
        alerts={alerts}
        onDismiss={dismissAlert}
      />
      <Sidebar />
      <main className="min-w-0 flex-1 bg-[#faf9f4] pt-16 dark:bg-slate-950 sm:pt-0">
        <header className="px-8 pb-6 pt-10 sm:px-12">
          <Link to="/boards" className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8f81] hover:text-[#587764] dark:text-slate-400 dark:hover:text-emerald-300">
            ← All boards
          </Link>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#6c8d77]">Project workspace</p>
          <div className="flex items-end justify-between gap-6">
            <h1 className="display-font text-4xl font-medium text-[#302f2b] dark:text-slate-100">{currentBoard.title}</h1>
            <PresenceIndicator activeUsers={activeUsers} />
          </div>
        </header>
        <Board boardId={currentBoard._id} columns={columns} tasks={tasks} />
      </main>
    </div>
  );
}
