import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

export default function Cart() {
  const { items, cartCount, cartTotal, updateQty, removeItem } = useCart();

  if (cartCount === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-400 text-lg mb-4">Your cart is empty.</p>
        <Link to="/products" className="text-accent font-semibold hover:text-accent-light transition-colors">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {items.map(({ product, qty }) => (
          <div key={product._id} className="flex gap-4 p-4 rounded-2xl border border-surface-700 bg-surface-800">
            <div className="w-20 h-20 rounded-xl bg-surface-900 flex-shrink-0 overflow-hidden">
              {product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-surface-600">🛡</div>}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/products/${product._id}`} className="font-semibold text-neutral-100 hover:text-accent transition-colors">{product.name}</Link>
              <p className="text-accent font-semibold mt-0.5">{formatPrice(product.price, product.currency)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => updateQty(product._id, qty - 1)} className="w-9 h-9 rounded-xl border border-surface-700 bg-surface-800 text-neutral-200 hover:border-accent/50 transition-colors">−</button>
              <span className="w-8 text-center text-neutral-200 tabular-nums">{qty}</span>
              <button type="button" onClick={() => updateQty(product._id, qty + 1)} className="w-9 h-9 rounded-xl border border-surface-700 bg-surface-800 text-neutral-200 hover:border-accent/50 transition-colors">+</button>
            </div>
            <button type="button" onClick={() => removeItem(product._id)} className="text-red-400 hover:text-red-300 text-sm transition-colors">Remove</button>
          </div>
        ))}
      </div>
      <div className="lg:col-span-1">
        <div className="sticky top-24 p-6 rounded-2xl border border-surface-700 bg-surface-800">
          <h2 className="font-display text-sm font-semibold text-neutral-100 uppercase tracking-wider mb-4">Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</h2>
          <p className="text-neutral-400 text-lg"><span className="font-bold text-neutral-100 text-xl">{formatPrice(cartTotal, items[0]?.product?.currency)}</span></p>
          <Link to="/checkout" className="mt-4 block w-full py-3 text-center bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors">Proceed to Checkout</Link>
          <Link to="/products" className="mt-3 block w-full py-2.5 text-center border border-surface-700 rounded-xl text-neutral-300 hover:border-accent/50 hover:text-accent transition-colors text-sm">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
