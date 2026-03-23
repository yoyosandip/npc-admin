import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { apiGetProducts, apiGetCategories, apiDeleteProduct } from '../api';

const Products = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchProducts = () => {
        setLoading(true);
        apiGetProducts(search).then(setProducts).catch(err => toast.error('Failed to load products: ' + err.message)).finally(() => setLoading(false));
    };

    useEffect(() => { apiGetCategories().then(setCategories).catch(console.error); }, []);
    useEffect(() => { fetchProducts(); }, [search]);

    const handleDelete = async (id) => {
        const toastId = toast.loading('Deleting product...');
        try {
            await apiDeleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
            setDeleteConfirm(null);
            toast.success('Product deleted successfully', { id: toastId });
        }
        catch (err) { toast.error(err.message, { id: toastId }); }
    };

    const statusColor = { Active: 'bg-green-100 text-green-700', 'Low Stock': 'bg-amber-100 text-amber-700', 'Out of Stock': 'bg-red-100 text-red-700' };

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Products</h1>
                    <p className="text-slate-500 text-sm">{products.length} products in your store</p>
                </div>
                <button onClick={() => navigate('/products/add')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all self-start">
                    <FiPlus />Add Product
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                    className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm" />
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                                <th className="px-6 py-3 text-left font-semibold">Product</th>
                                <th className="px-6 py-3 text-left font-semibold">Category</th>
                                <th className="px-6 py-3 text-left font-semibold">Price</th>
                                <th className="px-6 py-3 text-left font-semibold">Stock</th>
                                <th className="px-6 py-3 text-left font-semibold">Status</th>
                                <th className="px-6 py-3 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4" colSpan={6}><div className="h-4 bg-slate-200 rounded w-full" /></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No products found. <button onClick={() => navigate('/products/add')} className="text-blue-600 outline-none hover:underline ml-1 font-semibold">Add one</button></td></tr>
                            ) : products.map(p => {
                                let img = 'https://via.placeholder.com/60';
                                if (p.thumbnailUrl) {
                                    img = p.thumbnailUrl.startsWith('http') ? p.thumbnailUrl : `http://localhost:5200${p.thumbnailUrl}`;
                                } else {
                                    try { const imgs = JSON.parse(p.imageUrls || '[]'); if (imgs.length > 0) img = imgs[0].startsWith('http') ? imgs[0] : `http://localhost:5200${imgs[0]}`; } catch { }
                                }
                                return (
                                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={img} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200" onError={e => e.target.src = 'https://via.placeholder.com/60'} />
                                                <div>
                                                    <p className="font-semibold text-slate-800 line-clamp-1">{p.name}</p>
                                                    <p className="text-slate-400 text-xs line-clamp-1">{p.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{p.category?.name || '—'}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">₹{p.price.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-slate-600">{p.stock}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor[p.status] || 'bg-slate-100 text-slate-600'}`}>{p.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => navigate(`/products/edit/${p.id}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FiEdit2 size={15} /></button>
                                                <button onClick={() => setDeleteConfirm(p)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Product?</h3>
                        <p className="text-slate-500 text-sm mb-5">Are you sure you want to delete <span className="font-semibold text-slate-700">"{deleteConfirm.name}"</span>? This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-xl transition-all">Delete</button>
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
