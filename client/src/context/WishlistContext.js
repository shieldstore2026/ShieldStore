import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const WISHLIST_KEY = 'shield-wishlist';

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(productIds));
  }, [productIds]);

  const isInWishlist = (id) => productIds.includes(id);

  const toggleWishlist = (id) => {
    if (!user) return false;
    setProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    return true;
  };

  const addToWishlist = (id) => {
    if (!user) return false;
    if (!productIds.includes(id)) setProductIds((prev) => [...prev, id]);
    return true;
  };

  const removeFromWishlist = (id) => {
    setProductIds((prev) => prev.filter((p) => p !== id));
  };

  return (
    <WishlistContext.Provider
      value={{
        productIds,
        wishlistCount: productIds.length,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        canUseWishlist: !!user,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
