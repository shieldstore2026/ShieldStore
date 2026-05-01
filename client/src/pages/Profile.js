import React, { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || {},
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'street' || name === 'city' || name === 'state' || name === 'zip' || name === 'country') {
      setForm((f) => ({ ...f, address: { ...f.address, [name]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      setUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100 placeholder:text-neutral-500 focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none';

  return (
    <div className="max-w-3xl">
      <div className="rounded-2xl border border-surface-700 bg-surface-800/70 p-5 sm:p-7 mb-6">
        <div className="flex items-center gap-4 justify-between flex-wrap">
          <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/30 text-accent flex items-center justify-center font-bold text-lg">
            {(form.name || user?.name || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-neutral-100">My Profile</h1>
            <p className="text-sm text-neutral-400">{user?.email}</p>
          </div>
        </div>
          <span className="text-xs px-3 py-1 rounded-full border border-surface-600 text-neutral-300">
            Keep this updated for faster checkout
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-700 bg-surface-800/60 p-5 sm:p-7 space-y-7">
        <div>
          <h2 className="text-neutral-100 font-semibold mb-1">Personal details</h2>
          <p className="text-sm text-neutral-500 mb-4">These details are used in your order confirmation and support updates.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm text-neutral-400 mb-1.5">Full name</label>
            <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Phone</label>
            <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Country</label>
            <input type="text" name="country" placeholder="Country" value={form.address?.country || ''} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        </div>

        <div>
        <h2 className="text-neutral-100 font-semibold mb-1">Address</h2>
        <p className="text-sm text-neutral-500 mb-4">For fashion item delivery only. You can skip this if you buy digital diamonds/subscriptions.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm text-neutral-400 mb-1.5">Street</label>
            <input type="text" name="street" placeholder="Street" value={form.address?.street || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">City</label>
            <input type="text" name="city" placeholder="City" value={form.address?.city || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">State / Province</label>
            <input type="text" name="state" placeholder="State / Province" value={form.address?.state || ''} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">ZIP / Postal code</label>
            <input type="text" name="zip" placeholder="ZIP / Postal code" value={form.address?.zip || ''} onChange={handleChange} className={inputClass} />
          </div>
        </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors disabled:opacity-70">
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
