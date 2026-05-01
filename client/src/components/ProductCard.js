import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';

function StarRating({ rating = 4.5 }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < full; i++) stars.push('★');
  if (hasHalf) stars.push('½');
  while (stars.length < 5) stars.push('☆');
  return (
    <span className="text-amber-400/90 text-xs" title={`${rating} out of 5`}>
      {stars.slice(0, 5).join('')}
    </span>
  );
}

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [imgError, setImgError] = React.useState(false);
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    const ok = addItem(product, 1);
    if (!ok) {
      toast.error('Please sign in to add items to cart');
      window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
      return;
    }
    toast.success('Added to cart');
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    const ok = toggleWishlist(product._id);
    if (!ok) {
      toast.error('Please sign in to use wishlist');
      window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
      return;
    }
    toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const rating = 3.5 + (product._id?.charCodeAt?.(0) % 15) / 10;
  const hasDiscount = product.discountPercent > 0 || (product.compareAtPrice != null && product.compareAtPrice > product.price);
  const discountLabel = product.discountPercent > 0 ? `${product.discountPercent}% OFF` : hasDiscount ? 'Sale' : null;
  const categorySlug = product.category?.slug || (typeof product.category === 'string' ? '' : '');
  const showFreeDelivery = categorySlug !== 'free-fire-diamonds' && categorySlug !== 'free-fire-subscriptions';

  return (
    <motion.div
      className="group relative flex flex-col w-full h-full min-h-[20rem] max-w-full bg-gradient-to-b from-surface-800 to-surface-900 border border-surface-700 rounded-2xl overflow-hidden ring-1 ring-white/5 hover:border-accent/35 hover:ring-accent/25 hover:shadow-accent-lg hover:shadow-card-hover transition-all duration-300"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/products/${product._id}`} className="flex flex-col flex-1 min-h-0">
        <div className="relative w-full aspect-square bg-surface-900/80 p-3 shrink-0 overflow-hidden">
          {product.image && !imgError ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-surface-500 gap-1">
              <span className="text-4xl" aria-hidden>💎</span>
              <span className="text-xs font-medium text-center px-2 line-clamp-2">{product.name}</span>
            </div>
          )}
          {discountLabel && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-accent text-black text-xs font-semibold">
              {discountLabel}
            </span>
          )}
          <button
            type="button"
            onClick={handleWishlist}
            className="absolute top-2 right-2 w-9 h-9 rounded-xl bg-surface-800/90 border border-surface-700 flex items-center justify-center text-base hover:border-surface-600 transition-colors z-10"
            aria-label="Wishlist"
          >
            {inWishlist ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="p-3 flex flex-col flex-1 min-h-0">
          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">{product.category?.name}</p>
          <h3 className="font-medium text-neutral-100 line-clamp-2 text-sm group-hover:text-accent transition-colors leading-snug">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1">
            <StarRating rating={rating} />
            <span className="text-xs text-neutral-500">({(20 + (product._id?.length || 0))})</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
            <span className="text-accent font-semibold">{formatPrice(product.price, product.currency)}</span>
            {product.compareAtPrice != null && product.compareAtPrice > product.price && (
              <span className="text-xs text-neutral-500 line-through">{formatPrice(product.compareAtPrice, product.currency)}</span>
            )}
            {hasDiscount && product.discountPercent > 0 && (
              <span className="text-xs text-emerald-400 font-medium">Save {product.discountPercent}%</span>
            )}
          </div>
          {showFreeDelivery && <p className="text-xs text-emerald-400/90 mt-0.5">FREE delivery</p>}
        </div>
      </Link>
      <div className="p-3 pt-0 shrink-0">
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full py-2.5 bg-accent text-black font-semibold rounded-xl text-sm hover:bg-accent-light transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
