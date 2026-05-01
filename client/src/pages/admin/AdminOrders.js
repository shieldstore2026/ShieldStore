import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    api.get(`/orders?page=${page}&limit=${limit}`)
      .then((r) => {
        setOrders(r.data?.orders || []);
        setPages(r.data?.pages || 1);
        setTotal(r.data?.total || 0);
      })
      .catch(() => {
        setOrders([]);
        setPages(1);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const updateStatus = async (id, status) => {
    try {
      await api.put('/orders/' + id + '/status', { status });
      toast.success('Updated');
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    } catch (_) {
      toast.error('Failed');
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <div className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
        <h1 className="text-2xl font-bold mb-1">Order Management</h1>
        <p className="text-indigo-100">Track payment proofs and update delivery progress.</p>
      </div>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="p-3 text-left text-sm font-semibold text-slate-700">ID</th><th className="p-3 text-left text-sm font-semibold text-slate-700">Customer</th><th className="p-3 text-left text-sm font-semibold text-slate-700">Date</th><th className="p-3 text-left text-sm font-semibold text-slate-700">Total</th><th className="p-3 text-left text-sm font-semibold text-slate-700">Payment</th><th className="p-3 text-left text-sm font-semibold text-slate-700">Status</th><th className="p-3 text-left text-sm font-semibold text-slate-700">Change</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-mono text-sm text-slate-600">{o._id ? o._id.slice(-8) : ''}</td>
                  <td className="p-3 text-sm text-slate-700">
                    <p className="font-medium text-slate-800">{o.user?.name || o.shippingAddress?.fullName || 'Guest'}</p>
                    {o.user?.email ? <p className="text-xs text-slate-500">{o.user.email}</p> : null}
                  </td>
                  <td className="p-3 text-slate-700">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                  <td className="p-3 font-medium text-slate-800">{o.totalPrice != null ? formatPrice(o.totalPrice) : ''}</td>
                  <td className="p-3 text-sm text-slate-700">
                    <div className="space-y-1">
                      <p className="capitalize">{o.paymentMethod || 'manual_qr'}</p>
                      {o.paymentConfirmation?.playerUserId ? (
                        <p className="text-xs text-slate-500">UID: {o.paymentConfirmation.playerUserId}</p>
                      ) : null}
                      {o.paymentConfirmation?.inGameName ? (
                        <p className="text-xs text-slate-500">IGN: {o.paymentConfirmation.inGameName}</p>
                      ) : null}
                      {o.paymentConfirmation?.transactionId && !o.paymentConfirmation?.playerUserId ? (
                        <p className="text-xs text-slate-500">Txn: {o.paymentConfirmation.transactionId}</p>
                      ) : null}
                      {o.paymentConfirmation?.screenshotData ? (
                        <button type="button" onClick={() => setPreviewImage(o.paymentConfirmation.screenshotData)} className="inline-block">
                          <img src={o.paymentConfirmation.screenshotData} alt="Payment screenshot" className="w-14 h-14 object-cover rounded border border-slate-200" />
                        </button>
                      ) : (
                        <p className="text-xs text-amber-600">No screenshot</p>
                      )}
                    </div>
                  </td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">{o.status}</span></td>
                  <td className="p-3">
                    <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-300 text-slate-800 text-sm">
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
        <p className="text-slate-600">Showing page {page} of {pages} ({total} orders)</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
      {previewImage ? (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button type="button" onClick={() => setPreviewImage('')} className="absolute -top-10 right-0 h-9 px-3 rounded-lg bg-white/90 text-slate-900 font-semibold">
              Close
            </button>
            <img src={previewImage} alt="Payment proof preview" className="w-full max-h-[85vh] object-contain rounded-xl border border-white/20 bg-black/30" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
