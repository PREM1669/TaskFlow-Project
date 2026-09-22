import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/boards');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-shell flex min-h-screen items-center justify-center px-5 py-10">
      <form onSubmit={handleSubmit} className="auth-card w-full max-w-md rounded-[2rem] p-8 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a9c7b0] text-lg font-semibold text-white">T</span>
          <span className="text-lg font-semibold tracking-tight text-[#302f2b]">TaskFlow</span>
        </div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#6c8d77]">Welcome back</p>
        <h1 className="display-font mb-3 text-4xl font-medium leading-tight text-[#302f2b]">Your work, in rhythm.</h1>
        <p className="mb-8 text-sm leading-6 text-[#77756d]">Sign in to return to your boards and keep the momentum moving.</p>
        {error && <p className="mb-4 rounded-xl bg-[#f8e4dc] px-3 py-2 text-sm text-[#a34f38]">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="sage-input mb-3 w-full rounded-xl border px-4 py-3"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="sage-input mb-5 w-full rounded-xl border px-4 py-3"
          required
        />
        <button className="sage-button w-full rounded-full py-3 font-semibold">
          Log in
        </button>
        <p className="mt-6 text-center text-sm text-[#77756d]">
          No account? <Link to="/register" className="font-semibold text-[#587764] hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
