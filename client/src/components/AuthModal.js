import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthModal({ mode = 'login', onClose, onSwitch }) {
  const { loginWithToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const isLogin = mode === 'login';

  const apiBase = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');
  const frontend = encodeURIComponent(window.location.origin);
  const googleUrl = `${apiBase || ''}/api/auth/google?frontend=${frontend}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { data } = isLogin
        ? await api.post('/auth/login', { email, password })
        : await api.post('/auth/register', { name, email, password });
      if (data.token) await loginWithToken(data.token);
      toast.success(isLogin ? 'Logged in' : 'Account created');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || (isLogin ? 'Login failed' : 'Registration failed'));
    }
    setLoading(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-2xl border border-surface-700 bg-surface-800 shadow-card-hover relative">
        <button type="button" onClick={onClose} className="absolute right-3 top-3 h-8 w-8 rounded-lg bg-surface-700 text-neutral-200 hover:bg-surface-600" aria-label="Close">
          ×
        </button>
        <h2 className="font-display text-2xl font-bold text-neutral-100 mb-1">{isLogin ? 'Sign in' : 'Create account'}</h2>
        <p className="text-sm text-neutral-500 mb-5">{isLogin ? 'Use your Shield account' : 'Register to start ordering quickly'}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin ? (
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100 placeholder:text-neutral-500" />
          ) : null}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100 placeholder:text-neutral-500" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100 placeholder:text-neutral-500" />
          {!isLogin ? (
            <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100 placeholder:text-neutral-500" />
          ) : null}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors disabled:opacity-70">
            {loading ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Sign in' : 'Create account')}
          </button>
          <a href={googleUrl} className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-surface-600 text-neutral-200 hover:border-accent hover:text-accent transition-colors">
            <span>G</span>
            <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
          </a>
        </form>
        <button type="button" onClick={() => onSwitch(isLogin ? 'register' : 'login')} className="mt-4 text-sm text-accent hover:text-accent-light transition-colors">
          {isLogin ? 'New customer? Create account' : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return modalContent;
  return createPortal(modalContent, document.body);
}
