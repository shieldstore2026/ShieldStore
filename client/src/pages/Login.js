import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { loginWithToken, user } = useAuth();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.token) await loginWithToken(data.token);
      toast.success('Logged in');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  useEffect(() => {
    const err = searchParams.get('error');
    if (err) toast.error(err.replace(/\+/g, ' '));
  }, [searchParams]);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  if (user) return null;

  const apiBase = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
  const frontend = encodeURIComponent(window.location.origin);
  const googleUrl = `${apiBase || ''}/api/auth/google?frontend=${frontend}`;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-surface-700 bg-surface-800 shadow-card-hover">
        <h1 className="font-display text-2xl font-bold text-neutral-100 mb-1">Sign in</h1>
        <p className="text-sm text-neutral-500 mb-6">Use your Shield account</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100 placeholder:text-neutral-500"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
            <input
              id="login-password"
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
          <a
            href={googleUrl}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-surface-600 text-neutral-200 hover:border-accent hover:text-accent transition-colors"
          >
            <span>G</span>
            <span>Continue with Google</span>
          </a>
        </form>
        <p className="mt-6 text-sm text-neutral-500">
          <Link to="/register" className="text-accent hover:text-accent-light font-medium transition-colors">Create account</Link>
        </p>
      </div>
    </div>
  );
}
