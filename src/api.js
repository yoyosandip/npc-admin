const BASE_URL = 'http://narayanpccare.runasp.net';

const getToken = () => localStorage.getItem('adminToken');

export const apiFetch = async (path, options = {}) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        let errorMsg = `Request failed: ${res.status}`;
        try {
            const data = await res.json();
            errorMsg = data.message || errorMsg;
        } catch { }
        throw new Error(errorMsg);
    }

    if (res.status === 204) return null;
    return res.json();
};

export const apiAdminLogin = (email, password) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const apiGetDashboardStats = () => apiFetch('/api/dashboard/stats');

export const apiGetProducts = (search = '') => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    return apiFetch(`/api/products?${params.toString()}`);
};
export const apiGetCategories = () => apiFetch('/api/categories');
export const apiCreateCategory = (category) =>
    apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(category) });
export const apiUpdateCategory = (id, category) =>
    apiFetch(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(category) });
export const apiDeleteCategory = (id) =>
    apiFetch(`/api/categories/${id}`, { method: 'DELETE' });

export const apiUploadProductImages = async (files) => {
    const token = getToken();
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    const res = await fetch(`${BASE_URL}/api/products/upload-multiple`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
    });
    if (!res.ok) throw new Error('Files upload failed');
    return res.json();
};
export const apiGetProduct = (id) => apiFetch(`/api/products/${id}`);
export const apiCreateProduct = (product) =>
    apiFetch('/api/products', { method: 'POST', body: JSON.stringify(product) });
export const apiUpdateProduct = (id, product) =>
    apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(product) });
export const apiDeleteProduct = (id) =>
    apiFetch(`/api/products/${id}`, { method: 'DELETE' });

export const apiGetAllOrders = (status = '') => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    return apiFetch(`/api/orders?${params.toString()}`);
};
export const apiUpdateOrderStatus = (id, status) =>
    apiFetch(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

export const apiGetAllUsers = () => apiFetch('/api/users');
