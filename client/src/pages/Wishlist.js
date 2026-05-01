import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

export default function Wishlist() {
  const { productIds } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const idsKey = productIds.join(',');

  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    api.get('/products?ids=' + idsKey).then((r) => setProducts(r.data.products || [])).catch(() => setProducts([])).finally(() => setLoading(false));
  }, [idsKey, productIds.length]);

  if (loading) return <div className="py-12 text-center text-neutral-400">Loading...</div>;
  if (products.length === 0) return <div className="py-12 text-center text-neutral-400">Your wishlist is empty.</div>;

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-neutral-100 mb-6">Wishlist</h1>
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" variants={container} initial="hidden" animate="visible">
        {products.map((p) => (
          <motion.div key={p._id} variants={item} className="w-full h-full min-h-0 flex">
            <ProductCard product={p} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
