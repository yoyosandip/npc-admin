import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiHome, FiBox, FiGrid, FiShoppingCart, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';

const AdminLayout = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('adminToken');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

    // Auth guard
    if (!token) {
        navigate('/login', { replace: true });
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/login');
    };

    const menuItems = [
        { path: '/', name: 'Dashboard', icon: <FiHome size={18} /> },
        { path: '/products', name: 'Products', icon: <FiBox size={18} /> },
        { path: '/categories', name: 'Categories', icon: <FiGrid size={18} /> },
        { path: '/orders', name: 'Orders', icon: <FiShoppingCart size={18} /> },
        { path: '/customers', name: 'Customers', icon: <FiUsers size={18} /> },
        { path: '/settings', name: 'Settings', icon: <FiSettings size={18} /> },
    ];

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-xl font-extrabold text-white tracking-tight">Narayan Admin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map(({ path, name, icon }) => (
                        <NavLink key={path} to={path} end={path === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
                            }>
                            {icon}<span>{name}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
                            {adminUser?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{adminUser?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-400 truncate">{adminUser?.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all text-sm px-3 py-2 rounded-xl">
                        <FiLogOut size={15} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">Admin Portal</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                            {adminUser?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <span className="text-sm font-semibold text-slate-700 hidden sm:block">{adminUser?.name || 'Admin User'}</span>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
