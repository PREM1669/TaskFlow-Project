import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark(document.documentElement.classList.contains('dark'));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="fixed left-4 top-4 z-40 rounded-xl border border-[#e1e0d8] bg-[#f4f3ec] px-3 py-2 text-sm text-[#587764] shadow-sm md:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        aria-label="Toggle navigation"
      >
        {open ? 'Close' : 'Menu'}
      </button>
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col justify-between border-r border-[#e7e6de] bg-[#f4f3ec] p-5 transition-transform md:static md:translate-x-0 dark:border-slate-700 dark:bg-slate-900 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div>
        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#a9c7b0] font-semibold text-white">T</span>
          <h2 className="text-lg font-semibold tracking-tight text-[#302f2b] dark:text-slate-100">TaskFlow</h2>
        </div>
        <nav className="space-y-1">
          <Link
            to="/boards"
            className={`block rounded px-3 py-2 text-sm font-medium ${
              location.pathname === '/boards'
                ? 'bg-[#e3eee5] text-[#587764] dark:bg-slate-800 dark:text-emerald-300'
                : 'text-[#77756d] hover:bg-[#ebece4] dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            My Boards
          </Link>
        </nav>
      </div>
      <div className="border-t border-[#e1e0d8] pt-4">
        <p className="mb-2 truncate text-sm text-[#77756d] dark:text-slate-400">{user?.name}</p>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#a34f38] hover:bg-[#f8e4dc] dark:hover:bg-red-950"
        >
          Log out
        </button>
        <button type="button" onClick={toggleDark} className="mt-2 w-full rounded-xl px-3 py-2 text-left text-sm text-[#77756d] hover:bg-[#ebece4] dark:text-slate-400 dark:hover:bg-slate-800">
          {dark ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </aside>
    </>
  );
}
