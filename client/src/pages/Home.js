import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const sectionVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function ProductRow({ title, to, products, loading }) {
  const gridClass = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';
  return (
    <motion.section variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-display text-lg sm:text-xl font-semibold text-neutral-100">{title}</h2>
        {to && (
          <Link to={to} className="text-sm font-medium text-accent hover:text-accent-light transition-colors">
            View all
          </Link>
        )}
      </div>
      {loading ? (
        <div className={gridClass}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-h-[20rem] bg-surface-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-neutral-500 py-8">No products yet.</p>
      ) : (
        <motion.div
          className={gridClass}
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20px' }}
        >
          {products.map((p) => (
            <motion.div key={p._id} variants={item} className="w-full h-full min-h-0 flex">
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [hotDeals, setHotDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingHotDeals, setLoadingHotDeals] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    api.get('/products?featured=true&limit=6').then((r) => setFeatured(r.data.products || [])).catch(() => setFeatured([])).finally(() => setLoadingFeatured(false));
  }, []);

  useEffect(() => {
    api.get('/products?hotDeal=true&limit=4').then((r) => setHotDeals(r.data.products || [])).catch(() => setHotDeals([])).finally(() => setLoadingHotDeals(false));
  }, []);

  const allowedCategorySlugs = ['free-fire-diamonds', 'free-fire-subscriptions', 'fashion'];
  const mainCategories = categories
    .filter((c) => allowedCategorySlugs.includes(c.slug))
    .sort((a, b) => allowedCategorySlugs.indexOf(a.slug) - allowedCategorySlugs.indexOf(b.slug));

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data || [])).catch(() => setCategories([])).finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    const allowed = ['free-fire-diamonds', 'free-fire-subscriptions', 'fashion'];
    const main = categories.filter((c) => allowed.includes(c.slug)).sort((a, b) => allowed.indexOf(a.slug) - allowed.indexOf(b.slug));
    if (main.length === 0) return;
    const slugs = main.slice(0, 3).map((c) => c.slug).filter(Boolean);
    slugs.forEach((slug) => {
      api.get(`/products?category=${slug}&limit=6`).then((r) => {
        setCategoryProducts((prev) => ({ ...prev, [slug]: r.data.products || [] }));
      }).catch(() => setCategoryProducts((prev) => ({ ...prev, [slug]: [] })));
    });
  }, [categories]);

  return (
    <motion.div className="space-y-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <HeroCarousel />
      </motion.div>

      <motion.section
        className="rounded-2xl border border-accent/30 bg-gradient-to-r from-surface-800/90 via-surface-900 to-surface-800/90 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center gap-4">
          <motion.span className="text-3xl" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>💎</motion.span>
          <div>
            <h2 className="font-display text-lg font-semibold text-neutral-100">Free Fire Rate List</h2>
            <p className="text-sm text-neutral-300">Instant top-up for diamonds and memberships at the best rate in RS.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/products?category=free-fire-diamonds" className="px-4 py-2.5 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors text-sm">Diamonds</Link>
          <Link to="/products?category=free-fire-subscriptions" className="px-4 py-2.5 border border-surface-600 text-neutral-200 font-medium rounded-xl hover:border-accent hover:text-accent transition-colors text-sm">Subscriptions</Link>
        </div>
      </motion.section>

      <motion.section
        className="rounded-2xl border border-surface-700 bg-surface-900/70 p-5 sm:p-6"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h2 className="font-display text-lg sm:text-xl font-semibold text-neutral-100 mb-4">How Shield works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Pick your item', desc: 'Choose diamonds, passes, or fashion from clear categories.', icon: '🎯' },
            { step: '2', title: 'Secure checkout', desc: 'Add to cart and finish checkout in a few taps.', icon: '🛒' },
            { step: '3', title: 'Get it fast', desc: 'Track your order status from your profile and orders page.', icon: '⚡' },
          ].map((card) => (
            <div key={card.step} className="rounded-xl border border-surface-700 bg-surface-800/80 p-4">
              <p className="text-xs text-accent font-semibold tracking-wider mb-1">STEP {card.step}</p>
              <p className="text-xl mb-2">{card.icon}</p>
              <h3 className="text-neutral-100 font-medium">{card.title}</h3>
              <p className="text-sm text-neutral-400 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {loadingCategories ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : mainCategories.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-neutral-100 mb-4">Shop by category</h2>
          <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-4" variants={container} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {mainCategories.map((c) => (
              <motion.div key={c._id} variants={item}>
                <Link
                  to={`/products?category=${c.slug || c._id}`}
                  className="block rounded-2xl border border-surface-700 bg-surface-800 p-5 text-center hover:border-accent/50 hover:shadow-card-hover transition-all"
                >
                  <span className="text-3xl">{c.slug === 'free-fire-diamonds' ? '💎' : c.slug === 'free-fire-subscriptions' ? '🎫' : '👕'}</span>
                  <p className="font-medium text-neutral-200 mt-2">{c.name}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      <ProductRow title="Featured products" to="/products?featured=true" products={featured} loading={loadingFeatured} />

      <ProductRow title="Hot deals" to="/products?sort=-discountPercent" products={hotDeals} loading={loadingHotDeals} />

      {mainCategories.slice(0, 2).map((c) => (
        <ProductRow
          key={c._id}
          title={c.name}
          to={`/products?category=${c.slug || c._id}`}
          products={categoryProducts[c.slug] || []}
          loading={categoryProducts[c.slug] === undefined && mainCategories.length > 0}
        />
      ))}

    </motion.div>
  );
}
