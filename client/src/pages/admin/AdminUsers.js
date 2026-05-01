import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users').then((r) => setUsers(r.data || [])).catch(() => setUsers([])).finally(() => setLoading(false));
  }, []);

  const setRole = async (id, role) => {
    try {
      await api.put('/users/' + id + '/role', { role });
      toast.success('Updated');
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    } catch (_) {
      toast.error('Failed');
    }
  };

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <div className="mb-6 rounded-2xl p-5 bg-gradient-to-r from-fuchsia-900 to-indigo-900 text-white">
        <h1 className="text-2xl font-bold mb-1">User Access Control</h1>
        <p className="text-fuchsia-100">Promote trusted members and manage admin permissions safely.</p>
      </div>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 text-left text-sm font-semibold text-slate-700">Name</th>
              <th className="p-3 text-left text-sm font-semibold text-slate-700">Email</th>
              <th className="p-3 text-left text-sm font-semibold text-slate-700">Role</th>
              <th className="p-3 text-left text-sm font-semibold text-slate-700">Change</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{u.name}</td>
                  <td className="p-3 text-slate-600">{u.email}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>{u.role}</span></td>
                  <td className="p-3">
                    <select value={u.role} onChange={(e) => setRole(u._id, e.target.value)} className="px-2 py-1.5 rounded-lg border border-slate-300 text-slate-800 text-sm">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
