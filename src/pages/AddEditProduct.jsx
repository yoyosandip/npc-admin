import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiImage, FiUploadCloud } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { apiGetProduct, apiCreateProduct, apiUpdateProduct, apiGetCategories, apiUploadProductImages } from '../api';

const AddEditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        name: '', description: '', price: '', stock: '',
        categoryId: '', status: 'Active',
        discountPercentage: 0, isPopular: false, imageUrls: [], thumbnailUrl: ''
    });

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [sliderFiles, setSliderFiles] = useState([]);

    useEffect(() => {
        apiGetCategories().then(setCategories).catch(err => toast.error("Failed to load categories"));

        if (isEdit) {
            apiGetProduct(id)
                .then(p => {
                    let imgs = [];
                    try { imgs = JSON.parse(p.imageUrls || '[]'); } catch { imgs = [p.imageUrls].filter(Boolean); }
                    setForm({
                        name: p.name,
                        description: p.description,
                        price: p.price,
                        stock: p.stock,
                        categoryId: p.categoryId,
                        status: p.status,
                        discountPercentage: p.discountPercentage || 0,
                        isPopular: p.isPopular || false,
                        thumbnailUrl: p.thumbnailUrl || '',
                        imageUrls: imgs
                    });
                })
                .catch(err => toast.error(err.message))
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const toastId = toast.loading(isEdit ? 'Updating product...' : 'Creating product...');
        try {
            let finalThumbnailUrl = form.thumbnailUrl;
            if (thumbnailFile) {
                const uploadRes = await apiUploadProductImages([thumbnailFile]);
                if (uploadRes.urls && uploadRes.urls.length > 0) {
                    finalThumbnailUrl = uploadRes.urls[0];
                }
            }

            let finalImageUrls = [...form.imageUrls];
            if (sliderFiles && sliderFiles.length > 0) {
                const uploadRes = await apiUploadProductImages(sliderFiles);
                if (uploadRes.urls) {
                    finalImageUrls = uploadRes.urls; // replace existing for simplicity
                }
            }

            const payload = {
                ...form,
                price: parseFloat(form.price),
                stock: parseInt(form.stock),
                categoryId: parseInt(form.categoryId),
                discountPercentage: parseFloat(form.discountPercentage),
                thumbnailUrl: finalThumbnailUrl,
                imageUrls: JSON.stringify(finalImageUrls)
            };

            if (isEdit) {
                await apiUpdateProduct(id, payload);
                toast.success('Product updated successfully!', { id: toastId });
            } else {
                await apiCreateProduct(payload);
                toast.success('Product created successfully!', { id: toastId });
            }
            setTimeout(() => navigate('/products'), 1000);
        } catch (err) {
            toast.error(err.message || 'Failed to save product', { id: toastId });
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading product details...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <Toaster position="top-right" />
            <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors">
                <FiArrowLeft /> Back to Products
            </button>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                <h1 className="text-2xl font-extrabold text-slate-800 mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Product Name</label>
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Price ($)</label>
                            <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Stock Quantity</label>
                            <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Category</label>
                            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Active</option>
                                <option>Low Stock</option>
                                <option>Out of Stock</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Discount Percentage (%)</label>
                            <input type="number" step="0.1" min="0" max="100" value={form.discountPercentage} onChange={e => setForm({ ...form, discountPercentage: e.target.value })}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="flex items-center mt-6">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input type="checkbox" checked={form.isPopular} onChange={e => setForm({ ...form, isPopular: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                                <span className="text-sm font-semibold text-slate-700">Flag as Popular Product</span>
                            </label>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Image Upload Section */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Display Thumbnail</h3>
                            <p className="text-sm text-slate-500 mb-4">This is the primary image shown in lists and the website homepage.</p>
                            <div className="flex items-center gap-4">
                                {(form.thumbnailUrl || thumbnailFile) && (
                                    <div className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
                                        <img
                                            src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : (form.thumbnailUrl.startsWith('http') ? form.thumbnailUrl : `http://localhost:5200${form.thumbnailUrl}`)}
                                            alt="Thumbnail Preview"
                                            className="w-full h-full object-cover"
                                            onError={e => e.target.src = 'https://via.placeholder.com/100'}
                                        />
                                    </div>
                                )}
                                <label className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-blue-600 px-5 py-3 rounded-xl cursor-pointer transition-colors font-semibold border-2 border-blue-100 hover:border-blue-200">
                                    <FiImage /> {thumbnailFile || form.thumbnailUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}
                                    <input type="file" accept="image/*" className="hidden" onChange={e => setThumbnailFile(e.target.files[0])} />
                                </label>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Product Slider Images</h3>
                            <p className="text-sm text-slate-500 mb-4">These images appear in the image gallery on the product details page. You can select multiple files at once.</p>

                            <div className="space-y-4">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl hover:bg-slate-50 hover:border-blue-400 cursor-pointer transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FiUploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                                        <p className="text-sm text-slate-600 font-semibold">Click to upload multiple images</p>
                                    </div>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => setSliderFiles(Array.from(e.target.files))} />
                                </label>

                                {/* Previews */}
                                {(sliderFiles.length > 0 || form.imageUrls.length > 0) && (
                                    <div className="flex flex-wrap gap-4 mt-4">
                                        {sliderFiles.length > 0
                                            ? sliderFiles.map((file, idx) => (
                                                <div key={idx} className="relative w-24 h-24 transition-transform hover:scale-105">
                                                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm" />
                                                </div>
                                            ))
                                            : form.imageUrls.map((url, idx) => (
                                                <div key={idx} className="relative w-24 h-24 transition-transform hover:scale-105">
                                                    <img src={url.startsWith('http') ? url : `http://localhost:5200${url}`} alt="Preview" className="w-full h-full object-cover rounded-xl border border-slate-200 shadow-sm" />
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex justify-end gap-3 mt-8">
                        <button type="button" onClick={() => navigate('/products')} className="px-6 py-3 font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="px-8 py-3 font-extrabold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-lg shadow-blue-600/20">
                            {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditProduct;
