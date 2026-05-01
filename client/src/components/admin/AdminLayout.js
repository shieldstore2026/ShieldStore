import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: '📊' },
  { to: '/admin/products', label: 'Products', icon: '📦' },
  { to: '/admin/categories', label: 'Categories', icon: '📁' },
  { to: '/admin/about', label: 'About CMS', icon: '🛡️' },
  { to: '/admin/orders', label: 'Orders', icon: '🛒' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-28 -right-16 w-72 h-72 bg-fuchsia-300/30 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-40 -left-20 w-80 h-80 bg-indigo-300/30 rounded-full blur-3xl" />
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} fixed top-0 left-0 h-screen z-40 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col shrink-0 transition-all duration-200 shadow-2xl border-r border-white/10`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link to="/admin" className="font-semibold text-slate-100 truncate flex items-center gap-2">
            <img src={`${process.env.PUBLIC_URL || ''}/logo.png`} alt="Shield" className="h-8 w-auto object-contain" />
            {sidebarOpen ? <span>Shield Control</span> : null}
          </Link>
          <button type="button" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors" aria-label="Toggle sidebar">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-amber-300 to-yellow-200 text-black font-semibold shadow-md shadow-amber-300/30' : 'text-slate-300 hover:bg-white/10 hover:text-white'} ${sidebarOpen ? '' : 'justify-center'}`
              }
            >
              <span className="text-lg">{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link to="/" className={`flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white text-sm rounded-lg hover:bg-white/10 ${sidebarOpen ? '' : 'justify-center'}`}>
            ← Store
          </Link>
          <button type="button" onClick={() => { logout(); navigate('/'); }} className={`w-full flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white text-sm rounded-lg hover:bg-white/10 ${sidebarOpen ? '' : 'justify-center'}`}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`min-h-screen flex flex-col min-w-0 transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-slate-900 font-semibold text-lg">Shield Admin Panel</h1>
          <span className="text-sm px-3 py-1 rounded-full border border-slate-200 text-slate-600 bg-white/70">{user?.email}</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
