import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';
import ProductCard from '../components/ProductCard';
import Breadcrumbs from '../components/Breadcrumbs';

function StarRating({ rating = 4.5 }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < full; i++) stars.push('★');
  if (hasHalf) stars.push('½');
  while (stars.length < 5) stars.push('☆');
  return <span className="text-amber-400/90 text-lg">{stars.slice(0, 5).join('')}</span>;
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    api.get('/products/' + id).then((r) => setProduct(r.data)).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product?.category?._id) return;
    api.get(`/products?category=${product.category._id}&limit=5`).then((r) => {
      const list = (r.data.products || []).filter((p) => p._id !== product._id).slice(0, 4);
      setRelated(list);
    }).catch(() => setRelated([]));
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    const ok = addItem(product, qty);
    if (!ok) {
      toast.error('Please sign in to add items to cart');
      window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
      return;
    }
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (!product) return;
    const ok = addItem(product, qty);
    if (!ok) {
      toast.error('Please sign in to continue');
      window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
      return;
    }
    window.location.href = '/checkout';
  };

  if (loading) return <div className="py-12 text-center text-neutral-400">Loading...</div>;
  if (!product) return <div className="py-12 text-center text-neutral-400">Product not found.</div>;

  const inWishlist = isInWishlist(product._id);
  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const mainImg = images[mainImage] || product.image;
  const rating = 3.5 + (product._id?.charCodeAt?.(0) % 15) / 10;
  const hasDiscount = product.discountPercent > 0 || (product.compareAtPrice != null && product.compareAtPrice > product.price);
  const discountLabel = product.discountPercent > 0 ? `${product.discountPercent}% OFF` : hasDiscount ? 'Sale' : null;

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Breadcrumbs items={[
        { to: '/', label: 'Home' },
        { to: '/products', label: 'Products' },
        ...(product.category ? [{ to: `/products?category=${product.category.slug || product.category._id}`, label: product.category.name }] : []),
        { label: product.name },
      ]} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div className="space-y-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
          <div className="relative aspect-square bg-surface-800 rounded-2xl overflow-hidden flex items-center justify-center border border-surface-700">
            {mainImg ? (
              <img src={mainImg} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-6xl">🛡</span>
            )}
            {discountLabel && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-accent text-black text-sm font-semibold">
                {discountLabel}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <button key={i} type="button" onClick={() => setMainImage(i)} className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-colors ${i === mainImage ? 'border-accent' : 'border-surface-700 hover:border-surface-600'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <p className="text-accent text-xs uppercase tracking-wider font-medium">{product.category?.name}</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-neutral-100 mt-1">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={rating} />
            <span className="text-sm text-neutral-500">({(20 + (product._id?.length || 0))} ratings)</span>
          </div>
          <div className="mt-4 flex items-baseline gap-3 flex-wrap">
            <span className="text-accent font-bold text-2xl">{formatPrice(product.price, product.currency)}</span>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <span className="text-neutral-500 line-through text-lg">{formatPrice(product.compareAtPrice, product.currency)}</span>
            )}
            {product.discountPercent > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium">Save {product.discountPercent}%</span>
            )}
          </div>
          {product.category?.slug !== 'free-fire-diamonds' && product.category?.slug !== 'free-fire-subscriptions' && (
            <p className="text-sm text-emerald-400 mt-1">FREE delivery</p>
          )}
          <p className="text-neutral-400 mt-2 leading-relaxed">{product.description || 'No description.'}</p>

          <div className="mt-6 p-5 rounded-2xl border border-surface-700 bg-surface-800/50">
            <p className="text-sm text-emerald-400 font-medium">In Stock</p>
            <label className="block mt-3 text-neutral-400 text-sm">Qty</label>
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="mt-1 w-20 px-2 py-2 rounded-xl border border-surface-700 bg-surface-800 text-neutral-200 focus:ring-2 focus:ring-accent/50 outline-none">
              {Array.from({ length: Math.min(product.stock || 10, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-3 mt-4">
              <button type="button" onClick={handleAddToCart} className="px-6 py-3 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors">
                Add to Cart
              </button>
              <button type="button" onClick={handleBuyNow} className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors">
                Buy Now
              </button>
              <button type="button" onClick={() => { const ok = toggleWishlist(product._id); if (!ok) { toast.error('Please sign in to use wishlist'); window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } })); return; } toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist'); }} className="px-6 py-3 border border-surface-700 rounded-xl text-neutral-200 hover:border-accent hover:text-accent transition-colors">
                {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
          <h2 className="font-display text-lg font-semibold text-neutral-100 mb-4">Customers also viewed</h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
          >
            {related.map((p) => (
              <motion.div key={p._id} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} className="w-full h-full min-h-0 flex">
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}
    </motion.div>
  );
}
