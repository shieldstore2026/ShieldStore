import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { formatPrice } from '../../utils/formatPrice';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#0ea5e9', '#22c55e', '#f59e0b'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [orderStatus, setOrderStatus] = useState([]);
  const [categorySplit, setCategorySplit] = useState([]);
  const [ordersTrend, setOrdersTrend] = useState([]);

  useEffect(() => {
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const run = async () => {
      try {
        const [u, p, firstOrdersRes] = await Promise.all([
          api.get('/users'),
          api.get('/products?limit=50'),
          api.get('/orders?limit=100&page=1'),
        ]);

        /** Admin GET /orders returns { orders, total, pages, page }; user array is only for customer role */
        let allOrders = [];
        const ob = firstOrdersRes.data;
        if (Array.isArray(ob)) {
          allOrders = ob;
        } else {
          const pages = Math.max(1, Number(ob?.pages) || 1);
          allOrders = [...(ob?.orders ?? [])];
          for (let page = 2; page <= pages; page += 1) {
            const { data: body } = await api.get(`/orders?limit=100&page=${page}`);
            const chunk = Array.isArray(body) ? body : body?.orders ?? [];
            allOrders = allOrders.concat(chunk);
          }
        }

        const products = p.data?.products || [];
        const revenue = allOrders.reduce((sum, order) => sum + (Number(order.totalPrice) || 0), 0);
        const statusCount = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => ({
          label: status,
          value: allOrders.filter((order) => order.status === status).length,
        }));
        const categoryCountMap = products.reduce((acc, product) => {
          const name = product.category?.name || 'Uncategorized';
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});
        const categoryData = Object.entries(categoryCountMap)
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        const monthMap = allOrders.reduce((acc, order) => {
          const date = new Date(order.createdAt);
          const label = date.toLocaleString('en-US', { month: 'short' });
          if (!acc[label]) acc[label] = { label, orders: 0, revenue: 0 };
          acc[label].orders += 1;
          acc[label].revenue += Number(order.totalPrice) || 0;
          return acc;
        }, {});
        const trendData = Object.values(monthMap).sort((a, b) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label));

        const userList = Array.isArray(u.data) ? u.data : u.data?.users || [];
        const productTotal =
          typeof p.data?.total === 'number' ? p.data.total : products.length;

        const orderTotalCount = !Array.isArray(ob) && typeof ob?.total === 'number' ? ob.total : allOrders.length;

        setStats({
          users: userList.length,
          products: productTotal,
          orders: orderTotalCount,
          revenue,
        });
        setOrderStatus(statusCount);
        setCategorySplit(categoryData);
        setOrdersTrend(trendData);
      } catch (err) {
        console.error('Admin dashboard load failed', err);
        toast.error(err.response?.data?.message || 'Could not load dashboard stats. Check API & login.');
      }
    };
    run();
  }, []);

  const cards = [
    { label: 'Users', value: stats.users, to: '/admin/users', icon: '👥', color: 'bg-indigo-500' },
    { label: 'Products', value: stats.products, to: '/admin/products', icon: '📦', color: 'bg-emerald-500' },
    { label: 'Orders', value: stats.orders, to: '/admin/orders', icon: '🛒', color: 'bg-amber-500' },
    { label: 'Revenue', value: formatPrice(stats.revenue), to: '/admin/orders', icon: '💰', color: 'bg-rose-500' },
  ];
  const maxOrderStatus = Math.max(1, ...orderStatus.map((x) => x.value));

  return (
    <div>
      <div className="mb-8 rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-indigo-900 to-fuchsia-900 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Command Center</h1>
        <p className="text-indigo-100">Live overview of your store with quick visual insights and control.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(({ label, value, to, icon, color }) => (
          <Link key={to} to={to} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-2xl mb-4`}>{icon}</div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
            <p className="text-sm text-indigo-600 font-medium mt-2">Manage →</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <section className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Orders by status</h2>
          <div className="space-y-3">
            {orderStatus.map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                  <span className="capitalize">{row.label}</span>
                  <span className="font-semibold text-slate-800">{row.value}</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(row.value / maxOrderStatus) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Top product categories</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySplit} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} label>
                  {categorySplit.map((entry, index) => (
                    <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {categorySplit.length === 0 && <p className="text-sm text-slate-500 mt-2">No products available yet.</p>}
        </section>
      </div>

      <section className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm mt-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Monthly payments (revenue)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fill: '#475569', fontSize: 12 }} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
