import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { apiGetCategories, apiCreateCategory, apiUpdateCategory, apiDeleteCategory } from '../api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'add' | 'edit'
    const [form, setForm] = useState({ name: '' });
    const [editId, setEditId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const fetchCategories = () => {
        setLoading(true);
        apiGetCategories().then(setCategories).catch(err => toast.error(err.message)).finally(() => setLoading(false));
    };

    useEffect(() => { fetchCategories(); }, []);

    const openAdd = () => { setForm({ name: '' }); setEditId(null); setModal('add'); };
    const openEdit = (c) => { setForm({ name: c.name }); setEditId(c.id); setModal('edit'); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const toastId = toast.loading(modal === 'add' ? 'Adding category...' : 'Updating category...');
        try {
            if (modal === 'add') {
                await apiCreateCategory(form);
                toast.success('Category added successfully!', { id: toastId });
            } else {
                await apiUpdateCategory(editId, form);
                toast.success('Category updated successfully!', { id: toastId });
            }
            setModal(null);
            fetchCategories();
        } catch (err) {
            toast.error(err.message || 'Failed to save category', { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const toastId = toast.loading('Deleting category...');
        try {
            await apiDeleteCategory(id);
            toast.success('Category deleted!', { id: toastId });
            setCategories(prev => prev.filter(c => c.id !== id));
            setDeleteConfirm(null);
        } catch (err) {
            toast.error(err.message || 'Failed to delete category', { id: toastId });
        }
    };

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Categories</h1>
                    <p className="text-slate-500 text-sm">Manage product categories</p>
                </div>
                <button onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all">
                    <FiPlus /> Add Category
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                            <th className="px-6 py-4 text-left font-semibold">ID</th>
                            <th className="px-6 py-4 text-left font-semibold">Category Name</th>
                            <th className="px-6 py-4 text-left font-semibold w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4" colSpan={3}><div className="h-4 bg-slate-200 rounded w-full" /></td>
                                </tr>
                            ))
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No categories found.</td></tr>
                        ) : categories.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-500 font-medium">#{c.id}</td>
                                <td className="px-6 py-4 font-semibold text-slate-800">{c.name}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEdit(c)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><FiEdit2 size={15} /></button>
                                        <button onClick={() => setDeleteConfirm(c)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><FiTrash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {modal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">{modal === 'add' ? 'Add Category' : 'Edit Category'}</h2>
                            <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Category Name</label>
                                <input value={form.name} onChange={e => setForm({ name: e.target.value })} required autoFocus
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={submitting}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60">
                                    {submitting ? 'Saving...' : 'Save Category'}
                                </button>
                                <button type="button" onClick={() => setModal(null)} className="px-5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-medium">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Category?</h3>
                        <p className="text-slate-500 text-sm mb-5">Are you sure you want to delete "{deleteConfirm.name}"?</p>
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

export default Categories;
