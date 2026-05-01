import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const sort = searchParams.get('sort') || '';

  const allowedSlugs = ['free-fire-diamonds', 'free-fire-subscriptions', 'fashion'];
  const parentCats = categories.filter((c) => allowedSlugs.includes(c.slug)).sort((a, b) => allowedSlugs.indexOf(a.slug) - allowedSlugs.indexOf(b.slug));
  const subCats = categories.filter((c) => c.parent && parentCats.some((p) => (c.parent?._id || c.parent) === p._id));
  const displayCategories = [...parentCats, ...subCats];

  useEffect(() => {
    setLoading(true);
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort === 'price-asc' ? 'price' : sort === 'price-desc' ? '-price' : '-createdAt');
    api.get('/products?' + params).then((r) => {
      setProducts(r.data.products || []);
      setPages(r.data.pages || 1);
      setTotal(r.data.total ?? 0);
    }).catch(() => { setProducts([]); setTotal(0); }).finally(() => setLoading(false));
  }, [search, category, page, sort]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const categoryName = category ? (categories.find((c) => c._id === category || c.slug === category)?.name || 'Products') : search ? `"${search}"` : 'All Products';

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { to: '/', label: 'Home' },
        ...(category ? [{ to: '/products', label: 'Products' }, { label: categoryName }] : search ? [{ to: '/products', label: 'Products' }, { label: `Search: ${search}` }] : [{ label: 'Products' }]),
      ]} />
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-52 flex-shrink-0">
          <div className="rounded-2xl border border-surface-700 bg-surface-800 p-4 sticky top-24">
            <h3 className="font-display text-sm font-semibold text-neutral-100 uppercase tracking-wider mb-3">Categories</h3>
            <button
              type="button"
              onClick={() => setFilter('category', '')}
              className={`block w-full text-left py-2 px-3 rounded-xl text-sm transition-colors ${!category ? 'bg-accent/20 text-accent font-medium' : 'text-neutral-400 hover:text-accent'}`}
            >
              All
            </button>
            {displayCategories.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setFilter('category', c.slug || c._id)}
                className={`block w-full text-left py-2 px-3 rounded-xl text-sm transition-colors ${(category === c._id || category === c.slug) ? 'bg-accent/20 text-accent font-medium' : 'text-neutral-400 hover:text-accent'} ${c.parent ? 'pl-5' : ''}`}
              >
                {c.parent ? '↳ ' : ''}{c.name}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h1 className="font-display text-xl font-semibold text-neutral-100">{categoryName}</h1>
            <div className="flex items-center gap-3">
              {!loading && total > 0 && <span className="text-sm text-neutral-500">{((page - 1) * 12) + 1}-{Math.min(page * 12, total)} of {total}</span>}
              <select
                value={sort}
                onChange={(e) => setFilter('sort', e.target.value)}
                className="px-3 py-2 rounded-xl border border-surface-700 bg-surface-800 text-neutral-200 text-sm focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none"
              >
                <option value="">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="min-h-[20rem] bg-surface-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-neutral-500 py-12">No products found.</p>
          ) : (
            <>
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4" variants={container} initial="hidden" animate="visible">
                {products.map((p) => (
                  <motion.div key={p._id} variants={item} className="w-full h-full min-h-0 flex">
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </motion.div>
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setSearchParams((p) => { p.set('page', page - 1); return p; })}
                    className="px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-800 text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent/50 transition-colors"
                  >
                    Prev
                  </button>
                  <span className="flex items-center px-4 text-neutral-400 text-sm">Page {page} of {pages}</span>
                  <button
                    type="button"
                    disabled={page >= pages}
                    onClick={() => setSearchParams((p) => { p.set('page', page + 1); return p; })}
                    className="px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-800 text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent/50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
