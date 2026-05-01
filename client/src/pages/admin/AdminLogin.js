import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const DEMO_EMAIL = 'admin@shield.com';
const DEMO_PASSWORD = 'admin123';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken, user, isAdmin } = useAuth();
  const from = location.state?.from?.pathname || '/admin';

  if (user && isAdmin) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user && data.user.role !== 'admin') {
        toast.error('Admin access only. Use an admin account.');
        setLoading(false);
        return;
      }
      if (data.token) {
        await loginWithToken(data.token);
        toast.success('Welcome back');
        // Defer navigate so AuthContext state is committed before AdminRoute checks it
        setTimeout(() => navigate(from, { replace: true }), 0);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      toast.error(msg);
      if (err.response?.status === 401) {
        console.warn('Admin login: Invalid credentials. Run "npm run seed" in server to create admin@shield.com / admin123');
      }
    }
    setLoading(false);
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-surface-950">
      <div className="w-full max-w-md p-8 rounded-2xl border border-surface-700 bg-surface-800 shadow-card-hover">
        <h1 className="font-display text-2xl font-bold text-neutral-100 mb-1">Admin sign in</h1>
        <p className="text-sm text-neutral-500 mb-6">Staff and administrators only.</p>

        <div className="mb-6 p-4 rounded-2xl bg-surface-900 border border-surface-700">
          <p className="text-sm font-medium text-neutral-300 mb-1">Demo credentials (after seed)</p>
          <p className="text-xs text-neutral-500 mb-2">Email: <code className="bg-surface-700 px-1.5 py-0.5 rounded">{DEMO_EMAIL}</code> · Password: <code className="bg-surface-700 px-1.5 py-0.5 rounded">{DEMO_PASSWORD}</code></p>
          <p className="text-xs text-neutral-500 mb-2">If login fails, run in server folder: <code className="bg-surface-700 px-1.5 py-0.5 rounded">npm run seed</code></p>
          <button type="button" onClick={fillDemo} className="text-xs text-accent hover:text-accent-light transition-colors">Fill in demo credentials</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              placeholder="admin@shield.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-sm text-neutral-500">
          <Link to="/" className="text-accent hover:text-accent-light transition-colors">← Back to store</Link>
          {' · '}
          <Link to="/login" className="text-accent hover:text-accent-light transition-colors">Customer login</Link>
        </p>
      </div>
    </div>
  );
}
