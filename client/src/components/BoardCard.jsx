import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useBoardStore from '../store/useBoardStore';

export default function BoardCard({ board }) {
  const user = useAuthStore((state) => state.user);
  const deleteBoard = useBoardStore((state) => state.deleteBoard);
  const navigate = useNavigate();
  const isOwner = user?.id === board.ownerId;

  const handleDelete = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!window.confirm(`Delete "${board.title}" and all its tasks?`)) return;
    await deleteBoard(board._id);
    navigate('/boards');
  };

  return (
    <Link
      to={`/boards/${board._id}`}
      className="block rounded-3xl border border-[#e5e4dc] bg-white p-6 shadow-[0_8px_24px_rgba(48,47,43,0.05)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(48,47,43,0.1)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 dark:hover:bg-slate-800"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="display-font text-xl font-medium text-[#302f2b] dark:text-slate-100">{board.title}</h3>
          <p className="mt-2 text-xs text-[#8b897f] dark:text-slate-400">
            {board.memberIds?.length || 1} member{board.memberIds?.length === 1 ? '' : 's'}
          </p>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg px-2 py-1 text-xs text-[#a34f38] hover:bg-[#f8e4dc] dark:text-red-300 dark:hover:bg-red-950"
          >
            Delete
          </button>
        )}
      </div>
    </Link>
  );
}
