import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center p-8 rounded-2xl border border-surface-700 bg-surface-800 max-w-md">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
        <h1 className="font-display text-xl font-semibold text-neutral-100 mb-2">Order Placed</h1>
        {orderId && <p className="text-neutral-400 text-sm mb-4">Order ID: {orderId}</p>}
        <p className="text-sm text-neutral-300">
          Your order has been submitted successfully. The invoice has been sent to your email.
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          You will also receive an email whenever admin updates your order status.
        </p>
        <Link to="/orders" className="inline-block mt-4 px-6 py-2.5 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors">View Orders</Link>
        <Link to="/" className="block mt-3 text-accent hover:text-accent-light transition-colors">Continue shopping</Link>
      </div>
    </div>
  );
}
