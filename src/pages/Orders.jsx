import React, { useState, useEffect, useMemo } from 'react';
import { FiChevronDown, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import { apiGetAllOrders, apiUpdateOrderStatus } from '../api';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const statusColor = { Pending: 'bg-amber-100 text-amber-700', Processing: 'bg-blue-100 text-blue-700', Shipped: 'bg-indigo-100 text-indigo-700', Delivered: 'bg-green-100 text-green-700', Cancelled: 'bg-red-100 text-red-700' };

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date_desc');
    const [updating, setUpdating] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchOrders = () => {
        setLoading(true);
        apiGetAllOrders(filter).then(data => {
            setOrders(data);
        }).catch(console.error).finally(() => setLoading(false));
    };

    useEffect(() => { fetchOrders(); }, [filter]);

    // Reset page to 1 on filter/search change
    useEffect(() => { setCurrentPage(1); }, [searchQuery, sortBy, filter]);

    const handleStatusChange = async (orderId, newStatus, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm(`Are you sure you want to change this order's status to ${newStatus}?`)) return;
        setUpdating(orderId);
        try {
            await apiUpdateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) { alert(err.message); }
        finally { setUpdating(null); }
    };

    // Calculate Search & Sort
    const processedOrders = useMemo(() => {
        let result = [...orders];

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.id.toString().includes(q) ||
                (o.user?.name || '').toLowerCase().includes(q) ||
                (o.deliveryName || '').toLowerCase().includes(q) ||
                (o.user?.email || '').toLowerCase().includes(q)
            );
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'date_desc') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'date_asc') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'total_desc') return b.totalAmount - a.totalAmount;
            if (sortBy === 'total_asc') return a.totalAmount - b.totalAmount;
            return 0;
        });

        return result;
    }, [orders, searchQuery, sortBy]);

    // Calculate pagination slices
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return processedOrders.slice(start, start + pageSize);
    }, [processedOrders, currentPage]);

    const totalPages = Math.ceil(processedOrders.length / pageSize) || 1;

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between gap-4 items-start">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Orders</h1>
                    <p className="text-slate-500 text-sm">{processedOrders.length} orders found</p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                    {/* Search & Sort */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 w-full sm:w-auto"
                        >
                            <option value="date_desc">Newest First</option>
                            <option value="date_asc">Oldest First</option>
                            <option value="total_desc">Highest Total</option>
                            <option value="total_asc">Lowest Total</option>
                        </select>
                    </div>

                    {/* Filter */}
                    <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 w-full sm:w-auto overflow-x-auto custom-scrollbar">
                        <button onClick={() => setFilter('')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === '' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>All</button>
                        {STATUSES.map(s => (
                            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === s ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>{s}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                                <th className="px-6 py-3 text-left font-semibold">Order</th>
                                <th className="px-6 py-3 text-left font-semibold">Customer</th>
                                <th className="px-6 py-3 text-left font-semibold">Items</th>
                                <th className="px-6 py-3 text-left font-semibold">Total</th>
                                <th className="px-6 py-3 text-left font-semibold">Date</th>
                                <th className="px-6 py-3 text-left font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(6)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-3 bg-slate-200 rounded" /></td>)}
                                    </tr>
                                ))
                            ) : paginatedOrders.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No orders found matching your criteria.</td></tr>
                            ) : paginatedOrders.map(order => (
                                <React.Fragment key={order.id}>
                                    <tr
                                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedOrderId === order.id ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <td className="px-6 py-4 font-semibold text-blue-600">#{order.id}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-800">{order.user?.name || order.deliveryName}</p>
                                            <p className="text-slate-400 text-xs">{order.user?.email || ''}</p>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">₹{order.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td className="px-6 py-4">
                                            <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                                                <select
                                                    value={order.status}
                                                    disabled={updating === order.id}
                                                    onChange={e => handleStatusChange(order.id, e.target.value, e)}
                                                    className={`appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-bold cursor-pointer focus:outline-none transition-all ${statusColor[order.status] || 'bg-slate-100 text-slate-600'} ${updating === order.id ? 'opacity-50' : ''}`}
                                                >
                                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                                <FiChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedOrderId === order.id && (
                                        <tr>
                                            <td colSpan={6} className="px-0 py-0 border-b border-slate-100 bg-slate-50/50">
                                                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                                                        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Order Items</h4>
                                                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                            {order.items?.map(item => {
                                                                const imageUrl = item.product?.thumbnailUrl ? (item.product.thumbnailUrl.startsWith('http') ? item.product.thumbnailUrl : `http://localhost:5200${item.product.thumbnailUrl}`) : 'https://via.placeholder.com/150';
                                                                return (
                                                                    <div key={item.id} className="flex gap-4 items-center p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                                                        <img src={imageUrl} alt={item.product?.name} className="w-14 h-14 object-cover rounded-md border border-slate-100 bg-white" />
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="font-semibold text-slate-800 text-sm truncate" title={item.product?.name}>{item.product?.name || `Product #${item.productId}`}</p>
                                                                            <p className="text-xs text-slate-500 mt-0.5">{item.product?.category?.name || 'General'}</p>
                                                                            <p className="text-xs font-medium text-slate-600 mt-1">Qty: <span className="font-bold">{item.quantity}</span> × ₹{item.unitPrice.toFixed(2)}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="font-bold text-slate-800 text-sm">₹{(item.unitPrice * item.quantity).toFixed(2)}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-sm">
                                                            <span className="font-semibold text-slate-600">Total Charged</span>
                                                            <span className="font-extrabold text-blue-600 text-lg">₹{order.totalAmount.toFixed(2)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                                                            <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Customer Details</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex items-center"><span className="w-24 text-slate-500">Name:</span> <span className="font-medium text-slate-800">{order.user?.name || '-'}</span></div>
                                                                <div className="flex items-center"><span className="w-24 text-slate-500">Email:</span> <span className="font-medium text-slate-800">{order.user?.email || '-'}</span></div>
                                                                <div className="flex items-center"><span className="w-24 text-slate-500">Phone:</span> <span className="font-medium text-slate-800">{order.user?.phone || order.deliveryPhone || '-'}</span></div>
                                                                <div className="flex items-center"><span className="w-24 text-slate-500">Account:</span> <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${order.user ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{order.user ? 'Registered' : 'Guest'}</span></div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                                                            <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Shipping & Delivery</h4>
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex items-start"><span className="w-24 text-slate-500 shrink-0">Deliver To:</span> <span className="font-medium text-slate-800">{order.deliveryName}</span></div>
                                                                <div className="flex items-start"><span className="w-24 text-slate-500 shrink-0">Address:</span> <span className="text-slate-700">{order.deliveryStreet}, {order.deliveryCity} - <span className="font-medium">{order.deliveryZip}</span></span></div>
                                                                {order.deliveryPhone && <div className="flex items-start"><span className="w-24 text-slate-500 shrink-0">Phone:</span> <span className="font-medium text-slate-800">{order.deliveryPhone}</span></div>}
                                                                <div className="flex items-center mt-3 pt-3 border-t border-slate-100"><span className="w-24 text-slate-500">Method:</span> <span className="font-semibold text-slate-800">{order.paymentMethod}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <p className="text-xs text-slate-500 font-medium">
                            Showing <span className="font-bold text-slate-700">{Math.min((currentPage - 1) * pageSize + 1, processedOrders.length)}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * pageSize, processedOrders.length)}</span> of <span className="font-bold text-slate-700">{processedOrders.length}</span> results
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiChevronLeft size={16} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'border border-slate-200 text-slate-600 hover:bg-white hover:text-blue-600'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
