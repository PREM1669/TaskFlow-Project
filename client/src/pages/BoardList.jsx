import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import BoardCard from '../components/BoardCard';
import useBoardStore from '../store/useBoardStore';

export default function BoardList() {
  const boards = useBoardStore((state) => state.boards);
  const fetchBoards = useBoardStore((state) => state.fetchBoards);
  const createBoard = useBoardStore((state) => state.createBoard);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBoards().catch((requestError) => {
      setError(requestError.response?.data?.message || 'Could not load boards');
    });
  }, [fetchBoards]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;

    try {
      await createBoard(title);
      setTitle('');
      setShowModal(false);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create board');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="min-h-screen flex-1 bg-[#faf9f4] p-8 pt-20 sm:p-12 sm:pt-12 dark:bg-slate-950">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#6c8d77]">Workspace</p>
            <h1 className="display-font text-4xl font-medium text-[#302f2b] dark:text-slate-100">My Boards</h1>
          </div>
          <button onClick={() => setShowModal(true)} className="sage-button rounded-full px-5 py-3 text-sm font-semibold">
            + New Board
          </button>
        </div>
        {showModal && (
          <form onSubmit={handleCreate} className="mb-6 flex max-w-xl gap-2 rounded-2xl border border-[#e5e4dc] bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Board title"
              className="sage-input min-w-0 flex-1 rounded-xl border px-4 py-2 text-sm"
            />
            <button className="sage-button rounded-xl px-4 py-2 text-sm font-semibold">Create</button>
          </form>
        )}
        {error && <p className="mb-5 rounded-xl bg-[#f8e4dc] px-4 py-3 text-sm text-[#a34f38]">{error}</p>}
        {boards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#cfd8d0] bg-white/60 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <p className="display-font text-2xl text-[#5e7664] dark:text-emerald-300">A fresh page awaits.</p>
            <p className="mt-2 text-sm text-[#8b897f] dark:text-slate-400">No boards yet — create your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => <BoardCard key={board._id} board={board} />)}
          </div>
        )}
      </main>
    </div>
  );
}
