import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { formatPrice } from '../utils/formatPrice';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data)).catch(() => setOrders([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-neutral-400">Loading...</div>;

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-neutral-100 mb-6">Order History</h1>
      {orders.length === 0 ? (
        <p className="text-neutral-500">No orders yet. <Link to="/products" className="text-accent hover:text-accent-light transition-colors">Shop now</Link></p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="p-5 rounded-2xl border border-surface-700 bg-surface-800">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                <span className="font-mono text-sm text-neutral-400">{order._id.slice(-8)}</span>
                <span className="text-sm text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-surface-700 text-neutral-300">{order.status}</span>
              </div>
              <p className="text-neutral-200">Total: {formatPrice(order.totalPrice)}</p>
              <p className="text-sm text-neutral-500">{order.orderItems?.length} items</p>
              <div className="mt-3 text-sm text-neutral-400 space-y-1">
                <p>
                  Payment method: <span className="text-neutral-200 capitalize">{(order.paymentMethod || 'manual_qr').replace('_', ' ')}</span>
                </p>
                <p>
                  Payment proof: {order.paymentConfirmation?.screenshotData ? <span className="text-emerald-400">Submitted</span> : <span className="text-amber-400">Not submitted</span>}
                </p>
                {order.paymentConfirmation?.playerUserId ? (
                  <p>Player user ID: <span className="text-neutral-200">{order.paymentConfirmation.playerUserId}</span></p>
                ) : null}
                {order.paymentConfirmation?.inGameName ? (
                  <p>In-game name: <span className="text-neutral-200">{order.paymentConfirmation.inGameName}</span></p>
                ) : null}
                {order.paymentConfirmation?.transactionId && !order.paymentConfirmation?.playerUserId ? (
                  <p>Reference: <span className="text-neutral-200">{order.paymentConfirmation.transactionId}</span></p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
