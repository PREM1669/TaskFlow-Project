import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-screen w-64 flex-col justify-between border-r border-[#e7e6de] bg-[#f4f3ec] p-5">
      <div>
        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a9c7b0] font-semibold text-white">T</span>
          <h2 className="text-lg font-semibold tracking-tight text-[#302f2b]">TaskFlow</h2>
        </div>
        <nav className="space-y-1">
          <Link
            to="/boards"
            className={`block rounded px-3 py-2 text-sm font-medium ${
              location.pathname === '/boards'
                ? 'bg-[#e3eee5] text-[#587764]'
                : 'text-[#77756d] hover:bg-[#ebece4]'
            }`}
          >
            My Boards
          </Link>
        </nav>
      </div>
      <div className="border-t border-[#e1e0d8] pt-4">
        <p className="mb-2 truncate text-sm text-[#77756d]">{user?.name}</p>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#a34f38] hover:bg-[#f8e4dc]"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
