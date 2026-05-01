import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';
import { compressPaymentScreenshot } from '../utils/compressScreenshot';
import { getApiOrigin } from '../utils/apiOrigin';

const PAYMENT_QR_SRC = '/payment-upi-qr.png';
const FASHION_HINTS = ['fashion', 'cloth', 'wear', 'hoodie', 'tshirt', 'shirt', 'pant', 'shoe'];

function isFashionItem(product) {
  const slug = String(product?.category?.slug || '').toLowerCase();
  const categoryName = String(product?.category?.name || '').toLowerCase();
  return FASHION_HINTS.some((hint) => slug.includes(hint) || categoryName.includes(hint));
}

export default function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const requiresShipping = items.some((i) => isFashionItem(i.product));
  const [loading, setLoading] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [paymentScreenshotName, setPaymentScreenshotName] = useState('');
  const [playerUserId, setPlayerUserId] = useState('');
  const [inGameName, setInGameName] = useState('');
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Screenshot size should be less than 2MB');
      return;
    }
    (async () => {
      try {
        const compressed = await compressPaymentScreenshot(file);
        setPaymentScreenshot(compressed);
        setPaymentScreenshotName(file.name.replace(/\.[^.]+$/, '') + '.jpg');
      } catch (_) {
        const reader = new FileReader();
        reader.onload = () => {
          setPaymentScreenshot(String(reader.result || ''));
          setPaymentScreenshotName(file.name);
        };
        reader.readAsDataURL(file);
      }
    })();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (!playerUserId.trim() || !inGameName.trim()) {
      toast.error('Please enter your player user ID and in-game name');
      return;
    }
    if (!paymentScreenshot) {
      toast.error('Please upload payment screenshot for confirmation');
      return;
    }
    setLoading(true);
    try {
      if (paymentScreenshot.length > 1_600_000) {
        toast.error('Screenshot still too large after compression — try another image.');
        setLoading(false);
        return;
      }
      const orderItems = items.map((i) => ({ product: i.product._id, qty: i.qty }));
      const { data: order } = await api.post('/orders', {
        orderItems,
        shippingAddress: requiresShipping
          ? form
          : {
              fullName: form.fullName,
              email: form.email,
              phone: form.phone,
              address: '',
              city: '',
              state: '',
              zip: '',
              country: '',
            },
        requiresShipping,
        paymentMethod: 'manual_qr',
        paymentConfirmation: {
          playerUserId: playerUserId.trim(),
          inGameName: inGameName.trim(),
          screenshotData: paymentScreenshot,
          screenshotName: paymentScreenshotName,
        },
        // eSewa integration placeholder (for later):
        // paymentMethod: 'esewa',
        // esewa: { productCode: 'EPAYTEST', amount: cartTotal }
      });
      clearCart();
      toast.success('Order placed successfully. Invoice is being emailed (check spam if needed).');
      navigate('/order-success?orderId=' + order._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    }
    setLoading(false);
  };

  if (items.length === 0 && !loading) {
    navigate('/cart');
    return null;
  }

  const inputClass = 'input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100 placeholder:text-neutral-500';
  const labelClass = 'block text-sm font-medium text-neutral-300 mb-1';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-semibold text-neutral-100 mb-2">Checkout</h1>
      <p className="text-sm text-neutral-500 mb-6">
        {requiresShipping ? 'Delivery details + payment confirmation' : 'Quick checkout for digital top-up'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-2xl border border-surface-700 bg-surface-800/50 p-5 space-y-4">
          <h2 className="font-display text-accent text-sm font-semibold uppercase tracking-wider">
            Step 1: Your details
          </h2>
          <div>
            <label htmlFor="checkout-fullName" className={labelClass}>Full name</label>
            <input id="checkout-fullName" type="text" name="fullName" autoComplete="name" value={form.fullName} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="checkout-email" className={labelClass}>Email</label>
            <input id="checkout-email" type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="checkout-phone" className={labelClass}>Phone (optional)</label>
            <input id="checkout-phone" type="text" name="phone" autoComplete="tel" value={form.phone} onChange={handleChange} className={inputClass} />
          </div>
          {requiresShipping ? (
            <>
              <div>
                <label htmlFor="checkout-address" className={labelClass}>Address</label>
                <input id="checkout-address" type="text" name="address" autoComplete="street-address" value={form.address} onChange={handleChange} required className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-city" className={labelClass}>City</label>
                  <input id="checkout-city" type="text" name="city" autoComplete="address-level2" value={form.city} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label htmlFor="checkout-country" className={labelClass}>Country</label>
                  <input id="checkout-country" type="text" name="country" autoComplete="country-name" value={form.country} onChange={handleChange} required className={inputClass} />
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              No address needed for digital products like diamonds/subscriptions.
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-surface-700 bg-surface-800/50 p-5 flex justify-between items-center">
          <span className="text-neutral-400">Order total</span>
          <span className="text-accent font-bold text-xl">{formatPrice(cartTotal, items[0]?.product?.currency)}</span>
        </div>
        <div className="rounded-2xl border border-surface-700 bg-surface-800/50 p-5 space-y-4">
          <h2 className="font-display text-accent text-sm font-semibold uppercase tracking-wider">Step 2: Payment confirmation</h2>
          <p className="text-sm text-neutral-400">
            Scan the QR, pay the exact order total shown above, enter your player user ID and in-game name below—use the same values in your payment remark or note when prompted, then upload your payment screenshot.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div>
              <div className="rounded-xl bg-white p-3">
                <img src={PAYMENT_QR_SRC} alt="UPI payment QR code" className="w-44 h-44 object-contain" />
              </div>
            </div>
            <div className="w-full space-y-3">
              <div>
                <label htmlFor="checkout-playerUserId" className={labelClass}>Player user ID</label>
                <input
                  id="checkout-playerUserId"
                  type="text"
                  value={playerUserId}
                  onChange={(e) => setPlayerUserId(e.target.value)}
                  placeholder="Your in-game user ID"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-inGameName" className={labelClass}>In-game name (IGN)</label>
                <input
                  id="checkout-inGameName"
                  type="text"
                  value={inGameName}
                  onChange={(e) => setInGameName(e.target.value)}
                  placeholder="Your in-game name"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="checkout-paymentProof" className={labelClass}>Payment screenshot</label>
                <input
                  id="checkout-paymentProof"
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  required
                  className="block w-full text-sm text-neutral-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-accent file:text-black file:font-semibold hover:file:bg-accent-light"
                />
                {paymentScreenshotName ? <p className="text-xs text-neutral-500 mt-1">Selected: {paymentScreenshotName}</p> : null}
              </div>
            </div>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors disabled:opacity-70">
          {loading ? 'Processing...' : 'Step 3: Confirm payment & place order'}
        </button>
      </form>
    </div>
  );
}
