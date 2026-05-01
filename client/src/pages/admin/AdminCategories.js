import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/categories').then((r) => setCategories(r.data)).catch(() => setCategories([])).finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const mainCategories = categories.filter((c) => !c.parent);
  const getCategoryName = (id) => categories.find((c) => c._id === id)?.name || '—';

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    try {
      await api.post('/categories', { name: categoryName.trim() });
      toast.success('Category added');
      setCategoryName('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!subcategoryName.trim()) return;
    if (!subcategoryCategoryId) {
      toast.error('Please select a category');
      return;
    }
    try {
      await api.post('/categories', { name: subcategoryName.trim(), parent: subcategoryCategoryId });
      toast.success('Subcategory added');
      setSubcategoryName('');
      setSubcategoryCategoryId('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete('/categories/' + id);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error('Failed');
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <div className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-emerald-900 to-cyan-900 text-white">
        <h1 className="text-2xl font-bold mb-1">Category Builder</h1>
        <p className="text-emerald-100">Organize your store with clear categories and nested subcategories.</p>
      </div>

      {/* Add Category form */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Add Category</h2>
        <form onSubmit={handleAddCategory} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="e.g. Headsets"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
            Add Category
          </button>
        </form>
      </div>

      {/* Add Subcategory form */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-4 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Add Subcategory</h2>
        <form onSubmit={handleAddSubcategory} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              type="text"
              placeholder="e.g. Wireless"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={subcategoryCategoryId}
              onChange={(e) => setSubcategoryCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
            >
              <option value="">Select category</option>
              {mainCategories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
            Add Subcategory
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 text-left text-sm font-semibold text-slate-700">Name</th>
              <th className="p-3 text-left text-sm font-semibold text-slate-700">Type</th>
              <th className="p-3 text-left text-sm font-semibold text-slate-700">Under</th>
              <th className="p-3 text-left text-sm font-semibold text-slate-700">Slug</th>
              <th className="p-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 text-slate-800 font-medium">{c.name}</td>
                <td className="p-3 text-slate-600">{c.parent ? 'Subcategory' : 'Category'}</td>
                <td className="p-3 text-slate-600">{c.parent ? getCategoryName(c.parent?._id || c.parent) : '—'}</td>
                <td className="p-3 text-slate-500 text-sm">{c.slug}</td>
                <td className="p-3">
                  <button type="button" onClick={() => handleDelete(c._id)} className="text-red-600 hover:underline text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
