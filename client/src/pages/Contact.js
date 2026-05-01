import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent. We will contact you soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl border border-surface-700 bg-surface-800/70 p-6 mb-6">
        <h1 className="font-display text-2xl text-neutral-100 font-semibold mb-2">Contact Us</h1>
        <p className="text-neutral-400">Need help with order, payment, or delivery? Send us a message.</p>
      </div>
      <form onSubmit={onSubmit} className="rounded-2xl border border-surface-700 bg-surface-800/60 p-6 space-y-4">
        <input name="name" value={form.name} onChange={onChange} required placeholder="Full name" className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100" />
        <input name="email" value={form.email} onChange={onChange} type="email" required placeholder="Email" className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100" />
        <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone (optional)" className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100" />
        <textarea name="message" value={form.message} onChange={onChange} required rows={5} placeholder="Write your message..." className="input-ring w-full px-4 py-2.5 rounded-xl border border-surface-700 bg-surface-900 text-neutral-100" />
        <button disabled={loading} className="btn-primary px-6 py-2.5 bg-accent text-black font-semibold rounded-xl hover:bg-accent-light transition-colors">
          {loading ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </div>
  );
}
