import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiShoppingCart, FiUsers, FiBox, FiClock } from 'react-icons/fi';
import { apiGetDashboardStats } from '../api';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-white text-2xl flex-shrink-0`}>{icon}</div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{value}</p>
        </div>
    </div>
);

const statusColor = { Pending: 'bg-amber-100 text-amber-700', Processing: 'bg-blue-100 text-blue-700', Shipped: 'bg-indigo-100 text-indigo-700', Delivered: 'bg-green-100 text-green-700', Cancelled: 'bg-red-100 text-red-700' };

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiGetDashboardStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
            </div>
            <div className="h-80 bg-slate-200 rounded-2xl" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-800">Dashboard Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard title="Total Sales" value={`₹${stats?.totalSales?.toFixed(2) || '0.00'}`} icon={<FiDollarSign />} color="bg-blue-500" />
                <StatCard title="Total Orders" value={stats?.totalOrders ?? 0} icon={<FiShoppingCart />} color="bg-emerald-500" />
                <StatCard title="Customers" value={stats?.totalUsers ?? 0} icon={<FiUsers />} color="bg-violet-500" />
                <StatCard title="Products" value={stats?.totalProducts ?? 0} icon={<FiBox />} color="bg-orange-500" />
            </div>

            {/* Pending Orders Badge */}
            {stats?.pendingOrders > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-5 py-3 flex items-center gap-3 text-sm font-medium">
                    <FiClock className="text-amber-500" />
                    You have <span className="font-extrabold">{stats.pendingOrders}</span> pending order{stats.pendingOrders !== 1 ? 's' : ''} waiting to be processed.
                </div>
            )}

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                                <th className="px-6 py-3 text-left font-semibold">Order</th>
                                <th className="px-6 py-3 text-left font-semibold">Customer</th>
                                <th className="px-6 py-3 text-left font-semibold">Date</th>
                                <th className="px-6 py-3 text-left font-semibold">Amount</th>
                                <th className="px-6 py-3 text-left font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(stats?.recentOrders || []).map(order => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-blue-600">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800">{order.customerName}</p>
                                        <p className="text-slate-400 text-xs">{order.customerEmail}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">₹{order.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[order.status] || 'bg-slate-100 text-slate-600'}`}>{order.status}</span>
                                    </td>
                                </tr>
                            ))}
                            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400">No orders yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
