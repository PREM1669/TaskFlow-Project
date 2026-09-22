import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/boards');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-shell flex min-h-screen items-center justify-center px-5 py-10">
      <form onSubmit={handleSubmit} className="auth-card w-full max-w-md rounded-[2rem] p-8 sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#a9c7b0] text-lg font-semibold text-white">T</span>
          <span className="text-lg font-semibold tracking-tight text-[#302f2b]">TaskFlow</span>
        </div>
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-[#6c8d77]">Get started</p>
        <h1 className="display-font mb-3 text-4xl font-medium leading-tight text-[#302f2b]">Make room for good work.</h1>
        <p className="mb-8 text-sm leading-6 text-[#77756d]">Create your account and bring every project into one calm workspace.</p>
        {error && <p className="mb-4 rounded-xl bg-[#f8e4dc] px-3 py-2 text-sm text-[#a34f38]">{error}</p>}
        <input name="name" placeholder="Name" onChange={handleChange}
          className="sage-input mb-3 w-full rounded-xl border px-4 py-3" required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange}
          className="sage-input mb-3 w-full rounded-xl border px-4 py-3" required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange}
          className="sage-input mb-5 w-full rounded-xl border px-4 py-3" required />
        <button className="sage-button w-full rounded-full py-3 font-semibold">
          Register
        </button>
        <p className="mt-6 text-center text-sm text-[#77756d]">
          Already have an account? <Link to="/login" className="font-semibold text-[#587764] hover:underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
