import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Board from '../components/Board';
import useBoardStore from '../store/useBoardStore';

export default function BoardView() {
  const { id } = useParams();
  const currentBoard = useBoardStore((state) => state.currentBoard);
  const columns = useBoardStore((state) => state.columns);
  const tasks = useBoardStore((state) => state.tasks);
  const fetchBoard = useBoardStore((state) => state.fetchBoard);
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

  if (loading) return <div className="p-8 text-[#8b897f]">Loading board...</div>;
  if (error) return <div className="p-8 text-[#a34f38]">{error}</div>;
  if (!currentBoard) return <div className="p-8 text-[#8b897f]">Board not found.</div>;

  return (
    <div className="flex min-h-screen bg-[#faf9f4]">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="px-8 pb-6 pt-10 sm:px-12">
          <Link to="/boards" className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-[#7d8f81] hover:text-[#587764]">
            ← All boards
          </Link>
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#6c8d77]">Project workspace</p>
          <h1 className="display-font text-4xl font-medium text-[#302f2b]">{currentBoard.title}</h1>
        </header>
        <Board boardId={currentBoard._id} columns={columns} tasks={tasks} />
      </main>
    </div>
  );
}
