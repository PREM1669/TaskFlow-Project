import { Link } from 'react-router-dom';

export default function BoardCard({ board }) {
  return (
    <Link
      to={`/boards/${board._id}`}
      className="block rounded-3xl border border-[#e5e4dc] bg-white p-6 shadow-[0_8px_24px_rgba(48,47,43,0.05)] transition hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(48,47,43,0.1)]"
    >
      <h3 className="display-font text-xl font-medium text-[#302f2b]">{board.title}</h3>
      <p className="mt-2 text-xs text-[#8b897f]">
        {board.memberIds?.length || 1} member{board.memberIds?.length === 1 ? '' : 's'}
      </p>
    </Link>
  );
}
