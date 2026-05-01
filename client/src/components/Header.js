import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';
import AuthModal from './AuthModal';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('');
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accountMenuEl, setAccountMenuEl] = useState(null);
  useEffect(() => { api.get('/categories').then((r) => setCategories(r.data || [])).catch(() => setCategories([])); }, []);
  const allowedSlugs = ['free-fire-diamonds', 'free-fire-subscriptions', 'fashion'];
  const parentCats = categories.filter((c) => allowedSlugs.includes(c.slug)).sort((a, b) => allowedSlugs.indexOf(a.slug) - allowedSlugs.indexOf(b.slug));
  const subCats = categories.filter((c) => c.parent && parentCats.some((p) => (c.parent?._id || c.parent) === p._id));

  useEffect(() => {
    const closeMenu = (e) => {
      if (accountMenuEl && !accountMenuEl.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [accountMenuEl]);

  useEffect(() => {
    const onOpenAuth = (e) => {
      setAuthModalMode(e.detail?.mode === 'register' ? 'register' : 'login');
    };
    window.addEventListener('open-auth-modal', onOpenAuth);
    return () => window.removeEventListener('open-auth-modal', onOpenAuth);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-surface-900/90 backdrop-blur-md backdrop-saturate-150 border-b border-surface-700/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.45)]"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 sm:gap-6 flex-wrap">
        <Link to="/" className="flex items-center shrink-0" title="The Shield Store">
          <motion.img
            src={`${process.env.PUBLIC_URL || ''}/logo.png`}
            alt="Shield"
            width={160}
            height={56}
            className="h-12 w-auto sm:h-14 object-contain max-h-16"
            loading="eager"
            decoding="async"
            onError={(e) => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL || ''}/logo.svg`; }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          />
        </Link>

        <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-xl flex">
          <div className="flex w-full rounded-xl overflow-hidden border border-surface-700 bg-surface-800 focus-within:ring-2 focus-within:ring-accent/60 focus-within:border-accent/50 transition-all">
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-0 px-4 py-2.5 bg-transparent text-neutral-100 text-sm outline-none placeholder:text-neutral-500"
              aria-label="Search"
            />
            <button type="submit" className="px-4 py-2.5 bg-accent text-black font-semibold text-sm hover:bg-accent-light transition-colors">
              Search
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 sm:gap-4">
          <button type="button" onClick={toggleTheme} className="p-2.5 rounded-xl bg-surface-800 text-neutral-400 hover:text-neutral-200 hover:bg-surface-700 transition-colors" aria-label="Toggle theme">
            {dark ? '☀️' : '🌙'}
          </button>

          <div className="relative" ref={setAccountMenuEl}>
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              className="flex flex-col items-start text-left px-3 py-1.5 text-xs text-neutral-400 hover:text-accent border border-surface-700/80 hover:border-accent/40 rounded-xl transition-colors min-w-[106px]"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
            >
              <span className="text-[10px] uppercase tracking-wider">Hello</span>
              <span className="font-semibold text-neutral-200 flex items-center gap-1">
                {user ? user.name?.split(' ')[0] || 'Account' : 'Sign in'}
                <span className="text-neutral-500">▾</span>
              </span>
            </button>
            {accountOpen && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1 w-56 py-2 bg-surface-800 border border-surface-700 rounded-2xl shadow-card-hover z-50"
                  role="menu"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-surface-700">
                        <p className="font-semibold text-neutral-100 truncate">{user.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-300 hover:bg-surface-700 hover:text-accent transition-colors">👤 Profile</Link>
                      <Link to="/orders" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-300 hover:bg-surface-700 hover:text-accent transition-colors">📦 Orders</Link>
                      <Link to="/wishlist" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-300 hover:bg-surface-700 hover:text-accent transition-colors">❤️ Wishlist</Link>
                      {isAdmin && <Link to="/admin" onClick={() => setAccountOpen(false)} className="block px-4 py-2.5 text-sm text-neutral-300 hover:bg-surface-700 hover:text-accent transition-colors">🛡 Admin Panel</Link>}
                      <button type="button" onClick={() => { setAccountOpen(false); logout(); navigate('/'); }} className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-surface-700 text-accent font-medium">Sign out</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => { setAccountOpen(false); setAuthModalMode('login'); }} className="block w-[calc(100%-1.5rem)] mx-3 mt-2 py-2.5 text-center bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors">Sign in</button>
                      <button type="button" onClick={() => { setAccountOpen(false); setAuthModalMode('register'); }} className="block w-full text-left px-4 py-2.5 text-sm text-neutral-400 hover:bg-surface-700 hover:text-accent transition-colors">New customer? Start here</button>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <Link to="/orders" className="hidden sm:flex flex-col items-start text-left px-2 py-1 text-xs text-neutral-400 hover:text-accent rounded-xl transition-colors">
            <span className="text-[10px] uppercase tracking-wider">Returns</span>
            <span className="font-semibold text-neutral-200">& Orders</span>
          </Link>

          <Link to="/cart" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-800 border border-surface-700 text-neutral-200 hover:border-accent/50 hover:text-accent transition-colors" title="Cart">
            <span className="text-lg">🛒</span>
            <span className="font-bold text-sm tabular-nums">{cartCount > 0 ? cartCount : '0'}</span>
            <span className="hidden sm:inline text-sm font-medium">Cart</span>
          </Link>
        </div>
      </div>

      <nav className="bg-surface-800/80 border-t border-surface-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center gap-1 sm:gap-2">
          <Link to="/" className="px-3 py-2 text-sm font-medium text-neutral-400 hover:text-accent hover:bg-surface-700 rounded-lg transition-colors">All</Link>
          <div className="relative" onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => setCategoriesOpen(false)}>
            <span className="cursor-pointer px-3 py-2 text-sm font-medium text-neutral-400 hover:text-accent hover:bg-surface-700 rounded-lg transition-colors">Categories ▾</span>
            {categoriesOpen && categories.length > 0 && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-0.5 w-52 py-2 bg-surface-800 border border-surface-700 rounded-2xl shadow-card-hover z-50"
                >
                  {parentCats.map((p) => (
                    <div key={p._id}>
                      <Link to={`/products?category=${p.slug}`} className="block px-4 py-2 text-sm font-medium text-neutral-200 hover:bg-surface-700 hover:text-accent transition-colors">{p.name}</Link>
                      {subCats.filter((s) => (s.parent?._id || s.parent) === p._id).map((s) => (
                        <Link key={s._id} to={`/products?category=${s.slug}`} className="block px-4 py-1.5 pl-5 text-sm text-neutral-400 hover:bg-surface-700 hover:text-accent transition-colors">{s.name}</Link>
                      ))}
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          <Link to="/products?featured=true" className="px-3 py-2 text-sm text-neutral-400 hover:text-accent hover:bg-surface-700 rounded-lg transition-colors">Deals</Link>
          <Link to="/about" className="px-3 py-2 text-sm text-neutral-400 hover:text-accent hover:bg-surface-700 rounded-lg transition-colors">About</Link>
          <Link to="/products" className="px-3 py-2 text-sm text-neutral-400 hover:text-accent hover:bg-surface-700 rounded-lg transition-colors">Products</Link>
          <Link to="/wishlist" className="px-3 py-2 text-sm text-neutral-400 hover:text-accent hover:bg-surface-700 rounded-lg transition-colors">Wishlist</Link>
        </div>
      </nav>
      {authModalMode ? (
        <AuthModal
          mode={authModalMode}
          onClose={() => setAuthModalMode('')}
          onSwitch={(next) => setAuthModalMode(next)}
        />
      ) : null}
    </motion.header>
  );
}
