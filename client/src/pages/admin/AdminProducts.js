import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import ImageChooser from '../../components/admin/ImageChooser';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', price: '', compareAtPrice: '', discountPercent: '', image: '', category: '', stock: '0', featured: false, hotDeal: false });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ compareAtPrice: '', discountPercent: '' });
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data || [])).catch(() => setCategories([]));
  }, []);

  const loadProducts = () => {
    setLoading(true);
    api.get('/products?limit=100').then((r) => setProducts(r.data.products || [])).catch(() => setProducts([])).finally(() => setLoading(false));
  };

  useEffect(() => loadProducts(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', {
        name: form.name,
        description: form.description || undefined,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
        discountPercent: form.discountPercent ? Math.min(100, Math.max(0, parseFloat(form.discountPercent))) : undefined,
        image: form.image || undefined,
        category: form.category,
        stock: parseInt(form.stock, 10) || 0,
        featured: !!form.featured,
        hotDeal: !!form.hotDeal,
      });
      toast.success('Product added');
      setForm({ name: '', description: '', price: '', compareAtPrice: '', discountPercent: '', image: '', category: '', stock: '0', featured: false, hotDeal: false });
      loadProducts();
    } catch (err) {
      toast.error(err.response && err.response.data && err.response.data.message ? err.response.data.message : 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete('/products/' + id);
      toast.success('Deleted');
      loadProducts();
    } catch (_) {
      toast.error('Failed');
    }
  };

  const startEdit = (p) => {
    setOpenMenuId(null);
    setEditingId(p._id);
    setEditForm({
      compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
      discountPercent: p.discountPercent != null ? String(p.discountPercent) : '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ compareAtPrice: '', discountPercent: '' });
  };

  const handleEditSubmit = async (id) => {
    try {
      await api.put('/products/' + id, {
        compareAtPrice: editForm.compareAtPrice === '' ? undefined : parseFloat(editForm.compareAtPrice),
        discountPercent: editForm.discountPercent === '' ? undefined : Math.min(100, Math.max(0, parseFloat(editForm.discountPercent) || 0)),
      });
      toast.success('Discount updated');
      setEditingId(null);
      setEditForm({ compareAtPrice: '', discountPercent: '' });
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const toggleFlag = async (product, key) => {
    try {
      await api.put('/products/' + product._id, { [key]: !product[key] });
      toast.success(`${key === 'hotDeal' ? 'Hot deal' : 'Featured'} updated`);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const getDiscountLabel = (product) => {
    if (product.discountPercent != null) return `${product.discountPercent}% OFF`;
    if (product.compareAtPrice > product.price) return 'Sale price';
    return 'No discount';
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Products</h1>
      <p className="text-slate-600 mb-6">Add products with discount and images. You can paste an image URL or choose a local image file.</p>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Category *</label><select value={form.category} onChange={(e) => update('category', e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"><option value="">Select</option>{categories.map((c) => <option key={c._id} value={c._id}>{c.parent ? `  ${c.name}` : c.name}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Price *</label><input type="number" step="0.01" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Compare at price</label><input type="number" step="0.01" min="0" value={form.compareAtPrice} onChange={(e) => update('compareAtPrice', e.target.value)} placeholder="Optional" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Discount %</label><input type="number" min="0" max="100" value={form.discountPercent} onChange={(e) => update('discountPercent', e.target.value)} placeholder="e.g. 20" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1">Stock</label><input type="number" min="0" value={form.stock} onChange={(e) => update('stock', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800" /></div>
        <div className="md:col-span-2">
          <ImageChooser
            label="Product image"
            value={form.image}
            onChange={(val) => update('image', val)}
            helperText="Tip: local image is stored as base64 string. Use optimized images for better performance."
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor="feat" className="text-sm text-slate-700 flex items-center gap-2">
            <input type="checkbox" id="feat" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="rounded border-slate-300" />
            Featured
          </label>
          <label htmlFor="hotDeal" className="text-sm text-slate-700 flex items-center gap-2">
            <input type="checkbox" id="hotDeal" checked={form.hotDeal} onChange={(e) => update('hotDeal', e.target.checked)} className="rounded border-slate-300" />
            Hot Deal
          </label>
        </div>
        <div><button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Add Product</button></div>
      </form>
      {loading ? <p className="text-slate-500">Loading...</p> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Total products: <span className="font-semibold text-slate-800">{products.length}</span>
            </p>
            <p className="text-xs text-slate-500">Prices shown in NPR</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 w-16">Image</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Name</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Price</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Discount</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Tags</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Category</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Stock</th>
                  <th className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-slate-100 hover:bg-indigo-50/40 transition-colors">
                    <td className="p-3">{p.image ? <img src={p.image} alt="" className="w-12 h-12 object-cover rounded border border-slate-200" /> : <span className="text-slate-400 text-xs">—</span>}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{p.name}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-800">{formatPrice(p.price)}</p>
                      {p.compareAtPrice > p.price ? <p className="text-xs text-slate-400 line-through">{formatPrice(p.compareAtPrice)}</p> : null}
                    </td>
                    <td className="p-3">
                      {editingId === p._id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input type="number" min="0" max="100" placeholder="%" value={editForm.discountPercent} onChange={(e) => setEditForm((f) => ({ ...f, discountPercent: e.target.value }))} className="w-14 px-2 py-1 rounded border border-slate-300 text-slate-800 text-sm" />
                          <input type="number" step="0.01" min="0" placeholder="Compare" value={editForm.compareAtPrice} onChange={(e) => setEditForm((f) => ({ ...f, compareAtPrice: e.target.value }))} className="w-20 px-2 py-1 rounded border border-slate-300 text-slate-800 text-sm" />
                        </div>
                      ) : (
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${p.discountPercent != null || p.compareAtPrice > p.price ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {getDiscountLabel(p)}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-slate-700">
                      <div className="flex flex-wrap gap-1">
                        {p.featured && <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">Featured</span>}
                        {p.hotDeal && <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700">Hot Deal</span>}
                        {!p.featured && !p.hotDeal && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 text-sm">{p.category?.name}</td>
                    <td className="p-3 text-slate-600">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="p-3">
                      {editingId === p._id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => handleEditSubmit(p._id)} className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700">Save</button>
                          <button type="button" onClick={cancelEdit} className="px-2.5 py-1 rounded-md border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50">Cancel</button>
                        </div>
                      ) : (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setOpenMenuId((prev) => (prev === p._id ? null : p._id))}
                            className="h-8 w-8 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-100 text-lg leading-none"
                            aria-label="More actions"
                          >
                            ⋯
                          </button>
                          {openMenuId === p._id ? (
                            <div className="absolute right-0 top-9 z-20 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                              <button type="button" onClick={() => startEdit(p)} className="w-full text-left px-3 py-2 text-sm text-indigo-700 hover:bg-indigo-50">Edit discount</button>
                              <button type="button" onClick={() => { setOpenMenuId(null); toggleFlag(p, 'featured'); }} className="w-full text-left px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50">{p.featured ? 'Unfeature' : 'Feature'}</button>
                              <button type="button" onClick={() => { setOpenMenuId(null); toggleFlag(p, 'hotDeal'); }} className="w-full text-left px-3 py-2 text-sm text-rose-700 hover:bg-rose-50">{p.hotDeal ? 'Remove deal' : 'Mark deal'}</button>
                              <button type="button" onClick={() => { setOpenMenuId(null); handleDelete(p._id); }} className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50">Delete</button>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
